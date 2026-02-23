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

func stopTickerForTest(g *Game) {
	if g == nil || g.TickerStop == nil {
		return
	}
	select {
	case g.TickerStop <- true:
	default:
	}
}

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
	stopTickerForTest(g)

	p := g.CurrentPlayer

	var coastal *entities.Vertex
	bestShipLocs := 0
	for _, v := range p.GetBuildLocationsSettlement(g.Graph, true, false) {
		if !v.HasAdjacentSea() {
			continue
		}
		if err := p.BuildAtVertex(v, entities.BTSettlement); err != nil {
			continue
		}
		count := len(p.GetBuildLocationsShip(g.Graph))
		_ = v.RemovePlacement()
		if count > bestShipLocs {
			bestShipLocs = count
			coastal = v
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
	if len(shipLocs) < 2 {
		t.Fatalf("expected at least 2 ship build locations, got %d", len(shipLocs))
	}
	var firstShipEdge *entities.Edge
	for _, e := range shipLocs {
		if !g.IsSeaRobberBlockingEdge(e) {
			firstShipEdge = e
			break
		}
	}
	if firstShipEdge == nil {
		for _, tile := range g.Tiles {
			if tile.Type == entities.TileTypeSea && (g.Pirate == nil || g.Pirate.Tile != tile) {
				g.Pirate.Move(tile)
				break
			}
		}
		for _, e := range shipLocs {
			if !g.IsSeaRobberBlockingEdge(e) {
				firstShipEdge = e
				break
			}
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
	// Keep this movement smoke focused on ship rules, not pirate blocking.
	if g.Pirate != nil {
		g.Pirate.Tile = nil
	}
	if got := len(g.GetMovableShips(p)); got != 0 {
		t.Fatalf("newly built ship must not be movable this turn, got %d movable ships", got)
	}
	p.ResetTurnState()

	var someWaterEdge *entities.Edge
	for _, e := range g.Edges {
		if e.IsWaterEdge() && !e.IsLandEdge() && e.Placement == nil {
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
	var from *entities.Edge
	var to *entities.Edge
	for _, candidate := range movable {
		if err := candidate.RemovePlacement(); err != nil {
			t.Fatalf("remove ship for destination search failed: %v", err)
		}
		destinations := make([]*entities.Edge, 0)
		for _, e := range p.GetBuildLocationsShip(g.Graph) {
			if e != candidate && !g.IsSeaRobberBlockingEdge(e) {
				destinations = append(destinations, e)
			}
		}
		if err := p.BuildAtEdge(candidate, entities.BTShip); err != nil {
			t.Fatalf("restore ship placement failed: %v", err)
		}
		if len(destinations) > 0 {
			from = candidate
			to = destinations[0]
			break
		}
	}
	if from == nil || to == nil {
		t.Fatal("expected at least one movable ship with a valid destination")
	}

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
	stopTickerForTest(g)

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

	g.Pirate.Move(seaTile)
	if err := g.StealCardAtTile(seaTile); err != nil {
		t.Fatalf("steal with pirate returned error: %v", err)
	}

	if got := p0.CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity; got != 1 {
		t.Fatalf("expected stealer to gain 1 wood, got %d", got)
	}
	if got := p1.CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity; got != 0 {
		t.Fatalf("expected victim to lose wood, got %d", got)
	}
}

func TestSeafarersHasSeparateRobberAndPirateTokens(t *testing.T) {
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
	if _, err := g.Initialize("dual-token-seafarers", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)

	if g.Robber == nil || g.Robber.Tile == nil {
		t.Fatal("expected robber tile to be initialized")
	}
	if g.Pirate == nil || g.Pirate.Tile == nil {
		t.Fatal("expected pirate tile to be initialized")
	}
	if g.Robber.Tile.Type == entities.TileTypeSea {
		t.Fatal("expected robber to start on land")
	}
	if g.Pirate.Tile.Type != entities.TileTypeSea {
		t.Fatal("expected pirate to start on sea")
	}

	robberTile := g.Robber.Tile
	var newSeaTile *entities.Tile
	for _, tile := range g.Tiles {
		if tile.Type == entities.TileTypeSea && tile != g.Pirate.Tile {
			newSeaTile = tile
			break
		}
	}
	if newSeaTile == nil {
		t.Fatal("expected at least two sea tiles to move pirate")
	}

	g.Pirate.Move(newSeaTile)
	if g.Robber.Tile != robberTile {
		t.Fatal("moving pirate should not move robber")
	}
	if g.Pirate.Tile != newSeaTile {
		t.Fatal("expected pirate to move to selected sea tile")
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
	stopTickerForTest(g)

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
	stopTickerForTest(g)

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

func TestSeafarersFogIslandsStyleDiscoveryByShip(t *testing.T) {
	defn := &entities.MapDefinition{
		Name:        "Seafarers - Fog Islands (Test)",
		Order:       []bool{false, false, false},
		Ports:       []entities.PortType{},
		Numbers:     []uint16{5},
		RandomTiles: []entities.TileType{entities.TileTypeWood},
		Map: [][]int{
			{int(entities.TileTypeNone), int(entities.TileTypeSea), int(entities.TileTypeNone)},
			{int(entities.TileTypeSea), int(entities.TileTypeFog), int(entities.TileTypeSea)},
			{int(entities.TileTypeNone), int(entities.TileTypeSea), int(entities.TileTypeNone)},
		},
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       defn.Name,
			MapDefn:       defn,
			VictoryPoints: 12,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("fog-islands-style-discovery", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)

	var fogTile *entities.Tile
	for _, tile := range g.Tiles {
		if tile.Fog {
			fogTile = tile
			break
		}
	}
	if fogTile == nil {
		t.Fatal("expected at least one fog tile")
	}

	var targetEdge *entities.Edge
	var anchor *entities.Vertex
	for _, ec := range fogTile.GetEdgeCoordinates() {
		e, err := g.Graph.GetEdge(ec)
		if err != nil || e == nil || !e.IsWaterEdge() {
			continue
		}
		v1, _ := g.Graph.GetVertex(e.C.C1)
		v2, _ := g.Graph.GetVertex(e.C.C2)
		if v1 != nil && v1.HasAdjacentSea() {
			targetEdge = e
			anchor = v1
			break
		}
		if v2 != nil && v2.HasAdjacentSea() {
			targetEdge = e
			anchor = v2
			break
		}
	}
	if targetEdge == nil || anchor == nil {
		t.Fatal("could not find edge/vertex for fog discovery by ship")
	}

	p := g.CurrentPlayer
	if err := p.BuildAtVertex(anchor, entities.BTSettlement); err != nil {
		t.Fatalf("failed to place anchor settlement: %v", err)
	}

	g.InitPhase = false
	g.DiceState = 1
	p.CurrentHand.UpdateResources(10, 10, 10, 10, 10)
	if g.Pirate != nil {
		g.Pirate.Tile = nil
	}

	if err := g.BuildShip(p, targetEdge.C); err != nil {
		t.Fatalf("failed to build ship on fog-adjacent edge: %v", err)
	}
	if fogTile.Fog {
		t.Fatal("expected fog tile to be revealed after building adjacent ship")
	}
	if p.CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity == 0 {
		t.Fatal("expected discovery reward when revealing fog land tile")
	}
}

func TestSeafarersScriptedMultiplayerSmoke(t *testing.T) {
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
	if _, err := g.Initialize("scripted-multiplayer-smoke", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)

	p0 := g.Players[0]
	p1 := g.Players[1]

	var coastal *entities.Vertex
	for _, v := range p0.GetBuildLocationsSettlement(g.Graph, true, false) {
		if v.HasAdjacentSea() {
			coastal = v
			break
		}
	}
	if coastal == nil {
		t.Fatal("no coastal settlement location found for p0")
	}
	if err := g.BuildSettlement(p0, coastal.C); err != nil {
		t.Fatalf("failed to build p0 initial settlement: %v", err)
	}

	g.InitPhase = false
	g.CurrentPlayer = p0
	g.DiceState = 1
	p0.CurrentHand.UpdateResources(10, 10, 10, 10, 10)

	shipLocs := p0.GetBuildLocationsShip(g.Graph)
	if len(shipLocs) == 0 {
		t.Fatal("no ship build locations found for p0")
	}
	var firstShip *entities.Edge
	for _, e := range shipLocs {
		if !g.IsSeaRobberBlockingEdge(e) {
			firstShip = e
			break
		}
	}
	if firstShip == nil {
		for _, tile := range g.Tiles {
			if tile.Type == entities.TileTypeSea && (g.Pirate == nil || g.Pirate.Tile != tile) {
				g.Pirate.Move(tile)
				break
			}
		}
		for _, e := range shipLocs {
			if !g.IsSeaRobberBlockingEdge(e) {
				firstShip = e
				break
			}
		}
	}
	if firstShip == nil {
		t.Fatal("no non-blocked ship edge found for p0")
	}
	if err := g.BuildShip(p0, firstShip.C); err != nil {
		t.Fatalf("failed to build first ship: %v", err)
	}

	if err := g.EndTurn(p0); err != nil {
		t.Fatalf("failed to end p0 turn: %v", err)
	}
	g.DiceState = 1
	if err := g.EndTurn(p1); err != nil {
		t.Fatalf("failed to end p1 turn: %v", err)
	}

	if g.CurrentPlayer != p0 {
		t.Fatal("expected turn to return to p0")
	}
	if err := g.RollDice(p0, 1, 1); err != nil {
		t.Fatalf("failed to roll dice for p0: %v", err)
	}
	if g.DiceState == 0 {
		t.Fatal("expected dice state to be rolled after roll")
	}

	// Pirate-steal leg of the smoke flow: place p1 ship on a sea hex and steal.
	var seaTile *entities.Tile
	var p1Ship *entities.Edge
	for _, tile := range g.Tiles {
		if tile.Type != entities.TileTypeSea {
			continue
		}
		for _, ec := range tile.GetEdgeCoordinates() {
			e, err := g.Graph.GetEdge(ec)
			if err == nil && e != nil && e.Placement == nil {
				seaTile = tile
				p1Ship = e
				break
			}
		}
		if seaTile != nil {
			break
		}
	}
	if seaTile == nil || p1Ship == nil {
		t.Fatal("no sea tile/edge for pirate smoke leg")
	}
	if err := p1.BuildAtEdge(p1Ship, entities.BTShip); err != nil {
		t.Fatalf("failed to place p1 ship for pirate smoke leg: %v", err)
	}
	p1.CurrentHand.UpdateCards(entities.CardTypeBrick, 1)
	g.Pirate.Move(seaTile)
	if err := g.StealCardAtTile(seaTile); err != nil {
		t.Fatalf("pirate steal failed in scripted smoke: %v", err)
	}
	if p0.CurrentHand.GetCardDeck(entities.CardTypeBrick).Quantity == 0 {
		t.Fatal("expected p0 to steal one card in pirate smoke leg")
	}
}
