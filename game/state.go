package game

import (
	"imperials/entities"
	"log"
	"sort"
	"time"

	"github.com/vmihailenco/msgpack/v5"
)

// GetGameState for game g creates a list of PlayerStates for each Player in game
func (g *Game) GetGameState() *entities.GameState {
	playerStates := make([]*entities.PlayerState, len(g.Players))
	needDice := !g.IsInitPhase() && g.DiceState == 0 && !g.HasPlayerPendingAction()
	serverNowMs := time.Now().UnixMilli()
	currentPlayerOrder := uint16(0)
	currentTimeLeft := 0
	if g.CurrentPlayer != nil {
		currentPlayerOrder = g.CurrentPlayer.Order
		currentTimeLeft = g.CurrentPlayer.TimeLeft
	}
	if currentTimeLeft < 0 {
		currentTimeLeft = 0
	}
	timerEndsAtMs := int64(0)
	shouldAdvanceTimer := !g.TickerPause ||
		(g.CurrentPlayer != nil && g.CurrentPlayer.PendingAction != nil)
	if shouldAdvanceTimer {
		timerEndsAtMs = serverNowMs + int64(currentTimeLeft)*1000
	}

	for i, p := range g.Players {
		playerStates[i] = g.GetPlayerState(p)
	}

	return &entities.GameState{
		CurrentPlayerOrder: currentPlayerOrder,
		NeedDice:           needDice,
		TimerPhaseId:       g.TimerPhaseId,
		TimerEndsAtMs:      timerEndsAtMs,
		ServerNowMs:        serverNowMs,
		Robber:             g.Robber,
		Merchant:           g.Merchant,
		PlayerStates:       playerStates,
		BankWood:           g.Bank.Hand.GetCardDeck(entities.CardTypeWood).Quantity,
		BankBrick:          g.Bank.Hand.GetCardDeck(entities.CardTypeBrick).Quantity,
		BankWool:           g.Bank.Hand.GetCardDeck(entities.CardTypeWool).Quantity,
		BankWheat:          g.Bank.Hand.GetCardDeck(entities.CardTypeWheat).Quantity,
		BankOre:            g.Bank.Hand.GetCardDeck(entities.CardTypeOre).Quantity,
		BankDevRemaining:   int16(g.GetBankDevelopmentRemaining()),

		BarbarianPosition: g.BarbarianPosition,
		BarbarianStrength: g.GetBarbarianStrength(),
		BarbarianKnights:  g.GetBarbarianKnights(),
	}
}

func (g *Game) GetBankDevelopmentRemaining() int {
	if g.Mode == entities.CitiesAndKnights {
		return len(g.Bank.DevelopmentCardOrder[entities.CardTypePaper]) +
			len(g.Bank.DevelopmentCardOrder[entities.CardTypeCloth]) +
			len(g.Bank.DevelopmentCardOrder[entities.CardTypeCoin])
	}

	deck := g.Bank.DevelopmentCardOrder[0]
	remaining := len(deck) - g.Bank.DevelopmentCardCursor
	if remaining < 0 {
		return 0
	}
	return remaining
}

func (g *Game) GetPlayerState(p *entities.Player) *entities.PlayerState {
	knights := int16(-1)
	if g.Mode == entities.Base {
		knights = p.CurrentHand.DevelopmentCardDeckMap[entities.DevelopmentCardKnight].NumUsed
	} else if g.Mode == entities.CitiesAndKnights {
		knights = int16(p.GetActivatedKnightStrength())
	}

	return &entities.PlayerState{
		Id:                  p.Id,
		Username:            p.Username,
		Order:               p.Order,
		Color:               p.Color,
		RandInt:             p.RandInt,
		NumCards:            int16(p.CurrentHand.GetCardCount()),
		NumDevelopmentCards: int16(p.CurrentHand.GetDevelopmentCardCount()),
		Current:             g.CurrentPlayer == p,
		HasPendingAction:    p.PendingAction != nil,
		VictoryPoints:       g.GetVictoryPoints(p, true),
		LongestRoad:         p.LongestRoad,
		Knights:             &knights,
		TimeLeft:            p.TimeLeft,
		Improvements:        p.Improvements,
		DiscardLimit:        g.GetDiscardLimit(p),
		IsBot:               p.GetIsBot(),
		HasLongestRoad:      g.ExtraVictoryPoints.LongestRoadHolder == p,
		HasLargestArmy:      g.ExtraVictoryPoints.LargestArmyHolder == p,
	}
}

