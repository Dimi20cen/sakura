package server

import (
	"errors"
	"sakura/entities"

	"github.com/mitchellh/mapstructure"
)

func (ws *WsClient) handleBuildOrBuyCommand(msg map[string]interface{}) {
	if ws.handleBaseBuildOrBuyCommand(msg) {
		return
	}
	if ws.handleCnkBuildOrBuyCommand(msg) {
		return
	}
	if ws.handleSeafarersBuildOrBuyCommand(msg) {
		return
	}
}

func (ws *WsClient) handleBaseBuildOrBuyCommand(msg map[string]interface{}) bool {
	switch msg["o"] { // Object type
	case "s": // Settlement
		ws.handleBuildSettlement()
	case "c": // City
		ws.handleBuildCity()
	case "r": // Road
		ws.handleBuildRoad()
	case "dc": // Development card
		ws.handleBuyDevelopmentCard()
	case "udc": // Use Development card
		ws.handleUseDevelopmentCard(msg)
	default:
		return false
	}
	return true
}

func (ws *WsClient) handleCnkBuildOrBuyCommand(msg map[string]interface{}) bool {
	switch msg["o"] { // Object type
	case "k": // Knight
		ws.handleBuildKnight()
	case "ka": // Knight Activate
		ws.handleActivateKnight()
	case "kr": // Knight Robber
		ws.handleKnightRobber()
	case "km": // Knight Move
		ws.handleKnightMove()
	case "i": // City Improvement
		ws.handleCityImprovement(msg)
	case "w": // Wall
		ws.handleBuildWall()
	default:
		return false
	}
	return true
}

func (ws *WsClient) handleSeafarersBuildOrBuyCommand(msg map[string]interface{}) bool {
	switch msg["o"] { // Object type
	case "sh": // Ship
		ws.handleBuildShip()
	case "ms": // Move ship
		ws.handleMoveShip()
	default:
		return false
	}
	return true
}

func (ws *WsClient) handleBuildSettlement() {
	vertices := ws.Player.GetBuildLocationsSettlement(ws.Hub.Game.Graph, false, false)
	if len(vertices) == 0 || (!ws.Hub.Game.IsCreativeMode() && ws.Player.CanBuild(entities.BTSettlement) != nil) {
		ws.Hub.Game.SendError(errors.New("nowhere to build or cannot build"), ws.Player)
		return
	}

	loc, ok := ws.promptChooseVertex("Choose location for settlement", vertices)
	if !ok {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.BuildSettlement(ws.Player, loc), ws.Player)
}

func (ws *WsClient) handleBuildCity() {
	vertices := ws.Player.GetBuildLocationsCity(ws.Hub.Game.Graph)
	if len(vertices) == 0 || (!ws.Hub.Game.IsCreativeMode() && ws.Player.CanBuild(entities.BTCity) != nil) {
		ws.Hub.Game.SendError(errors.New("nowhere to build or cannot build"), ws.Player)
		return
	}

	loc, ok := ws.promptChooseVertex("Choose location for city", vertices)
	if !ok {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.BuildCity(ws.Player, loc), ws.Player)
}

func (ws *WsClient) handleBuildRoad() {
	edges := ws.Player.GetBuildLocationsRoad(ws.Hub.Game.Graph, false)
	if len(edges) == 0 || (!ws.Hub.Game.IsCreativeMode() && ws.Player.CanBuild(entities.BTRoad) != nil) {
		ws.Hub.Game.SendError(errors.New("nowhere to build or cannot build"), ws.Player)
		return
	}

	loc, ok := ws.promptChooseEdge("Choose location for road", edges)
	if !ok {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.BuildRoad(ws.Player, loc), ws.Player)
}

func (ws *WsClient) handleBuyDevelopmentCard() {
	if ws.Hub.Game.Mode == entities.CitiesAndKnights {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.BuyDevelopmentCard(ws.Player), ws.Player)
}

func (ws *WsClient) handleBuildKnight() {
	if ws.Hub.Game.Mode != entities.CitiesAndKnights {
		return
	}

	vertices := ws.Player.GetBuildLocationsKnight(ws.Hub.Game.Graph, true)
	if len(vertices) == 0 ||
		(!ws.Hub.Game.IsCreativeMode() &&
			ws.Player.CanBuild(entities.BTKnight1) != nil &&
			ws.Player.CanBuild(entities.BTKnight2) != nil &&
			ws.Player.CanBuild(entities.BTKnight3) != nil) {
		ws.Hub.Game.SendError(errors.New("nowhere to build or cannot build"), ws.Player)
		return
	}

	loc, ok := ws.promptChooseVertex("Choose location for warrior", vertices)
	if !ok {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.BuildKnight(ws.Player, loc), ws.Player)
}

