package game

import (
	"sakura/entities"
	"testing"
)

func TestSetExtraVictoryPointsAwardsLargestArmyInSeafarers(t *testing.T) {
	players, err := entities.GetNewPlayers(entities.Seafarers, 2)
	if err != nil {
		t.Fatalf("GetNewPlayers failed: %v", err)
	}

	players[0].CurrentHand.DevelopmentCardDeckMap[entities.DevelopmentCardKnight].NumUsed = 3
	players[1].CurrentHand.DevelopmentCardDeckMap[entities.DevelopmentCardKnight].NumUsed = 2

	g := &Game{
		Mode:               entities.Seafarers,
		Players:            players,
		ExtraVictoryPoints: &entities.ExtraVictoryPoints{},
	}

	g.SetExtraVictoryPoints()

	if g.ExtraVictoryPoints.LargestArmyHolder != players[0] {
		t.Fatal("expected Seafarers largest army holder to be awarded")
	}
	if g.ExtraVictoryPoints.LargestArmyCount != 3 {
		t.Fatalf("expected largest army count to be 3, got %d", g.ExtraVictoryPoints.LargestArmyCount)
	}
	if got := g.GetVictoryPoints(players[0], true); got != 2 {
		t.Fatalf("expected largest army to grant 2 VP, got %d", got)
	}
}

func TestGetPlayerStateReportsKnightCountInSeafarers(t *testing.T) {
	player, err := entities.NewPlayer(entities.Seafarers, "p0", "p0", 0)
	if err != nil {
		t.Fatalf("NewPlayer failed: %v", err)
	}
	player.CurrentHand.DevelopmentCardDeckMap[entities.DevelopmentCardKnight].NumUsed = 4

	g := &Game{
		Mode:               entities.Seafarers,
		Players:            []*entities.Player{player},
		ExtraVictoryPoints: &entities.ExtraVictoryPoints{},
	}

	state := g.GetPlayerState(player)
	if state.Knights == nil {
		t.Fatal("expected knights count in Seafarers player state")
	}
	if *state.Knights != 4 {
		t.Fatalf("expected 4 used knights in Seafarers player state, got %d", *state.Knights)
	}
}
