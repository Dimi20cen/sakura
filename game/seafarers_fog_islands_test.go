package game

import (
	"sakura/entities"
	"sakura/maps"
	"testing"
)

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
	stopTickerForTest(g)

	if g.Settings.MapDefn.Scenario == nil {
		t.Fatal("scenario metadata missing on fog islands map")
	}
	if target := g.getScenarioVictoryTarget(); target != 12 {
		t.Fatalf("expected scenario victory target 12, got %d", target)
	}

	if len(g.ScenarioFogTileStack) == 0 {
		t.Fatal("expected fog islands discovery tile stack to be initialized")
	}

	fogBefore := 0
	var fogTile *entities.Tile
	for _, tile := range g.Tiles {
		if tile.Fog {
			fogBefore++
			fogTile = tile
			if tile.Type != entities.TileTypeFog || tile.Number != 0 {
				t.Fatal("expected unrevealed fog tiles to hide type and number")
			}
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
		for _, tile := range v.AdjacentTiles {
			if tile.Fog {
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
	if g.IsSeaRobberBlockingEdge(targetEdge) && g.Pirate != nil {
		g.Pirate.Tile = nil
	}

	if err := g.BuildShip(p, targetEdge.C); err != nil {
		t.Fatalf("failed to build ship for fog reveal: %v", err)
	}
	fogAfter := 0
	for _, tile := range g.Tiles {
		if tile.Fog {
			fogAfter++
		}
	}
	if fogAfter >= fogBefore {
		t.Fatalf("expected fog count to decrease after adjacent ship build (before=%d after=%d)", fogBefore, fogAfter)
	}

	revealed := false
	for _, adj := range anchor.AdjacentTiles {
		if adj == nil || adj.Fog {
			continue
		}
		if adj.Type == entities.TileTypeSea && adj.Number != 0 {
			t.Fatal("expected discovered sea tile to have no number disc")
		}
		revealed = true
	}
	if !revealed {
		t.Fatal("expected at least one adjacent fog tile to reveal into a discovered tile type")
	}
}