func (ws *WsClient) handleActivateKnight() {
	if ws.Hub.Game.Mode != entities.CitiesAndKnights {
		return
	}

	vertices := ws.Player.GetActivateLocationsKnight(ws.Hub.Game.Graph)
	if len(vertices) == 0 {
		ws.Hub.Game.SendError(errors.New("no knight to activate"), ws.Player)
		return
	}

	loc, ok := ws.promptChooseVertex("Choose warrior to activate", vertices)
	if !ok {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.ActivateKnight(ws.Player, loc), ws.Player)
}

func (ws *WsClient) handleKnightRobber() {
	if ws.Hub.Game.Mode != entities.CitiesAndKnights {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.KnightChaseRobber(ws.Player, false), ws.Player)
}

func (ws *WsClient) handleKnightMove() {
	if ws.Hub.Game.Mode != entities.CitiesAndKnights {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.KnightMove(ws.Player, false), ws.Player)
}

func (ws *WsClient) handleCityImprovement(msg map[string]interface{}) {
	if ws.Hub.Game.Mode != entities.CitiesAndKnights {
		return
	}

	var ct entities.CardType
	if err := mapstructure.Decode(msg["ct"], &ct); err != nil {
		ws.Hub.Game.SendError(err, ws.Player)
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.BuildCityImprovement(ws.Player, ct), ws.Player)
}

func (ws *WsClient) handleBuildWall() {
	if ws.Hub.Game.Mode != entities.CitiesAndKnights {
		return
	}

	vertices := ws.Player.GetBuildLocationsWall(ws.Hub.Game.Graph)
	if len(vertices) == 0 || (!ws.Hub.Game.IsCreativeMode() && ws.Player.CanBuild(entities.BTWall) != nil) {
		ws.Hub.Game.SendError(errors.New("nowhere to build or cannot build"), ws.Player)
		return
	}

	loc, ok := ws.promptChooseVertex("Choose location for fence", vertices)
	if !ok {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.BuildWall(ws.Player, loc), ws.Player)
}

func (ws *WsClient) handleBuildShip() {
	if ws.Hub.Game.Mode != entities.Seafarers {
		return
	}

	edges := ws.Player.GetBuildLocationsShip(ws.Hub.Game.Graph)
	if len(edges) == 0 || (!ws.Hub.Game.IsCreativeMode() && ws.Player.CanBuild(entities.BTShip) != nil) {
		ws.Hub.Game.SendError(errors.New("nowhere to build or cannot build"), ws.Player)
		return
	}

	loc, ok := ws.promptChooseEdge("Choose location for ship", edges)
	if !ok {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.BuildShip(ws.Player, loc), ws.Player)
}

func (ws *WsClient) handleMoveShip() {
	if ws.Hub.Game.Mode != entities.Seafarers {
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.MoveShipInteractive(ws.Player), ws.Player)
}

func (ws *WsClient) handleUseDevelopmentCard(msg map[string]interface{}) {
	var dcType entities.DevelopmentCardType
	if err := mapstructure.Decode(msg["dct"], &dcType); err != nil {
		ws.Hub.Game.SendError(err, ws.Player)
		return
	}
	ws.Hub.Game.SendError(ws.Hub.Game.UseDevelopmentCard(ws.Player, dcType), ws.Player)
}

func (ws *WsClient) promptChooseVertex(
	message string,
	vertices []*entities.Vertex,
) (entities.Coordinate, bool) {
	res, err := ws.Hub.Game.BlockForAction(ws.Player, 0, &entities.PlayerAction{
		Type:      entities.PlayerActionTypeChooseVertex,
		Message:   message,
		CanCancel: true,
		Data:      entities.PlayerActionChooseVertex{Allowed: vertices},
	})
	if res == nil || err != nil {
		return entities.Coordinate{}, false
	}

	var loc entities.Coordinate
	if err := mapstructure.Decode(res, &loc); err != nil {
		ws.Hub.Game.SendError(err, ws.Player)
		return entities.Coordinate{}, false
	}
	return loc, true
}

func (ws *WsClient) promptChooseEdge(
	message string,
	edges []*entities.Edge,
) (entities.EdgeCoordinate, bool) {
	res, err := ws.Hub.Game.BlockForAction(ws.Player, 0, &entities.PlayerAction{
		Type:      entities.PlayerActionTypeChooseEdge,
		Message:   message,
		CanCancel: true,
		Data:      entities.PlayerActionChooseEdge{Allowed: edges},
	})
	if res == nil || err != nil {
		return entities.EdgeCoordinate{}, false
	}

	var loc entities.EdgeCoordinate
	if err := mapstructure.Decode(res, &loc); err != nil {
		ws.Hub.Game.SendError(err, ws.Player)
		return entities.EdgeCoordinate{}, false
	}
	return loc, true
}
