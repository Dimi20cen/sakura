package game

import (
	"imperials/entities"
	"testing"
)

func TestTimerValuesForSpeed(t *testing.T) {
	tests := []struct {
		name     string
		speed    string
		expected TimerValues
	}{
		{
			name:  "15s custom turn",
			speed: entities.Speed15s,
			expected: TimerValues{
				DiceRoll:     10,
				Turn:         15,
				DiscardCards: 20,
				PlaceRobber:  15,
				ChoosePlayer: 10,
				InitVert:     60,
				InitEdge:     15,
				UseDevCard:   10,
				SpecialBuild: 10,
			},
		},
		{
			name:  "30s very fast tier",
			speed: entities.Speed30s,
			expected: TimerValues{
				DiceRoll:     10,
				Turn:         30,
				DiscardCards: 20,
				PlaceRobber:  15,
				ChoosePlayer: 10,
				InitVert:     60,
				InitEdge:     15,
				UseDevCard:   10,
				SpecialBuild: 10,
			},
		},
		{
			name:  "60s fast tier",
			speed: entities.Speed60s,
			expected: TimerValues{
				DiceRoll:     10,
				Turn:         60,
				DiscardCards: 20,
				PlaceRobber:  20,
				ChoosePlayer: 20,
				InitVert:     120,
				InitEdge:     30,
				UseDevCard:   20,
				SpecialBuild: 10,
			},
		},
		{
			name:  "120s normal tier",
			speed: entities.Speed120s,
			expected: TimerValues{
				DiceRoll:     20,
				Turn:         120,
				DiscardCards: 40,
				PlaceRobber:  40,
				ChoosePlayer: 40,
				InitVert:     180,
				InitEdge:     45,
				UseDevCard:   40,
				SpecialBuild: 20,
			},
		},
		{
			name:  "200m very slow tier",
			speed: entities.Speed200m,
			expected: TimerValues{
				DiceRoll:     3000,
				Turn:         12000,
				DiscardCards: 3000,
				PlaceRobber:  3000,
				ChoosePlayer: 3000,
				InitVert:     18000,
				InitEdge:     4500,
				UseDevCard:   3000,
				SpecialBuild: 3000,
			},
		},
		{
			name:  "legacy slow alias",
			speed: entities.SlowSpeed,
			expected: TimerValues{
				DiceRoll:     60,
				Turn:         240,
				DiscardCards: 80,
				PlaceRobber:  80,
				ChoosePlayer: 80,
				InitVert:     360,
				InitEdge:     90,
				UseDevCard:   60,
				SpecialBuild: 60,
			},
		},
		{
			name:  "legacy normal alias maps to 60s",
			speed: entities.NormalSpeed,
			expected: TimerValues{
				DiceRoll:     10,
				Turn:         60,
				DiscardCards: 20,
				PlaceRobber:  20,
				ChoosePlayer: 20,
				InitVert:     120,
				InitEdge:     30,
				UseDevCard:   20,
				SpecialBuild: 10,
			},
		},
		{
			name:  "legacy fast alias maps to 60s",
			speed: entities.FastSpeed,
			expected: TimerValues{
				DiceRoll:     10,
				Turn:         60,
				DiscardCards: 20,
				PlaceRobber:  20,
				ChoosePlayer: 20,
				InitVert:     120,
				InitEdge:     30,
				UseDevCard:   20,
				SpecialBuild: 10,
			},
		},
		{
			name:  "explicit 240s alias",
			speed: "240s",
			expected: TimerValues{
				DiceRoll:     60,
				Turn:         240,
				DiscardCards: 80,
				PlaceRobber:  80,
				ChoosePlayer: 80,
				InitVert:     360,
				InitEdge:     90,
				UseDevCard:   60,
				SpecialBuild: 60,
			},
		},
		{
			name:  "unknown speed defaults to 60s tier",
			speed: "unknown",
			expected: TimerValues{
				DiceRoll:     10,
				Turn:         60,
				DiscardCards: 20,
				PlaceRobber:  20,
				ChoosePlayer: 20,
				InitVert:     120,
				InitEdge:     30,
				UseDevCard:   20,
				SpecialBuild: 10,
			},
		},
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
