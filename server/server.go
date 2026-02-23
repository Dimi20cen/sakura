package server

import (
	"encoding/json"
	"fmt"
	"sakura/mango"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/Pallinder/go-randomdata"
	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/mitchellh/mapstructure"
	"github.com/rs/cors"
	"github.com/urfave/negroni"
)

type (
	Registry interface {
		Init()
		Register(string, string) error
		Heartbeat(string) error
		CreateUser(string, string) error
		CreateUserWithEmail(string, string, string) error
		CheckIfUserExists(string) (bool, error)
		CheckIfUserEmailExists(string) (map[string]interface{}, error)
		UpdateUsername(string, string) error
		UpdateEmail(string, string) error
		CountUsers() (int64, error)
	}
	Server struct {
		hubs     sync.Map
		registry Registry
	}

	GameResponse struct {
		Id         string `msgpack:"id"`
		NumPlayers int    `msgpack:"numPlayers"`
	}
)

func NewServer() *Server {
	server := &Server{}
	server.registry = &mango.MangoRegistry{}
	server.registry.Init()
	return server
}

func (s *Server) Run() {
	r := mux.NewRouter()

	r.HandleFunc("/heartbeat", s.handleHeartbeat).Methods("GET")
	r.HandleFunc("/socket", s.socketHandler)
	r.HandleFunc("/games", s.handleGame).Methods("GET", "POST")
	r.HandleFunc("/anon", s.getAnonymousJWT).Methods("GET", "POST")
	r.HandleFunc("/verify", s.verifyUser).Methods("GET")
	r.HandleFunc("/register", s.registerUser).Methods("POST")

	http.Handle("/", r)

	n := negroni.New()
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("FRONTEND_URL")},
		AllowCredentials: true,
		AllowedHeaders:   []string{"content-type", "Authorization"},
		// Enable Debugging for testing, consider disabling in production
		Debug: false,
	})
	n.Use(c)
	n.Use(negroni.NewLogger())
	n.Use(negroni.NewRecovery())
	n.Use(&JWTMiddleware{Header: "Authorization"})

	n.UseHandler(r)

	address := fmt.Sprintf("%s:%s", os.Getenv("HOST"), os.Getenv("PORT"))
	log.Println("Starting the SAKURA backend on", address)
	http.ListenAndServe(address, n)
}

