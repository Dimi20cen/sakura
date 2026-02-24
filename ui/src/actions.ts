import * as trade from "./trade";
import * as ws from "./ws";
import * as assets from "./assets";
import * as socketTypes from "./sock";
import * as board from "./board";
import * as state from "./state";
import * as tsg from "../tsg";
import * as canvas from "./canvas";
import * as windows from "./windows";
import * as PIXI from "pixi.js";
import * as buttons from "./buttons";

export enum PlayerActionType {
    SelectCards = "sc",
    SelectCardsDone = "sc*",
    ChooseTile = "ct",
    ChoosePlayer = "cp",
    ChooseVertex = "cv",
    ChooseEdge = "ce",
    ChooseBuildable = "cb",
    ChooseDice = "cd",
    ChooseImprovement = "ci",
}

let chooseDiceWindow: PIXI.Container | undefined;
let chooseBuildableWindow: PIXI.Container | undefined;
let setupPlacementPreviewWindow: PIXI.Container | undefined;

/**
 * Handle a player action
 * @param action Action to perform
 */
export function handle(action: tsg.PlayerAction) {
    resetPendingAction();
    state.showPendingAction(action);

    switch (action.Type) {
        case PlayerActionType.SelectCards:
            action.Data = new tsg.PlayerActionSelectCards(action.Data);
            trade.handleSelectCardsAction(action);
            break;

        case PlayerActionType.SelectCardsDone:
            trade.closeTradeOffer();
            break;

        case PlayerActionType.ChooseTile:
            chooseTile(new tsg.PlayerActionChooseTile(action.Data), action);
            break;

        case PlayerActionType.ChoosePlayer:
            choosePlayer(new tsg.PlayerActionChoosePlayer(action.Data));
            break;

        case PlayerActionType.ChooseVertex:
            chooseVertex(new tsg.PlayerActionChooseVertex(action.Data), action);
            break;

        case PlayerActionType.ChooseEdge:
            chooseEdge(new tsg.PlayerActionChooseEdge(action.Data), action);
            break;

        case PlayerActionType.ChooseBuildable:
            chooseBuildable(action.Data || {});
            break;

        case PlayerActionType.ChooseDice:
            chooseDice();
            break;

        case PlayerActionType.ChooseImprovement:
            chooseImprovement();
            break;

        default:
            console.error(action);
    }
}

/**
 * Send a nil response to the server
 */
export function cancelPendingAction() {
    ws.getCommandHub().sendGameMessage({
        t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
        ar_data: null,
    });
    resetPendingAction();
}

/**
 * Clear the pending action state
 */
export function resetPendingAction() {
    board.resetEdgeHighlights();
    board.resetVertexHighlights();
    board.resetTileHighlights();
    clearChooseBuildable();
    clearSetupPlacementPreview();
    state.highlightPlayers();
    state.showPendingAction();
}

function clearSetupPlacementPreview() {
    if (setupPlacementPreviewWindow && !setupPlacementPreviewWindow.destroyed) {
        setupPlacementPreviewWindow.destroy({ children: true });
    }
    setupPlacementPreviewWindow = undefined;
    canvas.app.markDirty();
}

function isSetupPlacementPreviewAction(action: tsg.PlayerAction) {
    const message = String(action.Message || "").toLowerCase();
    return (
        !action.CanCancel &&
        (action.Type === PlayerActionType.ChooseVertex ||
            action.Type === PlayerActionType.ChooseEdge) &&
        message.includes("location for")
    );
}

function getSetupPreviewType(action: tsg.PlayerAction): buttons.ButtonType {
    const message = String(action.Message || "").toLowerCase();
    if (message.includes("settlement")) return buttons.ButtonType.Settlement;
    if (message.includes("city")) return buttons.ButtonType.City;
    if (message.includes("ship")) return buttons.ButtonType.Ship;
    return buttons.ButtonType.Road;
}

