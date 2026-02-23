package game

import "sakura/entities"

type ScenarioHookSet struct {
	FilterInitVertices func(g *Game, p *entities.Player, allowed []*entities.Vertex) []*entities.Vertex
	FilterInitEdges    func(g *Game, p *entities.Player, allowed []*entities.Edge) []*entities.Edge
	OnSettlementBuilt  func(g *Game, p *entities.Player, v *entities.Vertex)
	OnTurnStart        func(g *Game, p *entities.Player)
	OnDiceRolled       func(g *Game, roll int)
	VictoryEvaluator   func(g *Game) *entities.Player
}

func (g *Game) configureScenarioHooks() {
	g.ScenarioHooks = ScenarioHookSet{}
	if g.Settings.MapDefn == nil || g.Settings.MapDefn.Scenario == nil {
		return
	}

	switch g.Settings.MapDefn.Scenario.Key {
	case "seafarers_through_the_desert":
		g.configureThroughDesertHooks()
	}
}

func (g *Game) applyInitVertexScenarioHooks(p *entities.Player, allowed []*entities.Vertex) []*entities.Vertex {
	if g.ScenarioHooks.FilterInitVertices == nil {
		return allowed
	}
	return g.ScenarioHooks.FilterInitVertices(g, p, allowed)
}

func (g *Game) applyInitEdgeScenarioHooks(p *entities.Player, allowed []*entities.Edge) []*entities.Edge {
	if g.ScenarioHooks.FilterInitEdges == nil {
		return allowed
	}
	return g.ScenarioHooks.FilterInitEdges(g, p, allowed)
}

func (g *Game) onScenarioSettlementBuilt(p *entities.Player, v *entities.Vertex) {
	if g.ScenarioHooks.OnSettlementBuilt != nil {
		g.ScenarioHooks.OnSettlementBuilt(g, p, v)
	}
}

func (g *Game) onScenarioTurnStart(p *entities.Player) {
	if g.ScenarioHooks.OnTurnStart != nil {
		g.ScenarioHooks.OnTurnStart(g, p)
	}
}

func (g *Game) onScenarioDiceRolled(roll int) {
	if g.ScenarioHooks.OnDiceRolled != nil {
		g.ScenarioHooks.OnDiceRolled(g, roll)
	}
}

func (g *Game) getScenarioVictoryTarget() int {
	if g.Settings.MapDefn != nil &&
		g.Settings.MapDefn.Scenario != nil &&
		g.Settings.MapDefn.Scenario.VictoryPoints > 0 {
		return g.Settings.MapDefn.Scenario.VictoryPoints
	}
	return g.Settings.VictoryPoints
}

func (g *Game) getScenarioVictoryWinner() *entities.Player {
	if g.ScenarioHooks.VictoryEvaluator != nil {
		return g.ScenarioHooks.VictoryEvaluator(g)
	}
	if g.GetVictoryPoints(g.CurrentPlayer, false) >= g.getScenarioVictoryTarget() {
		return g.CurrentPlayer
	}
	return nil
}
