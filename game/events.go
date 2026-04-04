package game

import (
	"log"
	"sakura/entities"
	"time"

	"github.com/vmihailenco/msgpack/v5"
)

func (g *Game) initializeEventSeq() {
	if g.Store == nil {
		return
	}

	lastSeq, err := g.Store.ReadLastGameEventSeq(g.ID)
	if err != nil {
		return
	}
	g.EventSeq = lastSeq
}

func (g *Game) nextGameEventSeq() uint64 {
	g.EventSeq++
	return g.EventSeq
}

func (g *Game) emitGameEvent(event *entities.GameEvent) {
	if event == nil || g.j.playing || !g.Initialized {
		return
	}

	event.Seq = g.nextGameEventSeq()
	event.CreatedAtUnixMs = time.Now().UnixMilli()

	serializedEvent, err := msgpack.Marshal(event)
	if err != nil {
		log.Println("error serializing game event:", err)
		return
	}

	if g.Store != nil {
		if err := g.Store.WriteGameEvents(g.ID, [][]byte{serializedEvent}); err != nil {
			log.Println("error writing game event:", err)
		}
	}

	g.BroadcastMessage(&entities.Message{
		Type: entities.MessageTypeGameEvent,
		Data: event,
	})
}

func groupEventCards(cards []entities.CardType) []entities.GameEventCard {
	if len(cards) == 0 {
		return nil
	}

	counts := make(map[entities.CardType]int)
	order := make([]entities.CardType, 0, len(cards))
	for _, cardType := range cards {
		if counts[cardType] == 0 {
			order = append(order, cardType)
		}
		counts[cardType]++
	}

	result := make([]entities.GameEventCard, 0, len(order))
	for _, cardType := range order {
		result = append(result, entities.GameEventCard{
			Type:     cardType,
			Quantity: counts[cardType],
		})
	}
	return result
}

func offerDetailsToEventCards(values [9]int) []entities.GameEventCard {
	result := make([]entities.GameEventCard, 0)
	for i, quantity := range values {
		if i == 0 || quantity <= 0 {
			continue
		}
		result = append(result, entities.GameEventCard{
			Type:     entities.CardType(i),
			Quantity: quantity,
		})
	}
	return result
}

func gainInfoToEventCards(moves []entities.CardMoveInfo, playerOrder int) []entities.GameEventCard {
	collected := make([]entities.CardType, 0)
	for _, move := range moves {
		if move.GainerOrder != playerOrder {
			continue
		}
		if move.CardType < entities.CardTypeWood || move.CardType > entities.CardTypeCoin {
			continue
		}
		for i := 0; i < move.Quantity; i++ {
			collected = append(collected, move.CardType)
		}
	}
	return groupEventCards(collected)
}

func (g *Game) emitDiceRolledEvent(state *entities.DieRollState) {
	if state == nil || g.CurrentPlayer == nil {
		return
	}

	g.emitGameEvent(&entities.GameEvent{
		Type:       entities.GameEventTypeDiceRolled,
		ActorOrder: int(g.CurrentPlayer.Order),
		RedRoll:    state.RedRoll,
		WhiteRoll:  state.WhiteRoll,
		EventRoll:  state.EventRoll,
	})
}

func (g *Game) emitResourcesReceivedEvent(playerOrder int, cards []entities.GameEventCard) {
	if len(cards) == 0 {
		return
	}

	g.emitGameEvent(&entities.GameEvent{
		Type:       entities.GameEventTypeResourcesReceived,
		ActorOrder: playerOrder,
		Resources:  cards,
	})
}

func (g *Game) emitBuildPlacedEvent(playerOrder int, buildableType entities.BuildableType) {
	g.emitGameEvent(&entities.GameEvent{
		Type:          entities.GameEventTypeBuildPlaced,
		ActorOrder:    playerOrder,
		BuildableType: buildableType,
	})
}

func (g *Game) emitDevCardBoughtEvent(playerOrder int) {
	g.emitGameEvent(&entities.GameEvent{
		Type:       entities.GameEventTypeDevCardBought,
		ActorOrder: playerOrder,
	})
}

func (g *Game) emitDevCardPlayedEvent(playerOrder int, cardType entities.DevelopmentCardType) {
	g.emitGameEvent(&entities.GameEvent{
		Type:            entities.GameEventTypeDevCardPlayed,
		ActorOrder:      playerOrder,
		DevelopmentCard: cardType,
	})
}

func (g *Game) emitBankTradeCompletedEvent(playerOrder int, given, received []entities.GameEventCard) {
	g.emitGameEvent(&entities.GameEvent{
		Type:       entities.GameEventTypeBankTradeCompleted,
		ActorOrder: playerOrder,
		Given:      given,
		Received:   received,
	})
}

func (g *Game) emitPlayerTradeCompletedEvent(playerOrder int, counterpartyOrder int, given, received []entities.GameEventCard) {
	g.emitGameEvent(&entities.GameEvent{
		Type:              entities.GameEventTypePlayerTradeDone,
		ActorOrder:        playerOrder,
		CounterpartyOrder: counterpartyOrder,
		Given:             given,
		Received:          received,
	})
}

func (g *Game) emitCardsStolenEvent(stealerOrder int, victimOrder int) {
	g.emitGameEvent(&entities.GameEvent{
		Type:        entities.GameEventTypeCardsStolen,
		ActorOrder:  stealerOrder,
		TargetOrder: victimOrder,
	})
}

func (g *Game) emitCardsDiscardedEvent(playerOrder int, cards []entities.GameEventCard) {
	if len(cards) == 0 {
		return
	}

	g.emitGameEvent(&entities.GameEvent{
		Type:       entities.GameEventTypeCardsDiscarded,
		ActorOrder: playerOrder,
		Resources:  cards,
	})
}

func (g *Game) emitRobberMovedEvent(playerOrder int, token string) {
	g.emitGameEvent(&entities.GameEvent{
		Type:       entities.GameEventTypeRobberMoved,
		ActorOrder: playerOrder,
		Token:      token,
	})
}
