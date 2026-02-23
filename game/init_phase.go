package game

import (
	"sakura/entities"
	"log"
	"math/rand"
	"strings"

	"github.com/mitchellh/mapstructure"
)

func (g *Game) IsInitPhase() bool {
	return g.InitPhase
}

func (g *Game) RunInitPhase() {
	// g.simuateInit()
	go g.startInitPhase()
}

func (g *Game) startInitPhase() {
	defer g.Unlock()
	if !g.Lock() {
		return
	}

	g.j.WSetInitPhase(g.InitPhase)
	built := 0
	lastInitSettlement := make(map[*entities.Player]*entities.Vertex)

	initialAllowedVertices := make(map[*entities.Vertex]bool)
	initialVertices := g.CurrentPlayer.GetBuildLocationsSettlement(g.Graph, true, false)
	for _, v := range initialVertices {
		initialAllowedVertices[v] = true
	}

	// Build at vertex
	initVertex := func(g *Game, p *entities.Player) {
		g.resetTimeLeft()
		AllowedVertices := make([]*entities.Vertex, 0)
		for _, v := range p.GetBuildLocationsSettlement(g.Graph, true, false) {
			if initialAllowedVertices[v] {
				AllowedVertices = append(AllowedVertices, v)
			}
		}
		AllowedVertices = g.applyInitVertexScenarioHooks(p, AllowedVertices)
		if len(AllowedVertices) == 0 {
			return
		}

		exp, err := g.BlockForAction(p, g.TimerVals.SettlementPlacement, &entities.PlayerAction{
			Type:    entities.PlayerActionTypeChooseVertex,
			Message: "Choose location for settlement",
			Data: &entities.PlayerActionChooseVertex{
				Allowed: AllowedVertices,
			},
		})
		if err != nil {
			return
		}

		var C entities.Coordinate
		err = mapstructure.Decode(exp, &C)
		if err != nil {
			C.X = -999 // Make it invalid
		}

		build := func(g *Game, C entities.Coordinate) error {
			if built >= len(g.Players) && g.Mode == entities.CitiesAndKnights {
				return g.BuildCity(p, C)
			} else {
				return g.BuildSettlement(p, C)
			}
		}

		err = build(g, C)
		if err != nil {
			C = g.ai.ChooseBestVertexSettlement(p, AllowedVertices).C
			_ = build(g, C)
		}
		builtVertex, _ := g.Graph.GetVertex(C)
		initialAllowedVertices[builtVertex] = false
		lastInitSettlement[p] = builtVertex

		if built >= len(g.Players) {
			v, _ := g.Graph.GetVertex(C)
			for _, t := range v.AdjacentTiles {
				if t.Type == entities.TileTypeGold {
					available := make([]entities.CardType, 0, 5)
					for i := 1; i <= 5; i++ {
						ct := entities.CardType(i)
						if g.Bank.Hand.GetCardDeck(ct).Quantity > 0 {
							available = append(available, ct)
						}
					}
					if len(available) == 0 {
						continue
					}

					expGold, errGold := g.BlockForAction(p, g.TimerVals.SettlementPlacement, &entities.PlayerAction{
						Type:    entities.PlayerActionTypeSelectCards,
						Message: "Choose a resource for starting gold",
						Data: entities.PlayerActionSelectCards{
							AllowedTypes: []int{1, 2, 3, 4, 5},
							Quantity:     1,
							NotSelfHand:  true,
						},
					})

					chosen := available[rand.Intn(len(available))]
					if errGold == nil {
						var cards []float64
						if mapstructure.Decode(expGold, &cards) == nil && len(cards) == 9 {
							for i := 1; i <= 5; i++ {
								ct := entities.CardType(i)
								if cards[i] > 0 && g.Bank.Hand.GetCardDeck(ct).Quantity > 0 {
									chosen = ct
									break
								}
							}
						}
					}

					g.MoveCards(-1, int(p.Order), chosen, 1, true, false)
					continue
				}

				if t.Type >= entities.TileTypeWood && t.Type <= entities.TileTypeOre {
					g.MoveCards(-1, int(p.Order), entities.CardType(t.Type), 1, true, false)
				}
			}
		}

		built++
	}

	// Build at edge
	initEdge := func(g *Game, p *entities.Player) {
		g.resetTimeLeft()
		anchor := lastInitSettlement[p]
		allowedEdges, roadAllowed, shipAllowed := g.getInitEdgeChoices(p, anchor)
		allowedEdges = g.applyInitEdgeScenarioHooks(p, allowedEdges)
		if len(allowedEdges) == 0 {
			return
		}

		msg := "Choose location for road"
		if g.Mode == entities.Seafarers {
			msg = "Choose location for road/ship"
		}
		exp, err := g.BlockForAction(p, g.TimerVals.RoadPlacement, &entities.PlayerAction{
			Type:    entities.PlayerActionTypeChooseEdge,
			Message: msg,
			Data: &entities.PlayerActionChooseEdge{
				Allowed: allowedEdges,
			},
		})
		if err != nil {
			return
		}

		var C entities.EdgeCoordinate
		err = mapstructure.Decode(exp, &C)
		if err != nil {
			C.C1.X = -999 // Make it invalid
		}

		edge, edgeErr := g.Graph.GetEdge(C)
		if edgeErr != nil {
			edge = nil
		}
		buildChosen := func(target *entities.Edge) error {
			if target == nil {
				return g.BuildRoad(p, C)
			}

			canRoad := roadAllowed[target]
			canShip := shipAllowed[target]
			if g.Mode != entities.Seafarers {
				return g.BuildRoad(p, target.C)
			}

			if canRoad && canShip {
				choice := "road"
				if p.GetIsBot() {
					choice = "ship"
				} else {
					resp, respErr := g.BlockForAction(p, g.TimerVals.RoadPlacement, &entities.PlayerAction{
						Type:    entities.PlayerActionTypeChooseBuildable,
						Message: "Choose what to build on this edge",
						Data: entities.PlayerActionChooseBuildable{
							AllowRoad: true,
							AllowShip: true,
						},
					})
					if respErr == nil {
						var selected string
						if mapstructure.Decode(resp, &selected) == nil {
							selected = strings.ToLower(strings.TrimSpace(selected))
							if selected == "ship" {
								choice = "ship"
							}
						}
					}
				}

				if choice == "ship" {
					return g.BuildShip(p, target.C)
				}
				return g.BuildRoad(p, target.C)
			}

			if canShip {
				return g.BuildShip(p, target.C)
			}
			return g.BuildRoad(p, target.C)
		}

		err = buildChosen(edge)
		if err != nil {
			if g.Mode == entities.Seafarers {
				_ = buildChosen(allowedEdges[0])
			} else {
				C = g.ai.ChooseBestEdgeRoad(p, allowedEdges).C
				_ = g.BuildRoad(p, C)
			}
		}
	}

	// Place settlement for each player
	for i := 0; i < len(g.Players); i++ {
		initVertex(g, g.Players[i])
		initEdge(g, g.Players[i])
	}

	// Reverse
	for i := len(g.Players) - 1; i >= 0; i-- {
		initVertex(g, g.Players[i])
		initEdge(g, g.Players[i])
		g.SendPlayerSecret(g.Players[i])
		g.BroadcastState()
	}

	g.resetTimeLeft()
	g.setCurrentPlayerTimeLeft(g.TimerVals.Dice)
	g.onScenarioTurnStart(g.CurrentPlayer)

	g.InitPhase = false
	g.j.WSetInitPhase(g.InitPhase)
	g.SendPlayerSecret(g.CurrentPlayer)
	g.BroadcastState()
	g.ai.Reset()
}

