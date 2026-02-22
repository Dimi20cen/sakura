package game

import (
	"errors"
	"imperials/entities"
	"imperials/maps"
	"testing"
	"time"
)

type noopStore struct{}

func (s *noopStore) Init(id string) error { return nil }
func (s *noopStore) CreateGameIfNotExists(id string) error {
	return nil
}
func (s *noopStore) CreateGameStateIfNotExists(id string, state []byte) error {
	return nil
}
func (s *noopStore) WriteGameServer(id string) error { return nil }
func (s *noopStore) WriteGameStarted(id string) error {
	return nil
}
func (s *noopStore) WriteGameFinished(id string) error {
	return nil
}
func (s *noopStore) WriteGameCompletedForUser(id string) error {
	return nil
}
func (s *noopStore) WriteGamePlayers(id string, numPlayers int32) error {
	return nil
}
func (s *noopStore) WriteGameActivePlayers(id string, numPlayers int32, host string) error {
	return nil
}
func (s *noopStore) WriteGamePresence(id string, connectedPlayers int32, connectedHumans int32, host string, hostId string, lastHumanSeenAt *time.Time) error {
	return nil
}
func (s *noopStore) WriteGameParticipants(id string, participantIds []string) error {
	return nil
}
func (s *noopStore) WriteGamePrivacy(id string, private bool) error {
	return nil
}
func (s *noopStore) WriteGameSettings(id string, settings []byte) error {
	return nil
}
func (s *noopStore) WriteJournalEntries(id string, entries [][]byte) error {
	return nil
}
func (s *noopStore) WriteGameState(id string, state []byte) error {
	return nil
}
func (s *noopStore) WriteGameIdForUser(gameId, userId string, settings *entities.GameSettings) error {
	return nil
}
func (s *noopStore) ReadJournal(id string) ([][]byte, error) {
	return nil, nil
}
func (s *noopStore) ReadGamePlayers(id string) (int, error) {
	return 0, errors.New("not found")
}
func (s *noopStore) ReadUser(id string) (map[string]interface{}, error) {
	return map[string]interface{}{}, nil
}
func (s *noopStore) GetOfficalMapNames() []string {
	return []string{}
}
func (s *noopStore) GetAllMapNamesForUser(userId string, exclude bool) ([]string, error) {
	return []string{}, nil
}
func (s *noopStore) GetMap(name string) *entities.MapDefinition {
	return nil
}
func (s *noopStore) CheckIfJournalExists(id string) (bool, error) {
	return false, nil
}
func (s *noopStore) TerminateGame(id string) error { return nil }

func TestSeafarersSmokeBuildShipAndMoveShip(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersHeadingForNewShores)
	if defn == nil {
		t.Fatal("seafarers map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersHeadingForNewShores,
			MapDefn:       defn,
			VictoryPoints: 12,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("smoke-seafarers", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}

	p := g.CurrentPlayer

	var coastal *entities.Vertex
	for _, v := range p.GetBuildLocationsSettlement(g.Graph, true, false) {
		if v.HasAdjacentSea() {
			coastal = v
			break
		}
	}
	if coastal == nil {
		t.Fatal("no coastal settlement location found")
	}

	if err := g.BuildSettlement(p, coastal.C); err != nil {
		t.Fatalf("failed to build initial settlement: %v", err)
	}

	// Switch out of init flow for normal turn-based checks.
	g.InitPhase = false
	g.DiceState = 1
	p.CurrentHand.UpdateResources(10, 10, 10, 10, 10)

	shipLocs := p.GetBuildLocationsShip(g.Graph)
	if len(shipLocs) == 0 {
		t.Fatal("no ship build locations found")
	}
	var firstShipEdge *entities.Edge
	for _, e := range shipLocs {
		if !g.IsSeaRobberBlockingEdge(e) {
			firstShipEdge = e
			break
		}
	}
	if firstShipEdge == nil {
		t.Fatal("no non-blocked ship edge found")
	}
	if err := g.BuildShip(p, firstShipEdge.C); err != nil {
		t.Fatalf("failed to build ship: %v", err)
	}
	if firstShipEdge.Placement == nil || firstShipEdge.Placement.GetType() != entities.BTShip {
		t.Fatal("ship placement type mismatch after build")
	}

	var someWaterEdge *entities.Edge
	for _, e := range g.Edges {
		if e.IsWaterEdge() && e.Placement == nil {
			someWaterEdge = e
			break
		}
	}
	if someWaterEdge == nil {
		t.Fatal("no free water edge for road rejection test")
	}
	if err := g.BuildRoad(p, someWaterEdge.C); err == nil {
		t.Fatal("expected road build on water edge to fail")
	}

	movable := g.GetMovableShips(p)
	if len(movable) == 0 {
		t.Fatal("expected at least one movable ship")
	}
	from := movable[0]

	// Find a valid destination by emulating interactive flow.
	if err := from.RemovePlacement(); err != nil {
		t.Fatalf("remove ship for destination search failed: %v", err)
	}
	destinations := make([]*entities.Edge, 0)
	for _, e := range p.GetBuildLocationsShip(g.Graph) {
		if e != from && !g.IsSeaRobberBlockingEdge(e) {
			destinations = append(destinations, e)
		}
	}
	if err := p.BuildAtEdge(from, entities.BTShip); err != nil {
		t.Fatalf("restore ship placement failed: %v", err)
	}
	if len(destinations) == 0 {
		t.Fatal("expected at least one ship move destination")
	}
	to := destinations[0]

	// Cannot move after dice rolled.
	if err := g.MoveShip(p, from.C, to.C); err == nil {
		t.Fatal("expected move ship after dice roll to fail")
	}

	// Before dice: move succeeds.
	g.DiceState = 0
	if err := g.MoveShip(p, from.C, to.C); err != nil {
		t.Fatalf("move ship before dice failed: %v", err)
	}
	if to.Placement == nil || to.Placement.GetType() != entities.BTShip {
		t.Fatal("ship placement missing on destination edge")
	}

	// Only one move per turn.
	if err := g.MoveShip(p, to.C, from.C); err == nil {
		t.Fatal("expected second ship move in same turn to fail")
	}
}
