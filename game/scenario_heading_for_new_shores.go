package game

import "sakura/entities"

func (g *Game) configureHeadingForNewShoresHooks() {
	g.ScenarioHooks.FilterInitVertices = func(g *Game, p *entities.Player, allowed []*entities.Vertex) []*entities.Vertex {
		g.ensureScenarioLandRegions()
		if g.ScenarioLandMainRegion == 0 {
			return allowed
		}

		filtered := make([]*entities.Vertex, 0, len(allowed))
		for _, v := range allowed {
			if g.scenarioVertexTouchesLandRegion(v, g.ScenarioLandMainRegion) {
				filtered = append(filtered, v)
			}
		}
		return filtered
	}

	g.ScenarioHooks.FilterInitEdges = func(g *Game, p *entities.Player, allowed []*entities.Edge) []*entities.Edge {
		g.ensureScenarioLandRegions()
		if g.ScenarioLandMainRegion == 0 {
			return allowed
		}

		filtered := make([]*entities.Edge, 0, len(allowed))
		for _, e := range allowed {
			if g.scenarioEdgeTouchesLandRegion(e, g.ScenarioLandMainRegion) {
				filtered = append(filtered, e)
			}
		}
		return filtered
	}

	g.ScenarioHooks.OnSettlementBuilt = func(g *Game, p *entities.Player, v *entities.Vertex) {
		g.applyScenarioOuterIslandSettlementBonus(p, v)
	}
}

func (g *Game) scenarioNeighborCenters(c entities.Coordinate) []entities.Coordinate {
	return []entities.Coordinate{
		{X: c.X + 2, Y: c.Y - 4},
		{X: c.X + 4, Y: c.Y},
		{X: c.X + 2, Y: c.Y + 4},
		{X: c.X - 2, Y: c.Y + 4},
		{X: c.X - 4, Y: c.Y},
		{X: c.X - 2, Y: c.Y - 4},
	}
}

func (g *Game) ensureScenarioLandRegions() {
	if len(g.ScenarioLandRegionByTile) > 0 {
		return
	}

	isLandTile := func(t *entities.Tile) bool {
		return t != nil && t.Type != entities.TileTypeSea && t.Type != entities.TileTypeNone
	}

	regionID := 0
	sizeByRegion := make(map[int]int)
	for _, tile := range g.Tiles {
		if !isLandTile(tile) {
			continue
		}
		if _, ok := g.ScenarioLandRegionByTile[tile.Center]; ok {
			continue
		}

		regionID++
		stack := []entities.Coordinate{tile.Center}
		for len(stack) > 0 {
			last := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			if _, ok := g.ScenarioLandRegionByTile[last]; ok {
				continue
			}
			curr := g.Tiles[last]
			if !isLandTile(curr) {
				continue
			}
			g.ScenarioLandRegionByTile[last] = regionID
			sizeByRegion[regionID]++
			for _, n := range g.scenarioNeighborCenters(last) {
				if _, seen := g.ScenarioLandRegionByTile[n]; seen {
					continue
				}
				if nt := g.Tiles[n]; isLandTile(nt) {
					stack = append(stack, n)
				}
			}
		}
	}

	g.ScenarioLandMainRegion = 0
	maxSize := 0
	for rid, sz := range sizeByRegion {
		if sz > maxSize {
			maxSize = sz
			g.ScenarioLandMainRegion = rid
		}
	}
}

func (g *Game) applyScenarioOuterIslandSettlementBonus(p *entities.Player, v *entities.Vertex) {
	if p == nil || v == nil {
		return
	}
	g.ensureScenarioLandRegions()
	if len(g.ScenarioLandRegionByTile) == 0 || g.ScenarioLandMainRegion == 0 {
		return
	}

	if g.ScenarioLandAwarded[p] == nil {
		g.ScenarioLandAwarded[p] = make(map[int]bool)
	}

	awardedRegion := 0
	for _, t := range v.AdjacentTiles {
		if t == nil {
			continue
		}
		rid, ok := g.ScenarioLandRegionByTile[t.Center]
		if !ok || rid == g.ScenarioLandMainRegion || g.ScenarioLandAwarded[p][rid] {
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

func (g *Game) scenarioVertexTouchesLandRegion(v *entities.Vertex, regionID int) bool {
	if v == nil || regionID == 0 {
		return false
	}
	for _, t := range v.AdjacentTiles {
		if t == nil {
			continue
		}
		if rid, ok := g.ScenarioLandRegionByTile[t.Center]; ok && rid == regionID {
			return true
		}
	}
	return false
}

func (g *Game) scenarioEdgeTouchesLandRegion(e *entities.Edge, regionID int) bool {
	if e == nil || regionID == 0 {
		return false
	}
	for _, t := range e.AdjacentTiles {
		if t == nil {
			continue
		}
		if rid, ok := g.ScenarioLandRegionByTile[t.Center]; ok && rid == regionID {
			return true
		}
	}
	return false
}