func (g *Game) GetPlayerSecretState(p *entities.Player) entities.PlayerSecretState {
	cardData := make(map[entities.CardType]int)
	for t, deck := range p.CurrentHand.CardDeckMap {
		cardData[t] = int(deck.Quantity)
	}

	commonBusy := g.HasPlayerPendingAction() ||
		g.CurrentPlayer != p ||
		g.GameOver ||
		p.IsSpectator
	busy := commonBusy || g.DiceState == 0

	actions := entities.AllowedActionsMap{
		BuildSettlement: !busy && g.ensureCanBuild(p, entities.BTSettlement) == nil &&
			len(p.GetBuildLocationsSettlement(g.Graph, false, false)) > 0,
		BuildCity: !busy && g.ensureCanBuild(p, entities.BTCity) == nil &&
			len(p.GetBuildLocationsCity(g.Graph)) > 0,
		BuildRoad: !busy && g.ensureCanBuild(p, entities.BTRoad) == nil &&
			len(p.GetBuildLocationsRoad(g.Graph, false)) > 0,
		BuildShip: !busy && g.ensureCanBuild(p, entities.BTShip) == nil &&
			len(p.GetBuildLocationsShip(g.Graph)) > 0,
		MoveShip: !commonBusy && g.DiceState != 0 && g.Mode == entities.Seafarers &&
			!p.ShipMoved && len(g.GetMovableShips(p)) > 0,
		BuyDevelopmentCard: !busy &&
			(g.IsCreativeMode() || p.CanBuyDevelopmentCard()),
		Trade:   !busy && !g.SpecialBuildPhase,
		EndTurn: !busy && g.CanEndTurn() == nil,

		BuildKnight: !busy && (g.ensureCanBuild(p, entities.BTKnight1) == nil ||
			g.ensureCanBuild(p, entities.BTKnight2) == nil ||
			g.ensureCanBuild(p, entities.BTKnight3) == nil),
		ActivateKnight: !busy && (g.IsCreativeMode() || p.CurrentHand.HasResources(0, 0, 0, 1, 0)) &&
			len(p.GetActivateLocationsKnight(g.Graph)) > 0,
		RobberKnight: !busy && !g.SpecialBuildPhase && g.KnightChaseRobber(p, true) == nil,
		MoveKnight:   !busy && !g.SpecialBuildPhase && g.KnightMove(p, true) == nil,
		BuildWall:    !busy && g.ensureCanBuild(p, entities.BTWall) == nil && len(p.GetBuildLocationsWall(g.Graph)) > 0,

		ImprovePaper: p.ChoosingProgressCard || (!busy || p.UsingDevCard == entities.ProgressPaperCrane) && (g.CanBuildImprovement(p, entities.CardTypePaper) == nil),
		ImproveCloth: p.ChoosingProgressCard || (!busy || p.UsingDevCard == entities.ProgressPaperCrane) && (g.CanBuildImprovement(p, entities.CardTypeCloth) == nil),
		ImproveCoin:  p.ChoosingProgressCard || (!busy || p.UsingDevCard == entities.ProgressPaperCrane) && (g.CanBuildImprovement(p, entities.CardTypeCoin) == nil),

		SpecialBuild: g.Settings.SpecialBuild && g.CurrentPlayer != p && g.SpecialBuildStarter != p && !p.SpecialBuild,
	}

	g.ComputeProgressCardsUsable(p)

	dcards := make([]int, 0)
	for _, deck := range p.CurrentHand.DevelopmentCardDeckMap {
		if deck.Quantity > 0 {
			t := int(deck.Type)
			if deck.CanUse {
				t |= 1 << 15
			}

			for i := 0; i < int(deck.Quantity); i++ {
				dcards = append(dcards, t)
			}
		}
	}

	vp := 0
	if g.Mode == entities.Base {
		vp = g.GetVictoryPoints(p, false)
	}

	ratios := g.GetRatiosForPlayer(p)

	return entities.PlayerSecretState{
		Cards:            cardData,
		DevelopmentCards: dcards,
		BuildablesLeft:   p.BuildablesLeft,
		VictoryPoints:    vp,
		AllowedActions:   actions,
		TradeRatios:      ratios[:],
	}
}

