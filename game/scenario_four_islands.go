package game

import "sakura/entities"

func (g *Game) configureFourIslandsHooks() {
	g.ScenarioHooks.OnSettlementBuilt = func(g *Game, p *entities.Player, v *entities.Vertex) {
		g.trackFourIslandsHomeIsland(p, v)
		g.applyFourIslandsSettlementBonus(p, v)
	}
}

func (g *Game) trackFourIslandsHomeIsland(p *entities.Player, v *entities.Vertex) {
	if p == nil || v == nil || !g.IsInitPhase() {
		return
	}

	g.ensureScenarioLandRegions()
	if len(g.ScenarioLandRegionByTile) == 0 {
		return
	}

	if g.ScenarioLandHome[p] == nil {
		g.ScenarioLandHome[p] = make(map[int]bool)
	}

	// The player's first two settlements during init define their home islands.
	if len(p.VertexPlacements) > 2 {
		return
	}

	for _, t := range v.AdjacentTiles {
		if t == nil {
			continue
		}
		if rid, ok := g.ScenarioLandRegionByTile[t.Center]; ok {
			g.ScenarioLandHome[p][rid] = true
		}
	}
}

func (g *Game) applyFourIslandsSettlementBonus(p *entities.Player, v *entities.Vertex) {
	if p == nil || v == nil || g.IsInitPhase() {
		return
	}

	g.ensureScenarioLandRegions()
	if len(g.ScenarioLandRegionByTile) == 0 {
		return
	}

	if g.ScenarioLandAwarded[p] == nil {
		g.ScenarioLandAwarded[p] = make(map[int]bool)
	}
	if g.ScenarioLandHome[p] == nil {
		g.ScenarioLandHome[p] = make(map[int]bool)
	}

	awardedRegion := 0
	for _, t := range v.AdjacentTiles {
		if t == nil {
			continue
		}
		rid, ok := g.ScenarioLandRegionByTile[t.Center]
		if !ok || g.ScenarioLandHome[p][rid] || g.ScenarioLandAwarded[p][rid] {
			continue
		}
		awardedRegion = rid
		break
	}
	if awardedRegion == 0 {
		return
	}

	g.ScenarioLandAwarded[p][awardedRegion] = true
	g.ScenarioBonusVP[p] += 2
}
