package game

import (
	"sakura/entities"
	"testing"
)

func baseTimerValuesFor60s() TimerValues {
	return TimerValues{
		Turn:                       60,
		SettlementPlacement:        120,
		RoadPlacement:              30,
		Dice:                       10,
		PlaceRobber:                20,
		SelectWhoToRob:             20,
		SelectCardsToDiscard:       20,
		ActionBonusPlaceRoad:       10,
		ActionBonusPlaceSettlement: 10,
		ActionBonusPlaceCity:       10,
		ActionBonusNonTurnStateBoughtDevelopmentCard: 10,
		ActionBonusNonTurnStateAcceptingTrade:        10,
		DevCardNonTurnStatePlaceRobber:               20,
		DevCardPlace2MoreRoadBuilding:                20,
		DevCardPlace1MoreRoadBuilding:                20,
		DevCardSelect2ResourcesForYearOfPlenty:       20,
		DevCardSelect1ResourceForMonopoly:            20,
	}
}

func TestTimerValuesForSpeed(t *testing.T) {
	veryFast := TimerValues{
		Turn:                       30,
		SettlementPlacement:        60,
		RoadPlacement:              15,
		Dice:                       10,
		PlaceRobber:                15,
		SelectWhoToRob:             10,
		SelectCardsToDiscard:       20,
		ActionBonusPlaceRoad:       5,
		ActionBonusPlaceSettlement: 5,
		ActionBonusPlaceCity:       5,
		ActionBonusNonTurnStateBoughtDevelopmentCard: 5,
		ActionBonusNonTurnStateAcceptingTrade:        10,
		DevCardNonTurnStatePlaceRobber:               10,
		DevCardPlace2MoreRoadBuilding:                10,
		DevCardPlace1MoreRoadBuilding:                10,
		DevCardSelect2ResourcesForYearOfPlenty:       10,
		DevCardSelect1ResourceForMonopoly:            10,
	}

	normal120 := TimerValues{
		Turn:                       120,
		SettlementPlacement:        180,
		RoadPlacement:              45,
		Dice:                       20,
		PlaceRobber:                40,
		SelectWhoToRob:             40,
		SelectCardsToDiscard:       40,
		ActionBonusPlaceRoad:       20,
		ActionBonusPlaceSettlement: 20,
		ActionBonusPlaceCity:       20,
		ActionBonusNonTurnStateBoughtDevelopmentCard: 20,
		ActionBonusNonTurnStateAcceptingTrade:        20,
		DevCardNonTurnStatePlaceRobber:               40,
		DevCardPlace2MoreRoadBuilding:                40,
		DevCardPlace1MoreRoadBuilding:                40,
		DevCardSelect2ResourcesForYearOfPlenty:       40,
		DevCardSelect1ResourceForMonopoly:            40,
	}

	slow240 := TimerValues{
		Turn:                       240,
		SettlementPlacement:        360,
		RoadPlacement:              90,
		Dice:                       60,
		PlaceRobber:                80,
		SelectWhoToRob:             80,
		SelectCardsToDiscard:       80,
		ActionBonusPlaceRoad:       60,
		ActionBonusPlaceSettlement: 60,
		ActionBonusPlaceCity:       60,
		ActionBonusNonTurnStateBoughtDevelopmentCard: 60,
		ActionBonusNonTurnStateAcceptingTrade:        60,
		DevCardNonTurnStatePlaceRobber:               60,
		DevCardPlace2MoreRoadBuilding:                60,
		DevCardPlace1MoreRoadBuilding:                60,
		DevCardSelect2ResourcesForYearOfPlenty:       60,
		DevCardSelect1ResourceForMonopoly:            60,
	}

	verySlow := TimerValues{
		Turn:                       12000,
		SettlementPlacement:        18000,
		RoadPlacement:              4500,
		Dice:                       3000,
		PlaceRobber:                3000,
		SelectWhoToRob:             3000,
		SelectCardsToDiscard:       3000,
		ActionBonusPlaceRoad:       3000,
		ActionBonusPlaceSettlement: 3000,
		ActionBonusPlaceCity:       3000,
		ActionBonusNonTurnStateBoughtDevelopmentCard: 3000,
		ActionBonusNonTurnStateAcceptingTrade:        3000,
		DevCardNonTurnStatePlaceRobber:               3000,
		DevCardPlace2MoreRoadBuilding:                3000,
		DevCardPlace1MoreRoadBuilding:                3000,
		DevCardSelect2ResourcesForYearOfPlenty:       3000,
		DevCardSelect1ResourceForMonopoly:            3000,
	}

	extraFast15s := veryFast
	extraFast15s.Turn = 15

	tests := []struct {
		name     string
		speed    string
		expected TimerValues
	}{
		{name: "15s custom turn", speed: entities.Speed15s, expected: extraFast15s},
		{name: "30s very fast tier", speed: entities.Speed30s, expected: veryFast},
		{name: "60s fast tier", speed: entities.Speed60s, expected: baseTimerValuesFor60s()},
		{name: "120s normal tier", speed: entities.Speed120s, expected: normal120},
		{name: "200m very slow tier", speed: entities.Speed200m, expected: verySlow},
		{name: "200 min alias maps to very slow tier", speed: "200 min", expected: verySlow},
		{name: "240s slow tier", speed: "240s", expected: slow240},
		{name: "legacy slow alias", speed: entities.SlowSpeed, expected: slow240},
		{name: "legacy normal alias maps to 60s", speed: entities.NormalSpeed, expected: baseTimerValuesFor60s()},
		{name: "legacy fast alias maps to 60s", speed: entities.FastSpeed, expected: baseTimerValuesFor60s()},
		{name: "unknown speed defaults to 60s tier", speed: "unknown", expected: baseTimerValuesFor60s()},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := timerValuesForSpeed(tt.speed)
			if got != tt.expected {
				t.Fatalf("timerValuesForSpeed(%q) = %+v, expected %+v", tt.speed, got, tt.expected)
			}
		})
	}
}
