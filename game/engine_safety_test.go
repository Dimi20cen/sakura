package game

import (
	"sakura/entities"
	"testing"
)

func TestSetUsernameAllowsEmptyString(t *testing.T) {
	p, err := entities.NewPlayer(entities.Base, "p0", "p0", 0)
	if err != nil {
		t.Fatalf("NewPlayer failed: %v", err)
	}

	g := &Game{Initialized: true}
	g.j.g = g

	g.SetUsername(p, "")

	if p.Username != "" {
		t.Fatalf("expected empty username to be stored, got %q", p.Username)
	}
	if p.GetIsBot() {
		t.Fatal("empty username should not mark player as bot")
	}
}

func TestInitializeInvalidMapDoesNotStartTicker(t *testing.T) {
	g := &Game{
		Store: &noopStore{},
		Settings: entities.GameSettings{
			Mode:          entities.Base,
			MapName:       "invalid-map",
			MapDefn:       &entities.MapDefinition{Map: [][]int{{int(entities.TileTypeWood)}}},
			VictoryPoints: 10,
			Speed:         entities.Speed60s,
		},
	}

	if _, err := g.Initialize("invalid-init", 2); err == nil {
		t.Fatal("expected initialize to fail with invalid map")
	}
	if g.Initialized {
		t.Fatal("game should not remain initialized after failed initialize")
	}
	if g.Ticker != nil {
		t.Fatal("ticker should not be started when initialize fails")
	}
	if g.TickerStop != nil {
		t.Fatal("ticker stop channel should be nil when initialize fails")
	}
}
