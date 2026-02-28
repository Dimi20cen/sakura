package game

import (
	"math/rand"
	"sakura/entities"
	"time"
)

func (g *Game) configureFogIslandsHooks() {}

func (g *Game) finalizeScenarioSetup() {
	if g.Settings.MapDefn == nil || g.Settings.MapDefn.Scenario == nil {
		return
	}

	switch g.Settings.MapDefn.Scenario.Key {
	case "seafarers_fog_islands":
		g.initializeFogIslandsStacks()
	}
}

func (g *Game) initializeFogIslandsStacks() {
	g.ScenarioFogTileStack = nil
	g.ScenarioFogNumberStack = nil

	for _, tile := range g.Tiles {
		if !tile.Fog {
			continue
		}
		g.ScenarioFogTileStack = append(g.ScenarioFogTileStack, tile.Type)
		if tile.Type != entities.TileTypeSea && tile.Type != entities.TileTypeDesert && tile.Number > 0 {
			g.ScenarioFogNumberStack = append(g.ScenarioFogNumberStack, tile.Number)
		}
		tile.Type = entities.TileTypeFog
		tile.Number = 0
		if g.j.g != nil {
			g.j.WSetTileType(tile)
		}
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(g.ScenarioFogTileStack), func(i, j int) {
		g.ScenarioFogTileStack[i], g.ScenarioFogTileStack[j] = g.ScenarioFogTileStack[j], g.ScenarioFogTileStack[i]
	})
	rand.Shuffle(len(g.ScenarioFogNumberStack), func(i, j int) {
		g.ScenarioFogNumberStack[i], g.ScenarioFogNumberStack[j] = g.ScenarioFogNumberStack[j], g.ScenarioFogNumberStack[i]
	})
}

func (g *Game) drawFogDiscoveryTile() (entities.TileType, bool) {
	if len(g.ScenarioFogTileStack) == 0 {
		return entities.TileTypeSea, false
	}
	last := len(g.ScenarioFogTileStack) - 1
	t := g.ScenarioFogTileStack[last]
	g.ScenarioFogTileStack = g.ScenarioFogTileStack[:last]
	return t, true
}

func (g *Game) drawFogDiscoveryNumber() uint16 {
	if len(g.ScenarioFogNumberStack) == 0 {
		return 0
	}
	last := len(g.ScenarioFogNumberStack) - 1
	n := g.ScenarioFogNumberStack[last]
	g.ScenarioFogNumberStack = g.ScenarioFogNumberStack[:last]
	return n
}
