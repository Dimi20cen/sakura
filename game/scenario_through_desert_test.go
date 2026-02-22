package game

import (
	"imperials/entities"
	"testing"
)

func TestThroughDesertBonusAtMostOncePerSettlement(t *testing.T) {
	p, _ := entities.NewPlayer(entities.Seafarers, "p", "p", 0)
	g := &Game{
		ScenarioBonusVP: make(map[*entities.Player]int),
		ScenarioDesertAwarded: map[*entities.Player]map[int]bool{
			p: {},
		},
		ScenarioDesertRegionByTile: map[entities.Coordinate]int{
			{X: 1, Y: 1}: 2,
			{X: 2, Y: 2}: 3,
		},
		ScenarioDesertMainRegion: 1,
	}

	v := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 1, Y: 1}},
			{Center: entities.Coordinate{X: 2, Y: 2}},
		},
	}

	g.applyThroughDesertSettlementBonus(p, v)
	if got := g.ScenarioBonusVP[p]; got != 2 {
		t.Fatalf("expected +2 bonus max per settlement, got %d", got)
	}
	if len(g.ScenarioDesertAwarded[p]) != 1 {
		t.Fatalf("expected exactly one region marked awarded, got %d", len(g.ScenarioDesertAwarded[p]))
	}
}

func TestThroughDesertNoBonusOnMainRegionSettlement(t *testing.T) {
	p, _ := entities.NewPlayer(entities.Seafarers, "p", "p", 0)
	g := &Game{
		ScenarioBonusVP: make(map[*entities.Player]int),
		ScenarioDesertAwarded: map[*entities.Player]map[int]bool{
			p: {},
		},
		ScenarioDesertRegionByTile: map[entities.Coordinate]int{
			{X: 1, Y: 1}: 1,
		},
		ScenarioDesertMainRegion: 1,
	}

	v := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 1, Y: 1}},
		},
	}

	g.applyThroughDesertSettlementBonus(p, v)
	if got := g.ScenarioBonusVP[p]; got != 0 {
		t.Fatalf("expected no bonus on main region settlement, got %d", got)
	}
}

func TestThroughDesertBonusIsPerPlayer(t *testing.T) {
	p0, _ := entities.NewPlayer(entities.Seafarers, "p0", "p0", 0)
	p1, _ := entities.NewPlayer(entities.Seafarers, "p1", "p1", 1)
	g := &Game{
		ScenarioBonusVP: make(map[*entities.Player]int),
		ScenarioDesertAwarded: map[*entities.Player]map[int]bool{
			p0: {},
			p1: {},
		},
		ScenarioDesertRegionByTile: map[entities.Coordinate]int{
			{X: 9, Y: 9}: 2,
		},
		ScenarioDesertMainRegion: 1,
	}

	v := &entities.Vertex{
		AdjacentTiles: []*entities.Tile{
			{Center: entities.Coordinate{X: 9, Y: 9}},
		},
	}

	g.applyThroughDesertSettlementBonus(p0, v)
	g.applyThroughDesertSettlementBonus(p1, v)

	if got := g.ScenarioBonusVP[p0]; got != 2 {
		t.Fatalf("expected p0 +2 bonus, got %d", got)
	}
	if got := g.ScenarioBonusVP[p1]; got != 2 {
		t.Fatalf("expected p1 +2 bonus independently, got %d", got)
	}
}
