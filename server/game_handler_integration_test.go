package server

import (
	"errors"
	"sakura/entities"
	"sakura/game"
	"sakura/maps"
	"testing"
	"time"

	"github.com/vmihailenco/msgpack/v5"
)

type testGameStore struct {
	lastSettings []byte
}

func (s *testGameStore) Init(id string) error { return nil }
func (s *testGameStore) CreateGameIfNotExists(id string) error {
	return nil
}
func (s *testGameStore) CreateGameStateIfNotExists(id string, state []byte) error {
	return nil
}
func (s *testGameStore) WriteGameServer(id string) error { return nil }
func (s *testGameStore) WriteGameStarted(id string) error {
	return nil
}
func (s *testGameStore) WriteGameFinished(id string) error {
	return nil
}
func (s *testGameStore) WriteGameCompletedForUser(id string) error {
	return nil
}
func (s *testGameStore) WriteGamePlayers(id string, numPlayers int32) error {
	return nil
}
func (s *testGameStore) WriteGameActivePlayers(id string, numPlayers int32, host string) error {
	return nil
}
func (s *testGameStore) WriteGamePresence(
	id string,
	connectedPlayers int32,
	connectedHumans int32,
	host string,
	hostId string,
	lastHumanSeenAt *time.Time,
) error {
	return nil
}
func (s *testGameStore) WriteGameParticipants(id string, participantIds []string) error {
	return nil
}
func (s *testGameStore) WriteGamePrivacy(id string, private bool) error {
	return nil
}
func (s *testGameStore) WriteGameSettings(id string, settings []byte) error {
	s.lastSettings = append([]byte(nil), settings...)
	return nil
}
func (s *testGameStore) WriteJournalEntries(id string, entries [][]byte) error {
	return nil
}
func (s *testGameStore) WriteGameState(id string, state []byte) error {
	return nil
}
func (s *testGameStore) WriteGameIdForUser(gameId, userId string, settings *entities.GameSettings) error {
	return nil
}
func (s *testGameStore) ReadJournal(id string) ([][]byte, error) {
	return nil, nil
}
func (s *testGameStore) ReadGamePlayers(id string) (int, error) {
	return 0, errors.New("not found")
}
func (s *testGameStore) ReadUser(id string) (map[string]interface{}, error) {
	return map[string]interface{}{}, nil
}
func (s *testGameStore) GetOfficalMapNames() []string {
	return []string{}
}
func (s *testGameStore) GetAllMapNamesForUser(userId string, exclude bool) ([]string, error) {
	return []string{}, nil
}
func (s *testGameStore) GetMap(name string) *entities.MapDefinition {
	return nil
}
func (s *testGameStore) CheckIfJournalExists(id string) (bool, error) {
	return false, nil
}
func (s *testGameStore) TerminateGame(id string) error { return nil }

func stopServerGameTicker(g *game.Game) {
	if g == nil || g.TickerStop == nil {
		return
	}
	select {
	case g.TickerStop <- true:
	default:
	}
}