function showSetupPlacementPreview(
    action: tsg.PlayerAction,
    x: number,
    y: number,
    onConfirm: () => void,
) {
    clearSetupPlacementPreview();

    const w = new PIXI.Container();
    const windowSprite = windows.getWindowSprite(62, 62);
    w.addChild(windowSprite);

    const preview = buttons.getButtonSprite(getSetupPreviewType(action), 52);
    preview.x = 5;
    preview.y = 5;
    preview.setEnabled(true);
    preview.onClick(() => {
        clearSetupPlacementPreview();
        onConfirm();
    });
    w.addChild(preview);

    w.x = x - 31;
    w.y = y - 78;
    w.zIndex = 1200;
    setupPlacementPreviewWindow = w;
    board.container.addChild(w);
    canvas.app.markDirty();
}

/**
 * Respond with the selected cards
 * @param cards Array of card quantities
 */
export function respondSelectCards(cards: number[]) {
    ws.getCommandHub().sendGameMessage({
        t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
        ar_data: cards,
    });
}

/**
 * Ask the player to choose a tile
 * @param a PlayerActionChooseTile
 */
export function chooseTile(a: tsg.PlayerActionChooseTile, action: tsg.PlayerAction) {
    board.highlightTiles(a.Allowed);
    board.setTileClickEvent((_, tile) => {
        const respond = () => {
            resetPendingAction();
            ws.getCommandHub().sendGameMessage({
                t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
                ar_data: tile.Center.encode(),
            });
        };
        if (!isSetupPlacementPreviewAction(action)) {
            respond();
            return;
        }
        const c = board.getDispCoord(tile.Center.X, tile.Center.Y);
        const fc = canvas.getScaled(c);
        showSetupPlacementPreview(action, fc.x, fc.y, respond);
    });
}

/**
 * Ask the player to choose a player
 * @param a PlayerActionChoosePlayer
 */
export function choosePlayer(a: tsg.PlayerActionChoosePlayer) {
    state.highlightPlayers(a.Choices);
    state.setPlayerClickEvent((_, o) => {
        resetPendingAction();
        ws.getCommandHub().sendGameMessage({
            t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
            ar_data: o,
        });
    });
}

/**
 * Ask the player to choose a vertex
 * @param a PlayerActionChooseVertex
 */
export function chooseVertex(a: tsg.PlayerActionChooseVertex, action: tsg.PlayerAction) {
    board.highlightVertices(a.Allowed);

    board.setVertexClickEvent((_, v) => {
        const respond = () => {
            resetPendingAction();
            ws.getCommandHub().sendGameMessage({
                t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
                ar_data: v.C.encode(),
            });
        };
        if (!isSetupPlacementPreviewAction(action)) {
            respond();
            return;
        }
        const c = board.getDispCoord(v.C.X, v.C.Y);
        const fc = canvas.getScaled(c);
        showSetupPlacementPreview(action, fc.x, fc.y, respond);
    });
}

/**
 * Ask the player to choose an edge
 * @param a PlayerActionChooseEdge
 */
export function chooseEdge(a: tsg.PlayerActionChooseEdge, action: tsg.PlayerAction) {
    board.highlightEdges(a.Allowed);

    board.setEdgeClickEvent((_, e) => {
        const respond = () => {
            resetPendingAction();
            ws.getCommandHub().sendGameMessage({
                t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
                ar_data: e.C.encode(),
            });
        };
        if (!isSetupPlacementPreviewAction(action)) {
            respond();
            return;
        }
        const c1 = board.getDispCoord(e.C.C1.X, e.C.C1.Y);
        const c2 = board.getDispCoord(e.C.C2.X, e.C.C2.Y);
        const fc = canvas.getScaled({
            X: (c1.X + c2.X) / 2,
            Y: (c1.Y + c2.Y) / 2,
        });
        showSetupPlacementPreview(action, fc.x, fc.y, respond);
    });
}

/**
 * Ask the player to choose a dice roll
 */
