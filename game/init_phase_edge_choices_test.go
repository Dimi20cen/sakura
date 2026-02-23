package game

import (
	"imperials/entities"
	"imperials/maps"
	"testing"
)

func buildInitSeafarersGame(t *testing.T) *Game {
	t.Helper()

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
			Speed:         entities.Speed60s,
		},
	}
	if _, err := g.Initialize("init-edge-choices", 2); err != nil {
		t.Fatalf("initialize failed: %v", err)
	}
	stopTickerForTest(g)
	return g
}

func TestInitEdgeChoicesIncludeRoadAndShipOnCoastalAnchor(t *testing.T) {
	g := buildInitSeafarersGame(t)
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
		t.Fatalf("failed to build coastal settlement: %v", err)
	}

	allowed, roadAllowed, shipAllowed := g.getInitEdgeChoices(p, coastal)
	if len(allowed) == 0 {
		t.Fatal("expected init edge choices from coastal settlement")
	}

	hasDualChoice := false
	for _, e := range allowed {
		if roadAllowed[e] && shipAllowed[e] {
			hasDualChoice = true
			break
		}
	}
	if !hasDualChoice {
		t.Fatal("expected at least one coastal edge to allow both road and ship")
	}
}

func TestSecondInitEdgeChoicesAreAnchoredToSecondSettlement(t *testing.T) {
	g := buildInitSeafarersGame(t)
	p := g.CurrentPlayer

	firstSettlementLocs := p.GetBuildLocationsSettlement(g.Graph, true, false)
	if len(firstSettlementLocs) == 0 {
		t.Fatal("no initial settlement locations")
	}
	first := firstSettlementLocs[0]
	if err := g.BuildSettlement(p, first.C); err != nil {
		t.Fatalf("failed to build first settlement: %v", err)
	}

	firstAllowed, firstRoad, firstShip := g.getInitEdgeChoices(p, first)
	if len(firstAllowed) == 0 {
		t.Fatal("expected first settlement to have edge choices")
	}
	firstEdge := firstAllowed[0]
	if firstShip[firstEdge] {
		if err := g.BuildShip(p, firstEdge.C); err != nil {
			t.Fatalf("failed to build first ship: %v", err)
		}
	} else if firstRoad[firstEdge] {
		if err := g.BuildRoad(p, firstEdge.C); err != nil {
			t.Fatalf("failed to build first road: %v", err)
		}
	} else {
		t.Fatal("first edge was neither road nor ship buildable")
	}

	secondLocs := p.GetBuildLocationsSettlement(g.Graph, true, false)
	if len(secondLocs) == 0 {
		t.Fatal("no second settlement locations after first build")
	}
	second := secondLocs[0]
	if err := g.BuildSettlement(p, second.C); err != nil {
		t.Fatalf("failed to build second settlement: %v", err)
	}

	secondAllowed, _, _ := g.getInitEdgeChoices(p, second)
	if len(secondAllowed) == 0 {
		t.Fatal("expected second settlement to have edge choices")
	}

	for _, e := range secondAllowed {
		if e.C.C1 != second.C && e.C.C2 != second.C {
			t.Fatalf("found edge not anchored to second settlement: %+v (second=%+v)", e.C, second.C)
		}
		if e == firstEdge {
			t.Fatal("second settlement choices must not include first settlement edge")
		}
	}
}
