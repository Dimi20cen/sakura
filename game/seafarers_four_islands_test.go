package game

import (
	"sakura/entities"
	"sakura/maps"
	"testing"
)

func TestSeafarersFourIslandsInitialize(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersFourIslands)
	if defn == nil {
		t.Fatal("four islands map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersFourIslands,
			MapDefn:       defn,
			VictoryPoints: 10,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("seafarers-four-islands-init", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)

	if g.Settings.MapDefn.Scenario == nil {
		t.Fatal("scenario metadata missing on four islands map")
	}
	if target := g.getScenarioVictoryTarget(); target != 10 {
		t.Fatalf("expected scenario victory target 10 from settings, got %d", target)
	}
}

func TestFourIslandsHomeIslandsDoNotGrantBonus(t *testing.T) {
	p, _ := entities.NewPlayer(entities.Seafarers, "p", "p", 0)
	g := &Game{
		ScenarioBonusVP: make(map[*entities.Player]int),
		ScenarioLandHome: map[*entities.Player]map[int]bool{
			p: {1: true, 2: true},
		},
		ScenarioLandAwarded: map[*entities.Player]map[int]bool{
			p: {},
		},
		ScenarioLandRegionByTile: map[entities.Coordinate]int{
			{X: 1, Y: 1}: 1,
			{X: 2, Y: 2}: 2,
			{X: 3, Y: 3}: 3,
		},
	}

	homeVertex := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 1, Y: 1}},
		},
	}

	g.applyFourIslandsSettlementBonus(p, homeVertex)
	if got := g.ScenarioBonusVP[p]; got != 0 {
		t.Fatalf("expected no bonus on home island settlement, got %d", got)
	}
}

func TestFourIslandsUnexploredIslandBonusIsPerPlayer(t *testing.T) {
	p0, _ := entities.NewPlayer(entities.Seafarers, "p0", "p0", 0)
	p1, _ := entities.NewPlayer(entities.Seafarers, "p1", "p1", 1)
	g := &Game{
		ScenarioBonusVP: make(map[*entities.Player]int),
		ScenarioLandHome: map[*entities.Player]map[int]bool{
			p0: {1: true},
			p1: {2: true},
		},
		ScenarioLandAwarded: map[*entities.Player]map[int]bool{
			p0: {},
			p1: {},
		},
		ScenarioLandRegionByTile: map[entities.Coordinate]int{
			{X: 1, Y: 1}: 1,
			{X: 2, Y: 2}: 2,
			{X: 3, Y: 3}: 3,
		},
		InitPhase: false,
	}

	unexploredForBoth := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 3, Y: 3}},
		},
	}

	g.applyFourIslandsSettlementBonus(p0, unexploredForBoth)
	g.applyFourIslandsSettlementBonus(p0, unexploredForBoth)
	g.applyFourIslandsSettlementBonus(p1, unexploredForBoth)

	if got := g.ScenarioBonusVP[p0]; got != 2 {
		t.Fatalf("expected p0 +2 bonus on unexplored island, got %d", got)
	}
	if got := g.ScenarioBonusVP[p1]; got != 2 {
		t.Fatalf("expected p1 +2 bonus independently on same island, got %d", got)
	}
}

func TestFourIslandsInitSettlementsDefineHomeIslands(t *testing.T) {
	p, _ := entities.NewPlayer(entities.Seafarers, "p", "p", 0)
	g := &Game{
		InitPhase:        true,
		ScenarioLandHome: make(map[*entities.Player]map[int]bool),
		ScenarioLandRegionByTile: map[entities.Coordinate]int{
			{X: 1, Y: 1}: 1,
			{X: 2, Y: 2}: 2,
		},
	}

	first := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 1, Y: 1}},
		},
	}
	second := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 2, Y: 2}},
		},
	}

	p.VertexPlacements = []entities.VertexBuildable{&entities.Settlement{Owner: p, Location: first}}
	g.trackFourIslandsHomeIsland(p, first)
	p.VertexPlacements = []entities.VertexBuildable{
		&entities.Settlement{Owner: p, Location: first},
		&entities.Settlement{Owner: p, Location: second},
	}
	g.trackFourIslandsHomeIsland(p, second)

	if !g.ScenarioLandHome[p][1] || !g.ScenarioLandHome[p][2] {
		t.Fatal("expected both init-settlement islands to be tracked as home islands")
	}
}

