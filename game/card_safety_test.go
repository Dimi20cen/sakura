package game

import (
	"sakura/entities"
	"testing"
)

func TestMoveCardsRefusesToOverdrawPlayerHand(t *testing.T) {
	players, err := entities.GetNewPlayers(entities.Base, 2)
	if err != nil {
		t.Fatalf("GetNewPlayers failed: %v", err)
	}
	bank, err := entities.GetNewBank(entities.Base)
	if err != nil {
		t.Fatalf("GetNewBank failed: %v", err)
	}

	g := &Game{
		Store:              &noopStore{},
		Mode:               entities.Base,
		Players:            players,
		CurrentPlayer:      players[0],
		Bank:               bank,
		ExtraVictoryPoints: &entities.ExtraVictoryPoints{},
	}

	beforePlayer := players[0].CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity
	beforeBank := bank.Hand.GetCardDeck(entities.CardTypeWood).Quantity

	g.MoveCards(0, -1, entities.CardTypeWood, int(beforePlayer)+1, true, false)

	afterPlayer := players[0].CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity
	afterBank := bank.Hand.GetCardDeck(entities.CardTypeWood).Quantity
	if afterPlayer != beforePlayer {
		t.Fatalf("expected player wood to stay at %d, got %d", beforePlayer, afterPlayer)
	}
	if afterBank != beforeBank {
		t.Fatalf("expected bank wood to stay at %d, got %d", beforeBank, afterBank)
	}
}

func TestCanTradeWithBankRejectsOfferAbovePlayerHand(t *testing.T) {
	players, err := entities.GetNewPlayers(entities.Base, 2)
	if err != nil {
		t.Fatalf("GetNewPlayers failed: %v", err)
	}
	bank, err := entities.GetNewBank(entities.Base)
	if err != nil {
		t.Fatalf("GetNewBank failed: %v", err)
	}

	g := &Game{
		Store:              &noopStore{},
		Mode:               entities.Base,
		Players:            players,
		CurrentPlayer:      players[0],
		Bank:               bank,
		ExtraVictoryPoints: &entities.ExtraVictoryPoints{},
	}

	offer := &entities.TradeOfferDetails{}
	offer.Give[1] = int(players[0].CurrentHand.GetCardDeck(entities.CardTypeWood).Quantity) + 1
	offer.Ask[2] = 1

	if err := g.CanTradeWithBank(players[0], offer); err == nil {
		t.Fatal("expected bank trade validation to reject an offer above the player's hand")
	}
}
