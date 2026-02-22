package game

import (
	"imperials/entities"
	"imperials/maps"
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

	if g.Settings.MapDefn.Scenario == nil {
		t.Fatal("scenario metadata missing on four islands map")
	}
	if target := g.getScenarioVictoryTarget(); target != 12 {
		t.Fatalf("expected scenario victory target 12, got %d", target)
	}
}

func TestSeafarersFogIslandsInitializeAndReveal(t *testing.T) {
	defn := maps.GetMapByName(maps.SeafarersFogIslands)
	if defn == nil {
		t.Fatal("fog islands map definition missing")
	}

	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Seafarers,
			MapName:       maps.SeafarersFogIslands,
			MapDefn:       defn,
			VictoryPoints: 10,
			Speed:         entities.NormalSpeed,
		},
	}
	if _, err := g.Initialize("seafarers-fog-islands-init", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}

	if g.Settings.MapDefn.Scenario == nil {
		t.Fatal("scenario metadata missing on fog islands map")
	}
	if target := g.getScenarioVictoryTarget(); target != 12 {
		t.Fatalf("expected scenario victory target 12, got %d", target)
	}

	fogBefore := 0
	var fogTile *entities.Tile
	for _, t := range g.Tiles {
		if t.Fog {
			fogBefore++
			fogTile = t
		}
	}
	if fogTile == nil || fogBefore == 0 {
		t.Fatal("expected at least one fog tile on fog islands map")
	}

	p := g.CurrentPlayer
	var anchor *entities.Vertex
	var targetEdge *entities.Edge
	for _, v := range g.Vertices {
		if !v.HasAdjacentSea() {
			continue
		}
		hasFog := false
		for _, t := range v.AdjacentTiles {
			if t.Fog {
				hasFog = true
				break
			}
		}
		if !hasFog {
			continue
		}
		for _, e := range g.Graph.GetAdjacentVertexEdges(v) {
			if e.IsWaterEdge() && e.Placement == nil {
				anchor = v
				targetEdge = e
				break
			}
		}
		if anchor != nil {
			break
		}
	}
	if anchor == nil || targetEdge == nil {
		t.Fatal("could not find anchor/edge for fog reveal")
	}

	if err := p.BuildAtVertex(anchor, entities.BTSettlement); err != nil {
		t.Fatalf("failed to place anchor settlement: %v", err)
	}
	g.InitPhase = false
	g.DiceState = 1
	p.CurrentHand.UpdateResources(10, 10, 10, 10, 10)
	for _, tile := range g.Tiles {
		if tile.Type != entities.TileTypeSea {
			g.Robber.Move(tile)
			break
		}
	}

	if err := g.BuildShip(p, targetEdge.C); err != nil {
		t.Fatalf("failed to build ship for fog reveal: %v", err)
	}
	fogAfter := 0
	for _, t := range g.Tiles {
		if t.Fog {
			fogAfter++
		}
	}
	if fogAfter >= fogBefore {
		t.Fatalf("expected fog count to decrease after adjacent ship build (before=%d after=%d)", fogBefore, fogAfter)
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

	if g.Settings.MapDefn.Scenario == nil {
		t.Fatal("scenario metadata missing on through the desert map")
	}
	if target := g.getScenarioVictoryTarget(); target != 14 {
		t.Fatalf("expected scenario victory target 14, got %d", target)
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
	g.ensureThroughDesertRegions()

	p := g.CurrentPlayer
	var vFirst *entities.Vertex
	var vSameRegion *entities.Vertex
	var vOtherRegion *entities.Vertex
	regionSeen := make(map[int]*entities.Vertex)

	getUnexploredRegion := func(v *entities.Vertex) int {
		for _, t := range v.AdjacentTiles {
			if rid, ok := g.ScenarioDesertRegionByTile[t.Center]; ok && rid != g.ScenarioDesertMainRegion {
				return rid
			}
		}
		return 0
	}

	for _, v := range g.Vertices {
		rid := getUnexploredRegion(v)
		if rid == 0 {
			continue
		}
		if vFirst == nil {
			vFirst = v
			regionSeen[rid] = v
			continue
		}
		if vSameRegion == nil && regionSeen[rid] != nil {
			vSameRegion = v
			continue
		}
		if vOtherRegion == nil && regionSeen[rid] == nil {
			vOtherRegion = v
			regionSeen[rid] = v
		}
	}

	if vFirst == nil || vSameRegion == nil || vOtherRegion == nil {
		t.Fatal("could not find vertices for through the desert region bonus test")
	}

	if err := p.BuildAtVertex(vFirst, entities.BTSettlement); err != nil {
		t.Fatalf("failed to place settlement on first unexplored region: %v", err)
	}
	g.onScenarioSettlementBuilt(p, vFirst)
	if got := g.ScenarioBonusVP[p]; got != 2 {
		t.Fatalf("expected +2 VP after first unexplored-region settlement, got %d", got)
	}

	if err := p.BuildAtVertex(vSameRegion, entities.BTSettlement); err != nil {
		t.Fatalf("failed to place settlement on same unexplored region: %v", err)
	}
	g.onScenarioSettlementBuilt(p, vSameRegion)
	if got := g.ScenarioBonusVP[p]; got != 2 {
		t.Fatalf("expected no extra VP on second settlement in same region, got %d", got)
	}

	if err := p.BuildAtVertex(vOtherRegion, entities.BTSettlement); err != nil {
		t.Fatalf("failed to place settlement on second unexplored region: %v", err)
	}
	g.onScenarioSettlementBuilt(p, vOtherRegion)
	if got := g.ScenarioBonusVP[p]; got != 4 {
		t.Fatalf("expected +4 VP after first settlement in two regions, got %d", got)
	}
	if total := g.GetVictoryPoints(p, false); total < 7 {
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
