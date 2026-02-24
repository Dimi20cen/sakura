package game

import (
	"sakura/entities"
	"testing"
)

func TestTogglePauseStopsAndResumesTick(t *testing.T) {
	g := buildGameForTimerStateTest(t)
	g.Initialized = true
	g.TickerPause = false

	before := g.CurrentPlayer.TimeLeft
	if err := g.TogglePause(g.CurrentPlayer); err != nil {
		t.Fatalf("TogglePause failed: %v", err)
	}
	if !g.Paused {
		t.Fatal("expected game to be paused")
	}

	g.Tick()
	if g.CurrentPlayer.TimeLeft != before {
		t.Fatalf(
			"expected time left to stay %d while paused, got %d",
			before,
			g.CurrentPlayer.TimeLeft,
		)
	}

	if err := g.TogglePause(g.CurrentPlayer); err != nil {
		t.Fatalf("TogglePause failed: %v", err)
	}
	if g.Paused {
		t.Fatal("expected game to be resumed")
	}
}

func TestTogglePauseRejectsNonParticipant(t *testing.T) {
	g := buildGameForTimerStateTest(t)

	other, err := entities.NewPlayer(entities.Base, "x", "x", 3)
	if err != nil {
		t.Fatalf("NewPlayer failed: %v", err)
	}
	if err := g.TogglePause(other); err == nil {
		t.Fatal("expected non-participant pause attempt to fail")
	}
}