func newGameWsClient(t *testing.T, mode entities.GameMode) (*WsClient, *entities.Player) {
	t.Helper()

	settings := entities.GameSettings{
		Mode:          mode,
		MapName:       maps.BaseMapName,
		MapDefn:       maps.GetBaseMap(),
		DiscardLimit:  7,
		VictoryPoints: 10,
		MaxPlayers:    4,
		Speed:         entities.Speed60s,
	}
	if mode == entities.Seafarers {
		defn := maps.GetMapByName(maps.SeafarersHeadingForNewShores)
		if defn == nil {
			t.Fatal("missing seafarers map")
		}
		settings.MapName = maps.SeafarersHeadingForNewShores
		settings.MapDefn = defn
		settings.VictoryPoints = 12
	}

	hub := &WsHub{
		Game: game.Game{
			Store:            &testGameStore{},
			Settings:         settings,
			AdvancedSettings: entities.AdvancedSettings{RerollOn7: false},
		},
	}
	if _, err := hub.Game.Initialize("ws-handler-test", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopServerGameTicker(&hub.Game)
	t.Cleanup(func() {
		stopServerGameTicker(&hub.Game)
	})

	player := hub.Game.CurrentPlayer
	ws := &WsClient{
		Hub:    hub,
		Player: player,
	}
	return ws, player
}

type msgEnvelope struct {
	Type     string `msgpack:"t"`
	Location string `msgpack:"l"`
}

func readMessage(t *testing.T, ch <-chan []byte) msgEnvelope {
	t.Helper()
	select {
	case raw := <-ch:
		var msg msgEnvelope
		if err := msgpack.Unmarshal(raw, &msg); err != nil {
			t.Fatalf("failed to decode msgpack message: %v", err)
		}
		return msg
	case <-time.After(250 * time.Millisecond):
		t.Fatal("timed out waiting for message")
	}
	return msgEnvelope{}
}

func TestHandleGameBuildRoadCommandPath(t *testing.T) {
	ws, player := newGameWsClient(t, entities.Base)
	g := &ws.Hub.Game

	vertexChoices := player.GetBuildLocationsSettlement(g.Graph, true, false)
	if len(vertexChoices) == 0 {
		t.Fatal("expected settlement choices")
	}
	if err := g.BuildSettlement(player, vertexChoices[0].C); err != nil {
		t.Fatalf("build settlement failed: %v", err)
	}

	g.InitPhase = false
	g.DiceState = 1
	player.CurrentHand.UpdateResources(10, 10, 10, 10, 10)

	edgeChoices := player.GetBuildLocationsRoad(g.Graph, false)
	if len(edgeChoices) == 0 {
		t.Fatal("expected road choices")
	}
	edge := edgeChoices[0]
	go func() {
		for i := 0; i < 100; i++ {
			if player.PendingAction != nil {
				player.SendExpect(edge.C)
				return
			}
			time.Sleep(2 * time.Millisecond)
		}
	}()

	ws.handleGame(map[string]interface{}{
		"t": "b",
		"o": "r",
	})

	if edge.Placement == nil || edge.Placement.GetType() != entities.BTRoad {
		t.Fatal("road placement was not created by command handler")
	}
}

func TestHandleGameActionResponseForwardsExpect(t *testing.T) {
	ws, player := newGameWsClient(t, entities.Base)

	ws.handleGame(map[string]interface{}{
		"t":       "ar",
		"ar_data": "hello",
	})

	select {
	case got := <-player.Expect:
		if got != "hello" {
			t.Fatalf("unexpected expect payload: %v", got)
		}
	case <-time.After(250 * time.Millisecond):
		t.Fatal("expected action response to be forwarded")
	}
}

func TestStoreSettingsKeepsScenarioVictoryPointsEditable(t *testing.T) {
	store := &testGameStore{}
	hub := &WsHub{
		Game: game.Game{
			ID:    "scenario-settings",
			Store: store,
			Settings: entities.GameSettings{
				Mode:          entities.Seafarers,
				MapName:       maps.SeafarersHeadingForNewShores,
				DiscardLimit:  7,
				VictoryPoints: 12,
				MaxPlayers:    4,
				Speed:         entities.Speed60s,
			},
		},
	}

	hub.StoreSettings()

	if got := hub.Game.Settings.VictoryPoints; got != 12 {
		t.Fatalf("expected hub settings victory points to remain editable at 12, got %d", got)
	}
	if len(store.lastSettings) == 0 {
		t.Fatal("expected settings to be persisted")
	}

	var persisted entities.GameSettings
	if err := msgpack.Unmarshal(store.lastSettings, &persisted); err != nil {
		t.Fatalf("failed to decode persisted settings: %v", err)
	}
	if got := persisted.VictoryPoints; got != 12 {
		t.Fatalf("expected persisted settings victory points to remain 12, got %d", got)
	}
}

func TestHandleLobbySetSettingsBroadcastsEditableScenarioVictoryPoints(t *testing.T) {
	store := &testGameStore{}
	player, _ := entities.NewPlayer(entities.Seafarers, "host", "host", 0)
	ws := &WsClient{
		Hub: &WsHub{
			Game: game.Game{
				ID:    "scenario-broadcast",
				Store: store,
				Settings: entities.GameSettings{
					Mode:          entities.Seafarers,
					MapName:       maps.BaseMapName,
					MapDefn:       maps.GetBaseMap(),
					DiscardLimit:  7,
					VictoryPoints: 12,
					MaxPlayers:    4,
					Speed:         entities.Speed60s,
				},
			},
		},
		Player:         player,
		MessageChannel: make(chan []byte, 4),
	}
	ws.Hub.Register(ws)

	ws.handleLobby(map[string]interface{}{
		"t": WsLobbyRequestTypeSetSettings,
		"settings": map[string]interface{}{
			"Mode":          int(entities.Seafarers),
			"MapName":       maps.SeafarersHeadingForNewShores,
			"DiscardLimit":  7,
			"VictoryPoints": 12,
			"MaxPlayers":    4,
			"EnableKarma":   true,
			"CreativeMode":  false,
			"Speed":         entities.Speed60s,
			"Advanced":      false,
		},
	})

	if got := ws.Hub.Game.Settings.VictoryPoints; got != 12 {
		t.Fatalf("expected hub settings victory points to remain editable at 12, got %d", got)
	}

	msg := readMessage(t, ws.MessageChannel)
	if msg.Type != WsLobbyResponseTypeSettings {
		t.Fatalf("expected lobby settings broadcast, got %q", msg.Type)
	}
}

func TestHandleGameInfoRequestPlayerHandSendsSecretState(t *testing.T) {
	ws, player := newGameWsClient(t, entities.Base)

	ws.handleGame(map[string]interface{}{
		"t":  "r",
		"rt": "ph",
	})

	msg := readMessage(t, player.MessageChannel)
	if msg.Type != entities.MessageTypePlayerSecretState {
		t.Fatalf("unexpected message type: %v", msg.Type)
	}
	if msg.Location != entities.WsMsgLocationGame {
		t.Fatalf("unexpected message location: %v", msg.Location)
	}
}

func TestHandleGameTradeDecodeErrorSendsErrorMessage(t *testing.T) {
	ws, player := newGameWsClient(t, entities.Base)

	ws.handleGame(map[string]interface{}{
		"t":     "tr",
		"tt":    "co",
		"offer": "invalid",
	})

	msg := readMessage(t, player.MessageChannel)
	if msg.Type != entities.MessageTypeError {
		t.Fatalf("expected error message, got %v", msg.Type)
	}
}