func TestSeafarersThroughDesertInitialize(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersThroughDesert)
	if defn == nil {
		t.Fatal("through the desert map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersThroughDesert,
			MapDefn:       defn,
			VictoryPoints: 10,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("seafarers-through-desert-init", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)

	if g.Settings.MapDefn.Scenario == nil {
		t.Fatal("scenario metadata missing on through the desert map")
	}
	if target := g.getScenarioVictoryTarget(); target != 10 {
		t.Fatalf("expected scenario victory target 10 from settings, got %d", target)
	}
}

func TestSeafarersThroughDesertSettlementRegionBonus(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersThroughDesert)
	if defn == nil {
		t.Fatal("through the desert map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersThroughDesert,
			MapDefn:       defn,
			VictoryPoints: 10,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("seafarers-through-desert-bonus", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)
	g.ensureThroughDesertRegions()

	p := g.CurrentPlayer
	var vFirst *entities.Vertex
	var vMain *entities.Vertex
	for _, v := range g.Vertices {
		if vFirst == nil {
			for _, t := range v.AdjacentTiles {
				if rid, ok := g.ScenarioDesertRegionByTile[t.Center]; ok && rid != g.ScenarioDesertMainRegion {
					vFirst = v
					break
				}
			}
		}
		if vMain == nil && g.throughDesertVertexTouchesRegion(v, g.ScenarioDesertMainRegion) {
			vMain = v
		}
		if vFirst != nil && vMain != nil {
			break
		}
	}

	if vFirst == nil || vMain == nil {
		t.Fatal("could not find vertices for through the desert region bonus test")
	}

	if err := p.BuildAtVertex(vFirst, entities.BTSettlement); err != nil {
		t.Fatalf("failed to place settlement on first unexplored region: %v", err)
	}
	g.onScenarioSettlementBuilt(p, vFirst)
	if got := g.ScenarioBonusVP[p]; got != 2 {
		t.Fatalf("expected +2 VP after first unexplored-region settlement, got %d", got)
	}

	// Building on main region should not add bonus.
	if err := p.BuildAtVertex(vMain, entities.BTSettlement); err != nil {
		t.Fatalf("failed to place settlement on main region: %v", err)
	}
	g.onScenarioSettlementBuilt(p, vMain)
	if got := g.ScenarioBonusVP[p]; got != 2 {
		t.Fatalf("expected no extra VP on main region settlement, got %d", got)
	}
	if total := g.GetVictoryPoints(p, false); total < 4 {
		t.Fatalf("expected scenario bonus to contribute to total VP, got %d", total)
	}
}

func TestSeafarersThroughDesertInitPlacementRestrictedToMainIsland(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersThroughDesert)
	if defn == nil {
		t.Fatal("through the desert map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersThroughDesert,
			MapDefn:       defn,
			VictoryPoints: 10,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("seafarers-through-desert-init-restrict", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)
	g.ensureThroughDesertRegions()

	p := g.CurrentPlayer
	raw := p.GetBuildLocationsSettlement(g.Graph, true, false)
	filtered := g.applyInitVertexScenarioHooks(p, raw)
	if len(filtered) == 0 {
		t.Fatal("expected at least one allowed initial settlement on main island")
	}

	excluded := 0
	for _, v := range raw {
		if !g.throughDesertVertexTouchesRegion(v, g.ScenarioDesertMainRegion) {
			excluded++
		}
	}
	if excluded == 0 {
		t.Fatal("expected at least one non-main-island init settlement candidate to be excluded")
	}

	for _, v := range filtered {
		if !g.throughDesertVertexTouchesRegion(v, g.ScenarioDesertMainRegion) {
			t.Fatal("found filtered init vertex outside main island")
		}
	}
}

func TestSeafarersThroughDesertDesertAdjacentStripCountsAsUnexploredRegion(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersThroughDesert)
	if defn == nil {
		t.Fatal("through the desert map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersThroughDesert,
			MapDefn:       defn,
			VictoryPoints: 10,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("seafarers-through-desert-strip-region", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)
	g.ensureThroughDesertRegions()

	p := g.CurrentPlayer
	var stripVertex *entities.Vertex
	var stripRegion int
	for _, v := range g.Vertices {
		adjacentDesert := false
		candidateRegion := 0
		for _, tile := range v.AdjacentTiles {
			if tile == nil {
				continue
			}
			if tile.Type == entities.TileTypeDesert {
				adjacentDesert = true
				continue
			}
			if rid, ok := g.ScenarioDesertRegionByTile[tile.Center]; ok && rid != g.ScenarioDesertMainRegion {
				candidateRegion = rid
			}
		}
		if adjacentDesert && candidateRegion != 0 {
			stripVertex = v
			stripRegion = candidateRegion
			break
		}
	}
	if stripVertex == nil {
		t.Fatal("expected to find a desert-adjacent unexplored-region vertex for the land strip")
	}
	if stripRegion == g.ScenarioDesertMainRegion {
		t.Fatal("expected desert-adjacent land strip to be outside the main island region")
	}

	if err := p.BuildAtVertex(stripVertex, entities.BTSettlement); err != nil {
		t.Fatalf("failed to place settlement on desert-adjacent strip: %v", err)
	}
	g.onScenarioSettlementBuilt(p, stripVertex)
	if got := g.ScenarioBonusVP[p]; got != 2 {
		t.Fatalf("expected desert-adjacent strip settlement to award +2 VP, got %d", got)
	}
}

func TestSeafarersThroughDesertFourteenVPWinsOnCurrentPlayersTurn(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersThroughDesert)
	if defn == nil {
		t.Fatal("through the desert map definition missing")
	}
	bank, err := entities.GetNewBank(entities.Seafarers)
	if err != nil {
		t.Fatalf("failed to create bank: %v", err)
	}

	p0, _ := entities.NewPlayer(entities.Seafarers, "p0", "p0", 0)
	p1, _ := entities.NewPlayer(entities.Seafarers, "p1", "p1", 1)
	g := &Game{
		Store:              &noopStore{},
		Bank:               bank,
		Settings:           entities.GameSettings{Mode: entities.Seafarers, MapDefn: defn, VictoryPoints: 10},
		Players:            []*entities.Player{p0, p1},
		CurrentPlayer:      p0,
		ExtraVictoryPoints: &entities.ExtraVictoryPoints{},
		ScenarioBonusVP: map[*entities.Player]int{
			p0: 14,
			p1: 13,
		},
	}

	g.CheckForVictory()
	if !g.GameOver {
		t.Fatal("expected game over when current player reaches the 14 VP scenario target")
	}
	if winner := g.getScenarioVictoryWinner(); winner != p0 {
		t.Fatal("expected current player to satisfy the scenario victory condition")
	}
}
