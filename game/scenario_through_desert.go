package game

import "imperials/entities"

func (g *Game) configureThroughDesertHooks() {
	g.ScenarioHooks.OnSettlementBuilt = func(g *Game, p *entities.Player, v *entities.Vertex) {
		g.applyThroughDesertSettlementBonus(p, v)
	}
}

func (g *Game) throughDesertNeighborCenters(c entities.Coordinate) []entities.Coordinate {
	return []entities.Coordinate{
		{X: c.X + 2, Y: c.Y - 4},
		{X: c.X + 4, Y: c.Y},
		{X: c.X + 2, Y: c.Y + 4},
		{X: c.X - 2, Y: c.Y + 4},
		{X: c.X - 4, Y: c.Y},
		{X: c.X - 2, Y: c.Y - 4},
	}
}

func (g *Game) ensureThroughDesertRegions() {
	if len(g.ScenarioDesertRegionByTile) > 0 {
		return
	}

	isLandRegionTile := func(t *entities.Tile) bool {
		return t != nil && t.Type != entities.TileTypeSea && t.Type != entities.TileTypeDesert
	}

	regionID := 0
	sizeByRegion := make(map[int]int)
	for _, tile := range g.Tiles {
		if !isLandRegionTile(tile) {
			continue
		}
		if _, ok := g.ScenarioDesertRegionByTile[tile.Center]; ok {
			continue
		}

		regionID++
		stack := []entities.Coordinate{tile.Center}
		for len(stack) > 0 {
			last := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			if _, ok := g.ScenarioDesertRegionByTile[last]; ok {
				continue
			}
			curr := g.Tiles[last]
			if !isLandRegionTile(curr) {
				continue
			}
			g.ScenarioDesertRegionByTile[last] = regionID
			sizeByRegion[regionID]++
			for _, n := range g.throughDesertNeighborCenters(last) {
				if _, seen := g.ScenarioDesertRegionByTile[n]; seen {
					continue
				}
				if nt := g.Tiles[n]; isLandRegionTile(nt) {
					stack = append(stack, n)
				}
			}
		}
	}

	g.ScenarioDesertMainRegion = 0
	maxSize := 0
	for rid, sz := range sizeByRegion {
		if sz > maxSize {
			maxSize = sz
			g.ScenarioDesertMainRegion = rid
		}
	}
}

func (g *Game) applyThroughDesertSettlementBonus(p *entities.Player, v *entities.Vertex) {
	if p == nil || v == nil {
		return
	}
	g.ensureThroughDesertRegions()
	if len(g.ScenarioDesertRegionByTile) == 0 || g.ScenarioDesertMainRegion == 0 {
		return
	}

	if g.ScenarioDesertAwarded[p] == nil {
		g.ScenarioDesertAwarded[p] = make(map[int]bool)
	}

	regionsToAward := make(map[int]bool)
	for _, t := range v.AdjacentTiles {
		if t == nil {
			continue
		}
		rid, ok := g.ScenarioDesertRegionByTile[t.Center]
		if !ok || rid == g.ScenarioDesertMainRegion {
			continue
		}
		regionsToAward[rid] = true
	}

	for rid := range regionsToAward {
		if g.ScenarioDesertAwarded[p][rid] {
			continue
		}
		g.ScenarioDesertAwarded[p][rid] = true
		g.ScenarioBonusVP[p] += 2
	}
}
