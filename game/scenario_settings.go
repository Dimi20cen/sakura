package game

func (g *Game) NormalizeScenarioSettings() {
	if g == nil || g.Settings.MapDefn == nil || g.Settings.MapDefn.Scenario == nil {
		return
	}
	if g.Settings.MapDefn.Scenario.VictoryPoints > 0 {
		g.Settings.VictoryPoints = g.Settings.MapDefn.Scenario.VictoryPoints
	}
}
