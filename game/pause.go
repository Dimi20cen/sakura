package game

import (
	"errors"
	"sakura/entities"
)

// TogglePause pauses/resumes gameplay timer progression.
// Expects game lock to be held by caller context.
func (g *Game) TogglePause(player *entities.Player) error {
	if g.GameOver {
		return errors.New("game is already over")
	}
	if player == nil || player.IsSpectator {
		return errors.New("spectators cannot pause the game")
	}

	isParticipant := false
	for _, p := range g.Players {
		if p == player {
			isParticipant = true
			break
		}
	}
	if !isParticipant {
		return errors.New("player is not part of this game")
	}

	g.Paused = !g.Paused
	g.bumpTimerPhase()
	g.BroadcastState()
	return nil
}
