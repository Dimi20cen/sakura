package game

import (
	"sakura/entities"
	"sakura/maps"
	"testing"
)

func TestSeafarersHeadingForNewShoresInitialize(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersHeadingForNewShores)
	if defn == nil {
		t.Fatal("heading for new shores map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersHeadingForNewShores,
			MapDefn:       defn,
			VictoryPoints: 10,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("seafarers-heading-for-new-shores-init", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)

	if g.Settings.MapDefn.Scenario == nil {
		t.Fatal("scenario metadata missing on heading for new shores map")
	}
	if target := g.getScenarioVictoryTarget(); target != 14 {
		t.Fatalf("expected scenario victory target 14, got %d", target)
	}
}

func TestHeadingForNewShoresBonusIsPerIslandPerPlayer(t *testing.T) {
	p0, _ := entities.NewPlayer(entities.Seafarers, "p0", "p0", 0)
	p1, _ := entities.NewPlayer(entities.Seafarers, "p1", "p1", 1)
	g := &Game{
		ScenarioBonusVP: make(map[*entities.Player]int),
		ScenarioLandAwarded: map[*entities.Player]map[int]bool{
			p0: {},
			p1: {},
		},
		ScenarioLandRegionByTile: map[entities.Coordinate]int{
			{X: 1, Y: 1}: 1,
			{X: 2, Y: 2}: 2,
			{X: 3, Y: 3}: 3,
		},
		ScenarioLandMainRegion: 1,
	}

	outerIslandVertex := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 2, Y: 2}},
		},
	}
	secondOuterIslandVertex := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 3, Y: 3}},
		},
	}

	g.applyScenarioOuterIslandSettlementBonus(p0, outerIslandVertex)
	g.applyScenarioOuterIslandSettlementBonus(p0, outerIslandVertex)
	g.applyScenarioOuterIslandSettlementBonus(p0, secondOuterIslandVertex)
	g.applyScenarioOuterIslandSettlementBonus(p1, outerIslandVertex)

	if got := g.ScenarioBonusVP[p0]; got != 4 {
		t.Fatalf("expected p0 to earn 4 bonus VP across two islands, got %d", got)
	}
	if got := g.ScenarioBonusVP[p1]; got != 2 {
		t.Fatalf("expected p1 to earn 2 bonus VP independently, got %d", got)
	}
}

func TestHeadingForNewShoresInitPlacementRestrictedToMainIsland(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersHeadingForNewShores)
	if defn == nil {
		t.Fatal("heading for new shores map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersHeadingForNewShores,
			MapDefn:       defn,
			VictoryPoints: 10,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("seafarers-heading-for-new-shores-init-restrict", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)
	g.ensureScenarioLandRegions()

	p := g.CurrentPlayer
	_ = p
	raw := make([]*entities.Vertex, 0)
	for _, v := range g.Vertices {
		if len(v.AdjacentTiles) == 0 {
			continue
		}
		raw = append(raw, v)
	}
	filtered := g.applyInitVertexScenarioHooks(p, raw)
	if len(filtered) == 0 {
		t.Fatal("expected at least one allowed initial settlement on main island")
	}

	excluded := 0
	for _, v := range raw {
		if !g.scenarioVertexTouchesLandRegion(v, g.ScenarioLandMainRegion) {
			excluded++
		}
	}
	if excluded == 0 {
		t.Fatal("expected at least one non-main-island init settlement candidate to be excluded")
	}

	for _, v := range filtered {
		if !g.scenarioVertexTouchesLandRegion(v, g.ScenarioLandMainRegion) {
			t.Fatal("found filtered init vertex outside main island")
		}
	}
}