func (g *Game) SetExtraVictoryPoints() {
	// Longest Road
	oldHolder := g.ExtraVictoryPoints.LongestRoadHolder
	longest := 0
	leaders := make([]*entities.Player, 0)
	for _, p := range g.Players {
		longestRoad := p.GetLongestRoad(g.Graph)
		p.LongestRoad = longestRoad
		if longestRoad > longest {
			longest = longestRoad
			leaders = []*entities.Player{p}
		} else if longestRoad == longest {
			leaders = append(leaders, p)
		}
	}
	newHolder := (*entities.Player)(nil)
	if longest >= 5 {
		if len(leaders) == 1 {
			newHolder = leaders[0]
		} else if oldHolder != nil && oldHolder.LongestRoad == longest {
			// On ties the current holder keeps the tile.
			newHolder = oldHolder
		}
	}
	g.ExtraVictoryPoints.LongestRoadHolder = newHolder
	if newHolder != nil && newHolder != oldHolder {
		g.BroadcastDevCardUse(entities.CardLongestRoad, DevCardShowTime, int(newHolder.Order))
	}

	// Largest Army
	if g.Mode == entities.Base {
		for _, p := range g.Players {
			deck := p.CurrentHand.DevelopmentCardDeckMap[entities.DevelopmentCardKnight]
			if deck != nil && deck.NumUsed >= 3 && deck.NumUsed > g.ExtraVictoryPoints.LargestArmyCount {
				g.ExtraVictoryPoints.LargestArmyCount = deck.NumUsed
				g.ExtraVictoryPoints.LargestArmyHolder = p
				g.BroadcastDevCardUse(entities.CardLargestArmy, DevCardShowTime, int(p.Order))
			}
		}
	}
}

func (g *Game) GetVictoryPoints(p *entities.Player, public bool) int {
	victoryPoints := 0

	// Longest Road
	if g.ExtraVictoryPoints.LongestRoadHolder == p {
		victoryPoints += 2
	}

	// Largest Army
	if g.ExtraVictoryPoints.LargestArmyHolder == p {
		victoryPoints += 2
	}

	// Buildings
	for _, placement := range p.VertexPlacements {
		if placement.GetType() == entities.BTCity {
			victoryPoints += 2
		} else if placement.GetType() == entities.BTSettlement {
			victoryPoints += 1
		}
	}

	if g.ScenarioBonusVP != nil {
		victoryPoints += g.ScenarioBonusVP[p]
	}

	if g.Mode == entities.CitiesAndKnights {
		// Defender
		for _, dp := range g.ExtraVictoryPoints.DefenderPoints {
			if dp == p {
				victoryPoints++
			} else if dp == nil {
				break
			}
		}

		// Metropolis
		for _, holder := range g.ExtraVictoryPoints.Metropolis {
			if holder == p {
				victoryPoints += 2
			}
		}

		// VP
		if g.ExtraVictoryPoints.ConstitutionHolder == p {
			victoryPoints++
		}
		if g.ExtraVictoryPoints.PrinterHolder == p {
			victoryPoints++
		}
		if g.Merchant.Owner == p {
			victoryPoints++
		}
	}

	if public {
		return victoryPoints
	}

	vpDeck := p.CurrentHand.GetDevelopmentCardDeck(entities.DevelopmentCardVictoryPoint)

	if vpDeck != nil {
		victoryPoints += int(vpDeck.Quantity)
	}

	return victoryPoints
}

func (g *Game) CheckForVictory() {
	if g.SpecialBuildPhase {
		return
	}

	winner := g.getScenarioVictoryWinner()
	if winner != nil {
		firstCheck := !g.GameOver
		g.GameOver = true
		g.SetExtraVictoryPoints()

		for _, p := range g.Players {
			g.SendPlayerSecret(p)
		}
		g.BroadcastState()

		message := entities.GameOverMessage{
			Players: make([]*entities.PlayerState, 0),
			Winner:  winner.Order,
		}

		for _, p := range g.Players {
			ps := g.GetPlayerState(p)
			ps.VictoryPoints = g.GetVictoryPoints(p, false)
			message.Players = append(message.Players, ps)

			if g.Mode == entities.CitiesAndKnights {
				ev := int16(0)
				if g.ExtraVictoryPoints.ConstitutionHolder == p {
					ev++
				}
				if g.ExtraVictoryPoints.PrinterHolder == p {
					ev++
				}
				ps.DevCardVp = &ev
			} else {
				devCardVp := p.CurrentHand.DevelopmentCardDeckMap[entities.DevelopmentCardVictoryPoint].Quantity
				ps.DevCardVp = &devCardVp
			}

			if firstCheck && !p.GetIsBot() {
				go g.Store.WriteGameCompletedForUser(p.Id)
			}
		}

		sort.Slice(message.Players, func(i, j int) bool {
			return message.Players[i].VictoryPoints > message.Players[j].VictoryPoints
		})

		g.BroadcastMessage(&entities.Message{
			Type: entities.MessageTypeGameOver,
			Data: message,
		})
		g.Store.WriteGameFinished(g.ID)

		gameState := g.GenerateStoreGameState()
		if gameState != nil {
			gameState.Winner = int(winner.Order)
			serialized, err := msgpack.Marshal(gameState)
			if err != nil {
				log.Println("error serializing game: ", err)
				return
			}
			g.Store.WriteGameState(g.ID, serialized)
		}
	}
}
