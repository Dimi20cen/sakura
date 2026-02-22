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
