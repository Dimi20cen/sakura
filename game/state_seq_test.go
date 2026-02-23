package game

import "testing"

func TestGetGameStateIncludesStateSeq(t *testing.T) {
	g := buildGameForTimerStateTest(t)
	g.StateSeq = 9

	gs := g.GetGameState()
	if gs.StateSeq != 9 {
		t.Fatalf("expected StateSeq=9, got %d", gs.StateSeq)
	}
}

func TestBroadcastStateIncrementsStateSeq(t *testing.T) {
	g := buildGameForTimerStateTest(t)
	g.Initialized = true

	before := g.StateSeq
	g.BroadcastState()
	if g.StateSeq != before+1 {
		t.Fatalf("expected StateSeq to increment by 1, got before=%d after=%d", before, g.StateSeq)
	}
}