export function chooseDice() {
    clearChooseDice();

    const DICE_WIDTH = 40;
    const WIDTH = 20 + (DICE_WIDTH + 5) * 6;
    const HEIGHT = 2 * DICE_WIDTH + 25;
    const w = windows.getWindowSprite(WIDTH, HEIGHT);
    chooseDiceWindow = w;

    let whiteSel = 0;
    let redSel = 0;

    const check = () => {
        if (whiteSel && redSel) {
            ws.getCommandHub().sendGameMessage({
                t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
                ar_data: [redSel, whiteSel],
            });
            resetPendingAction();
            clearChooseDice();
            canvas.app.markDirty();
        }
    };

    const whiteSprites: PIXI.Sprite[] = [];
    const redSprites: PIXI.Sprite[] = [];

    [1, 2, 3, 4, 5, 6].forEach((i) => {
        const white = new PIXI.Sprite();
        assets.assignTexture(white, assets.diceWhite[i]);
        white.scale.set(DICE_WIDTH / white.width);
        white.x = 10 + (DICE_WIDTH + 5) * (i - 1);
        white.y = 10;
        white.interactive = true;
        white.cursor = "pointer";
        white.tint = 0x888888;
        white.on("pointerdown", (event) => {
            event.stopPropagation();
            whiteSprites.forEach((s) => (s.tint = 0x888888));
            white.tint = 0xffffff;
            whiteSel = i;
            check();
            canvas.app.markDirty();
        });
        w.addChild(white);
        whiteSprites.push(white);

        const red = new PIXI.Sprite();
        assets.assignTexture(red, assets.diceRed[i]);
        red.scale.set(DICE_WIDTH / red.width);
        red.x = 10 + (DICE_WIDTH + 5) * (i - 1);
        red.y = 55;
        red.interactive = true;
        red.cursor = "pointer";
        red.tint = 0x888888;
        red.on("pointerdown", (event) => {
            event.stopPropagation();
            redSprites.forEach((s) => (s.tint = 0x888888));
            red.tint = 0xffffff;
            redSel = i;
            check();
            canvas.app.markDirty();
        });
        w.addChild(red);
        redSprites.push(red);
    });

    w.zIndex = 1500;
    w.x = 20;
    w.y = canvas.getHeight() - 140 - HEIGHT;
    canvas.app.stage.addChild(w);
}

/**
 * Clear the choose dice window
 */
export function clearChooseDice() {
    if (chooseDiceWindow && !chooseDiceWindow.destroyed) {
        chooseDiceWindow.destroy();
    }
    canvas.app.markDirty();
}

function chooseBuildable(data: { r?: boolean; s?: boolean }) {
    clearChooseBuildable();

    const allowRoad = Boolean(data?.r);
    const allowShip = Boolean(data?.s);

    const WIDTH = 140;
    const HEIGHT = 62;
    const w = windows.getWindowSprite(WIDTH, HEIGHT);
    chooseBuildableWindow = w;
    w.zIndex = 1500;
    w.x = 20;
    w.y = canvas.getHeight() - 140 - HEIGHT;

    const road = buttons.getButtonSprite(buttons.ButtonType.Road, 52);
    road.x = 10;
    road.y = 6;
    road.setEnabled(allowRoad);
    road.onClick(() => {
        if (!allowRoad) return;
        resetPendingAction();
        ws.getCommandHub().sendGameMessage({
            t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
            ar_data: "road",
        });
    });
    w.addChild(road);

    const ship = buttons.getButtonSprite(buttons.ButtonType.Ship, 52);
    ship.x = 74;
    ship.y = 6;
    ship.setEnabled(allowShip);
    ship.onClick(() => {
        if (!allowShip) return;
        resetPendingAction();
        ws.getCommandHub().sendGameMessage({
            t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
            ar_data: "ship",
        });
    });
    w.addChild(ship);

    canvas.app.stage.addChild(w);
    canvas.app.markDirty();
}

function clearChooseBuildable() {
    if (chooseBuildableWindow && !chooseBuildableWindow.destroyed) {
        chooseBuildableWindow.destroy();
    }
    chooseBuildableWindow = undefined;
}

/**
 * Ask the player to choose an improvement type
 */
export function chooseImprovement() {
    buttons.buttons.improveBox!.container.visible = true;
    buttons.buttons.knightBox!.container.visible = false;
    buttons.buttons.improveBox!.callback = (c: number) => {
        resetPendingAction();
        ws.getCommandHub().sendGameMessage({
            t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
            ar_data: c,
        });
        buttons.buttons.improveBox!.callback = undefined;
    };
}
