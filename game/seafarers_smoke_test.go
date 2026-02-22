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
	if got := len(g.GetMovableShips(p)); got != 0 {
		t.Fatalf("newly built ship must not be movable this turn, got %d movable ships", got)
	}
	p.ResetTurnState()

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

	// Cannot move before dice rolled.
	g.DiceState = 0
	if err := g.MoveShip(p, from.C, to.C); err == nil {
		t.Fatal("expected move ship before dice roll to fail")
	}

	// After dice: move succeeds.
	g.DiceState = 1
	if err := g.MoveShip(p, from.C, to.C); err != nil {
		t.Fatalf("move ship after dice failed: %v", err)
	}
	if to.Placement == nil || to.Placement.GetType() != entities.BTShip {
		t.Fatal("ship placement missing on destination edge")
	}

	// Only one move per turn.
	if err := g.MoveShip(p, to.C, from.C); err == nil {
		t.Fatal("expected second ship move in same turn to fail")
	}
}

func TestSeafarersPirateStealsFromShip(t *testing.T) {
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
	if _, err := g.Initialize("pirate-steal-seafarers", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}

	p0 := g.Players[0]
	p1 := g.Players[1]
	g.CurrentPlayer = p0

	var seaTile *entities.Tile
	var shipEdge *entities.Edge
	for _, tile := range g.Tiles {
		if tile.Type != entities.TileTypeSea {
			continue
		}
		for _, ec := range tile.GetEdgeCoordinates() {
			e, err := g.Graph.GetEdge(ec)
			if err == nil && e != nil && e.Placement == nil {
				seaTile = tile
				shipEdge = e
				break
			}
		}
		if seaTile != nil {
			break
		}
	}
	if seaTile == nil || shipEdge == nil {
		t.Fatal("could not find sea tile/edge for pirate steal test")
	}

	if err := p1.BuildAtEdge(shipEdge, entities.BTShip); err != nil {
		t.Fatalf("failed to place ship for victim: %v", err)
	}
	p1.CurrentHand.UpdateCards(entities.CardTypeWood, 1)

	g.Robber.Move(seaTile)
	if err := g.StealCardWithRobber(); err != nil {
		t.Fatalf("steal with pirate returned error: %v", err)
	}

	if got := p0.CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity; got != 1 {
		t.Fatalf("expected stealer to gain 1 wood, got %d", got)
	}
	if got := p1.CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity; got != 0 {
		t.Fatalf("expected victim to lose wood, got %d", got)
	}
}

func TestSeafarersEndTurnMakesDevCardsUsable(t *testing.T) {
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
	if _, err := g.Initialize("dev-usable-seafarers", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}

	g.InitPhase = false
	g.DiceState = 1
	p0 := g.CurrentPlayer
	p1 := g.Players[1]
	deck := p1.CurrentHand.GetDevelopmentCardDeck(entities.DevelopmentCardKnight)
	deck.Quantity = 1
	deck.CanUse = false

	if err := g.EndTurn(p0); err != nil {
		t.Fatalf("end turn failed: %v", err)
	}
	if !deck.CanUse {
		t.Fatal("expected seafarers dev card to become usable at start of turn")
	}
}

func TestSeafarersCoastalRoadAllowed(t *testing.T) {
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
	if _, err := g.Initialize("coastal-road-seafarers", 2); err != nil {
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
		t.Fatalf("failed to build settlement: %v", err)
	}

	g.InitPhase = false
	g.DiceState = 1
	p.CurrentHand.UpdateResources(10, 10, 10, 10, 10)

	var coastalRoad *entities.Edge
	for _, e := range p.GetBuildLocationsRoad(g.Graph, false) {
		if e.IsLandEdge() && e.IsWaterEdge() {
			coastalRoad = e
			break
		}
	}
	if coastalRoad == nil {
		t.Fatal("no coastal road edge found")
	}
	if err := g.BuildRoad(p, coastalRoad.C); err != nil {
		t.Fatalf("expected road build on coastal edge to succeed: %v", err)
	}
}

func TestRevealFogAdjacentToEdgeAwardsResource(t *testing.T) {
	bank, err := entities.GetNewBank(entities.Seafarers)
	if err != nil {
		t.Fatalf("failed to create bank: %v", err)
	}
	player, err := entities.NewPlayer(entities.Seafarers, "p0", "p0", 0)
	if err != nil {
		t.Fatalf("failed to create player: %v", err)
	}

	fogTile := &entities.Tile{Center: entities.Coordinate{X: 0, Y: 0}, Type: entities.TileTypeWood, Fog: true}
	c1 := entities.Coordinate{X: 0, Y: 0}
	c2 := entities.Coordinate{X: 2, Y: 0}
	v1 := &entities.Vertex{C: c1, AdjacentTiles: []*entities.Tile{fogTile}}
	v2 := &entities.Vertex{C: c2, AdjacentTiles: []*entities.Tile{fogTile}}
	edge := &entities.Edge{C: entities.EdgeCoordinate{C1: c1, C2: c2}}

	g := &Game{
		Initialized:   true,
		Mode:          entities.Seafarers,
		Bank:          bank,
		Players:       []*entities.Player{player},
		CurrentPlayer: player,
		Graph: &entities.Graph{
			Vertices: map[entities.Coordinate]*entities.Vertex{
				c1: v1,
				c2: v2,
			},
			Edges: map[entities.EdgeCoordinate]*entities.Edge{
				edge.C: edge,
			},
			Tiles: map[entities.Coordinate]*entities.Tile{
				fogTile.Center: fogTile,
			},
		},
	}

	g.RevealFogAdjacentToEdge(player, edge)
	if fogTile.Fog {
		t.Fatal("expected fog tile to be revealed")
	}
	if got := player.CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity; got != 1 {
		t.Fatalf("expected player to receive 1 wood for discovered fog tile, got %d", got)
	}
}
