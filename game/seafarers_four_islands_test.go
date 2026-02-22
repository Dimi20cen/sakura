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

	var fogTile *entities.Tile
	for _, t := range g.Tiles {
		if t.Fog {
			fogTile = t
			break
		}
	}
	if fogTile == nil {
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
	if fogTile.Fog {
		t.Fatal("expected fog tile to be revealed after adjacent ship build")
	}
}