func (g *Game) getInitEdgeChoices(
	p *entities.Player,
	anchor *entities.Vertex,
) ([]*entities.Edge, map[*entities.Edge]bool, map[*entities.Edge]bool) {
	roadAllowed := make(map[*entities.Edge]bool)
	for _, e := range p.GetBuildLocationsRoad(g.Graph, true) {
		roadAllowed[e] = true
	}

	shipAllowed := make(map[*entities.Edge]bool)
	if g.Mode == entities.Seafarers {
		for _, e := range p.GetBuildLocationsShip(g.Graph) {
			shipAllowed[e] = true
		}
	}

	allowed := make([]*entities.Edge, 0)
	if anchor == nil {
		edgeSet := make(map[*entities.Edge]bool)
		for e := range roadAllowed {
			edgeSet[e] = true
			allowed = append(allowed, e)
		}
		for e := range shipAllowed {
			if !edgeSet[e] {
				edgeSet[e] = true
				allowed = append(allowed, e)
			}
		}
		return allowed, roadAllowed, shipAllowed
	}

	edgeSet := make(map[*entities.Edge]bool)
	for _, e := range g.Graph.GetAdjacentVertexEdges(anchor) {
		if roadAllowed[e] || shipAllowed[e] {
			if !edgeSet[e] {
				edgeSet[e] = true
				allowed = append(allowed, e)
			}
		}
	}

	return allowed, roadAllowed, shipAllowed
}