func (s *Server) handleHeartbeat(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func (s *Server) handleGame(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		s.createGame(w, r)
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) createGame(w http.ResponseWriter, r *http.Request) {
	gameID, err := GenerateRandomString(4)
	if err != nil {
		WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not generate game ID"})
		return
	}

	var data map[string]interface{}
	err = json.NewDecoder(r.Body).Decode(&data)
	if err == nil {
		mapstructure.Decode(data["gameId"], &gameID)
		if len(gameID) > 4 {
			WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Game ID must be 4 characters or less"})
			return
		}
	}

	if _, ok := s.hubs.Load(gameID); ok {
		WriteJson(w, http.StatusConflict, map[string]string{"error": "Game already exists"})
	} else {
		// TODO: Make sure user has not created too many games
		s.NewWsHub(gameID)
		WriteJson(w, http.StatusOK, map[string]string{"id": gameID})
	}
}

func (s *Server) registerUser(w http.ResponseWriter, r *http.Request) {
	var claims jwt.MapClaims
	mapstructure.Decode(r.Context().Value(ContextKey("claims")), &claims)

	if claims["oauth"] != "google" || claims["iss"] != "urn:sakura:issuer" {
		WriteJson(w, http.StatusNotFound, map[string]string{"error": "Invalid Auth token"})
		return
	}

	user, _ := s.registry.CheckIfUserEmailExists(claims["email"].(string))
	if user != nil {
		token, err := GenerateJWT(user["id"].(string), user["username"].(string))

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		WriteJson(w, http.StatusOK, map[string]string{"token": token})
		return
	}

	var data interface{}
	json.NewDecoder(r.Body).Decode(&data)

	if val, ok := data.(map[string]interface{})["anonToken"]; ok && val != "" {
		token, err := VerifyJWT(val.(string))
		if err != nil {
			WriteJson(w, http.StatusNotFound, map[string]string{"error": "Invalid Anon Auth token"})
		}

		id := token.Claims.(jwt.MapClaims)["id"].(string)
		username := token.Claims.(jwt.MapClaims)["username"].(string)
		err = s.registry.UpdateEmail(id, claims["email"].(string))
		if err != nil {
			WriteJson(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		} else {
			returnToken, err := GenerateJWT(id, username)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			WriteJson(w, http.StatusOK, map[string]string{"token": returnToken})
		}
	} else {
		id := uuid.New().String()
		username := randomdata.SillyName()
		if err := s.registry.CreateUserWithEmail(id, username, claims["email"].(string)); err != nil {
			WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not create user"})
			return
		}

		token, err := GenerateJWT(id, username)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		WriteJson(w, http.StatusOK, map[string]string{"token": token})
	}
}

func (s *Server) verifyUser(w http.ResponseWriter, r *http.Request) {
	var id, username string
	mapstructure.Decode(r.Context().Value(ContextKey("username")), &username)
	mapstructure.Decode(r.Context().Value(ContextKey("id")), &id)

	if id == "" {
		WriteJson(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	exists, _ := s.registry.CheckIfUserExists(id)
	if exists {
		WriteJson(w, http.StatusOK, map[string]string{"username": username})
	} else {
		WriteJson(w, http.StatusNotFound, map[string]string{"error": "User not found"})
	}
}

func (s *Server) getAnonymousJWT(w http.ResponseWriter, r *http.Request) {
	var id string
	providedId := ""
	username := randomdata.SillyName()
	customUsername := false

	if r.Method == "POST" {
		var data map[string]interface{}
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			return
		}
		if _, ok := data["username"]; ok {
			mapstructure.Decode(data["username"], &username)
			customUsername = true
		}
		mapstructure.Decode(data["id"], &providedId)
	}

	if !IsValidUsername(username) {
		WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Invalid username"})
		return
	}

	if providedId == "" {
		if !customUsername && len(defaultProfiles) > 0 {
			assigned := false
			for _, profile := range defaultProfiles {
				exists, err := s.registry.CheckIfUserExists(profile.ID)
				if err != nil {
					WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not check user"})
					return
				}
				if !exists {
					id = profile.ID
					username = profile.Username
					if err := s.registry.CreateUser(id, username); err != nil {
						WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not create user"})
						return
					}
					assigned = true
					break
				}
			}

			// If all default profiles already exist, reuse one round-robin.
			if !assigned {
				userCount, err := s.registry.CountUsers()
				if err != nil {
					WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not count users"})
					return
				}

				profile := getDefaultProfile(userCount)
				id = profile.ID
				username = profile.Username

				if err := s.registry.UpdateUsername(id, username); err != nil {
					WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not update user"})
					return
				}
			}
		} else {
			if profile, ok := getDefaultProfileByUsername(username); ok {
				id = profile.ID
				username = profile.Username
				exists, err := s.registry.CheckIfUserExists(id)
				if err != nil {
					WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not check user"})
					return
				}

				if !exists {
					if err := s.registry.CreateUser(id, username); err != nil {
						WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not create user"})
						return
					}
				} else if err := s.registry.UpdateUsername(id, username); err != nil {
					WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not update user"})
					return
				}
			} else {
				id = uuid.New().String()
				if err := s.registry.CreateUser(id, username); err != nil {
					WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Could not create user"})
					return
				}
			}
		}
	} else {
		id = providedId
		if err := s.registry.UpdateUsername(providedId, username); err != nil {
			WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Error updating username"})
			return
		}
	}

	token, err := GenerateJWT(id, username)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	WriteJson(w, http.StatusOK, map[string]string{"token": token})
}

func (s *Server) socketHandler(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	gameId := queryParams.Get("id")

	if hub, ok := s.hubs.Load(gameId); ok {
		StartWs(hub.(*WsHub), w, r)
	} else {
		RejectWs(w, r, http.StatusNotFound, "E738: Game not found. Try refresing this page.")
	}
}

func (s *Server) RemoveHub(id string) {
	s.hubs.Delete(id)
}

func RunServer() {
	server := NewServer()
	err := server.registry.Register(os.Getenv("SERVER_URL"), os.Getenv("AWS_REGION"))
	if err != nil {
		panic(err)
	}

	ticker := time.NewTicker(10 * time.Second)
	cleanupTicker := time.NewTicker(30 * time.Second)
	cleanupStore := &mango.MangoStore{}
	go func(ticker *time.Ticker) {
		for {
			<-ticker.C
			server.registry.Heartbeat(os.Getenv("SERVER_URL"))
		}
	}(ticker)
	go func(ticker *time.Ticker) {
		for {
			<-ticker.C
			deletedPrestart, deletedPlaying, err := cleanupStore.CleanupInactiveGames()
			if err != nil {
				log.Println("cleanup error:", err)
				continue
			}
			if deletedPrestart > 0 || deletedPlaying > 0 {
				log.Printf(
					"cleanup removed pre-start=%d playing=%d",
					deletedPrestart,
					deletedPlaying,
				)
			}
		}
	}(cleanupTicker)
	server.Run()
}
