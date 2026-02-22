package game

import (
	"imperials/entities"
	"testing"
	"time"
)

func buildGameForTimerStateTest(t *testing.T) *Game {
	t.Helper()

	players, err := entities.GetNewPlayers(entities.Base, 2)
	if err != nil {
		t.Fatalf("GetNewPlayers failed: %v", err)
	}
	bank, err := entities.GetNewBank(entities.Base)
	if err != nil {
		t.Fatalf("GetNewBank failed: %v", err)
	}

	g := &Game{
		Mode:               entities.Base,
		Players:            players,
		CurrentPlayer:      players[0],
		Bank:               bank,
		Robber:             &entities.Robber{},
		ExtraVictoryPoints: &entities.ExtraVictoryPoints{},
		TimerPhaseId:       7,
	}
	g.CurrentPlayer.TimeLeft = 42
	return g
}

func TestGetGameStateTimerEndsAtMsPaused(t *testing.T) {
	g := buildGameForTimerStateTest(t)
	g.TickerPause = true

	gs := g.GetGameState()
	if gs.ServerNowMs == 0 {
		t.Fatalf("expected ServerNowMs to be populated")
	}
	if gs.TimerEndsAtMs != 0 {
		t.Fatalf("expected TimerEndsAtMs=0 while paused, got %d", gs.TimerEndsAtMs)
	}
}

func TestGetGameStateTimerEndsAtMsPausedWithCurrentPendingAction(t *testing.T) {
	g := buildGameForTimerStateTest(t)
	g.TickerPause = true
	g.CurrentPlayer.PendingAction = &entities.PlayerAction{Type: entities.PlayerActionTypeChooseTile}

	before := time.Now().UnixMilli()
	gs := g.GetGameState()
	after := time.Now().UnixMilli()
	if gs.ServerNowMs < before || gs.ServerNowMs > after {
		t.Fatalf(
			"expected ServerNowMs in [%d, %d], got %d",
			before,
			after,
			gs.ServerNowMs,
		)
	}

	minExpected := before + int64(g.CurrentPlayer.TimeLeft)*1000
	maxExpected := after + int64(g.CurrentPlayer.TimeLeft)*1000
	if gs.TimerEndsAtMs < minExpected || gs.TimerEndsAtMs > maxExpected {
		t.Fatalf(
			"expected TimerEndsAtMs in [%d, %d], got %d",
			minExpected,
			maxExpected,
			gs.TimerEndsAtMs,
		)
	}
}

func TestGetGameStateTimerEndsAtMsRunning(t *testing.T) {
	g := buildGameForTimerStateTest(t)
	g.TickerPause = false

	before := time.Now().UnixMilli()
	gs := g.GetGameState()
	after := time.Now().UnixMilli()
	if gs.ServerNowMs < before || gs.ServerNowMs > after {
		t.Fatalf(
			"expected ServerNowMs in [%d, %d], got %d",
			before,
			after,
			gs.ServerNowMs,
		)
	}

	minExpected := before + int64(g.CurrentPlayer.TimeLeft)*1000
	maxExpected := after + int64(g.CurrentPlayer.TimeLeft)*1000
	if gs.TimerEndsAtMs < minExpected || gs.TimerEndsAtMs > maxExpected {
		t.Fatalf(
			"expected TimerEndsAtMs in [%d, %d], got %d",
			minExpected,
			maxExpected,
			gs.TimerEndsAtMs,
		)
	}
}