func (g *Game) simuateInit() {
	if !g.InitPhase {
		log.Println("Init phase already done: ", g.Players[0].CurrentHand.GetCardCount())
		return
	}

	g.Players[0].CurrentHand.UpdateResources(4, 4, 4, 5, 4)
	g.j.WUpdateResources(g.Players[0], 4, 4, 4, 5, 4)
	g.Players[1].CurrentHand.UpdateResources(4, 4, 4, 4, 10)
	g.j.WUpdateResources(g.Players[1], 4, 4, 4, 4, 10)
	g.Players[2].CurrentHand.UpdateResources(4, 4, 4, 4, 10)
	g.j.WUpdateResources(g.Players[2], 4, 4, 4, 4, 10)
	// g.Players[3].CurrentHand.UpdateResources(4, 4, 4, 4, 10)
	// g.j.WUpdateResources(g.Players[3], 4, 4, 4, 4, 10)

	g.Players[0].CurrentHand.GetDevelopmentCardDeck(1).Quantity = 3
	g.Players[0].CurrentHand.GetDevelopmentCardDeck(1).CanUse = true
	g.j.WUpdateDevelopmentCard(g.Players[0], 1, 3, 0, true)
	g.Players[0].CurrentHand.GetDevelopmentCardDeck(2).Quantity = 3
	g.j.WUpdateDevelopmentCard(g.Players[0], 2, 3, 0, false)
	g.Players[0].CurrentHand.GetDevelopmentCardDeck(3).Quantity = 1
	g.j.WUpdateDevelopmentCard(g.Players[0], 3, 1, 0, false)
	g.Players[0].CurrentHand.GetDevelopmentCardDeck(4).Quantity = 1
	g.j.WUpdateDevelopmentCard(g.Players[0], 4, 1, 0, false)
	g.Players[0].CurrentHand.GetDevelopmentCardDeck(5).Quantity = 1
	g.j.WUpdateDevelopmentCard(g.Players[0], 5, 1, 0, false)

	g.InitPhase = true
	g.j.WSetInitPhase(g.InitPhase)
	for i := 8; i >= 1; i-- {
		if i == 8 {
			g.BuildSettlement(g.CurrentPlayer, g.Ports[0].Edge.C.C1)
			g.BuildRoad(g.CurrentPlayer, g.CurrentPlayer.GetBuildLocationsRoad(g.Graph, true)[0].C)
		} else {
			g.BuildSettlement(g.CurrentPlayer, g.CurrentPlayer.GetBuildLocationsSettlement(g.Graph, true, false)[0].C)
			g.BuildRoad(g.CurrentPlayer, g.CurrentPlayer.GetBuildLocationsRoad(g.Graph, true)[0].C)
		}
		g.CurrentPlayer = g.Players[int(g.CurrentPlayer.Order+1)%len(g.Players)]
	}
	g.InitPhase = false

	g.j.WSetInitPhase(g.InitPhase)
	g.CurrentPlayer = g.Players[0]
	g.SendPlayerSecret(g.CurrentPlayer)
	g.BroadcastState()
}
