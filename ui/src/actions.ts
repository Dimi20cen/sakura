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
import { getOverlayConfig } from "./uiConfig";
import { UIEdge, UITile, UIVertex } from "./entities";

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
let setupPlacementSelectionKey: string | undefined;
let setupPreferredBuildable: "road" | "ship" | undefined;
let chooseBuildableAnchor: { x: number; y: number } | undefined;

function getCurrentPlayerColor() {
    return (
        state.lastKnownStates?.[ws.getThisPlayerOrder()]?.Color || "#ff0000"
    );
}

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
    chooseBuildableAnchor = undefined;
    state.highlightPlayers();
    state.showPendingAction();
}

function clearSetupPlacementPreview() {
    if (setupPlacementPreviewWindow && !setupPlacementPreviewWindow.destroyed) {
        setupPlacementPreviewWindow.destroy({ children: true });
    }
    setupPlacementPreviewWindow = undefined;
    setupPlacementSelectionKey = undefined;
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

type SetupPreviewType = buttons.ButtonType | "road_or_ship";

function coordKey(c?: tsg.Coordinate) {
    return `${c?.X ?? ""},${c?.Y ?? ""}`;
}

function edgeKey(edge?: UIEdge | tsg.Edge) {
    const a = coordKey(edge?.C?.C1);
    const b = coordKey(edge?.C?.C2);
    return a <= b ? `${a}|${b}` : `${b}|${a}`;
}

function vertexSelectionKey(v: UIVertex) {
    return `v:${coordKey(v.C)}`;
}

function tileSelectionKey(t: UITile) {
    return `t:${coordKey(t.Center)}`;
}

function edgeSelectionKey(e: UIEdge) {
    return `e:${edgeKey(e)}`;
}

function edgeKeySet(edges?: tsg.Edge[]) {
    const out = new Set<string>();
    if (!edges) return out;
    edges.forEach((e) => out.add(edgeKey(e)));
    return out;
}

function getSetupPreviewType(action: tsg.PlayerAction): SetupPreviewType {
    const message = String(action.Message || "").toLowerCase();
    if (message.includes("road/ship")) return "road_or_ship";
    if (message.includes("settlement")) return buttons.ButtonType.Settlement;
    if (message.includes("city")) return buttons.ButtonType.City;
    if (message.includes("ship")) return buttons.ButtonType.Ship;
    return buttons.ButtonType.Road;
}

function showSetupPlacementPreview(
    action: tsg.PlayerAction,
    x: number,
    y: number,
    onConfirm: (preferred?: "road" | "ship") => void,
    forcedType?: SetupPreviewType,
) {
    clearSetupPlacementPreview();

    const previewType = forcedType || getSetupPreviewType(action);
    const playerColor = getCurrentPlayerColor();
    const setupPreview = getOverlayConfig().setupPreview;
    const w = new PIXI.Container();
    const windowWidth =
        previewType === "road_or_ship"
            ? setupPreview.dualWidth
            : setupPreview.singleWidth;
    const windowSprite = windows.getWindowSprite(windowWidth, setupPreview.height);
    w.addChild(windowSprite);

    if (previewType === "road_or_ship") {
        const roadPreview = buttons.getButtonSprite(
            buttons.ButtonType.Road,
            setupPreview.buttonSize,
            undefined,
            playerColor,
            undefined,
            "rounded-rect",
            0.75,
        );
        roadPreview.x = setupPreview.padding;
        roadPreview.y = setupPreview.padding;
        roadPreview.setEnabled(true);
        roadPreview.onClick(() => {
            clearSetupPlacementPreview();
            onConfirm("road");
        });
        w.addChild(roadPreview);

        const shipPreview = buttons.getButtonSprite(
            buttons.ButtonType.Ship,
            setupPreview.buttonSize,
            undefined,
            playerColor,
        );
        shipPreview.x = setupPreview.secondaryButtonX;
        shipPreview.y = setupPreview.padding;
        shipPreview.setEnabled(true);
        shipPreview.onClick(() => {
            clearSetupPlacementPreview();
            onConfirm("ship");
        });
        w.addChild(shipPreview);
    } else {
        const preview = buttons.getButtonSprite(
            previewType,
            setupPreview.buttonSize,
            undefined,
            previewType === buttons.ButtonType.Settlement ||
                previewType === buttons.ButtonType.City ||
                previewType === buttons.ButtonType.Road ||
                previewType === buttons.ButtonType.Ship
                ? playerColor
                : undefined,
            undefined,
            "rounded-rect",
            previewType === buttons.ButtonType.Road ? 0.75 : 1,
        );
        preview.x = setupPreview.padding;
        preview.y = setupPreview.padding;
        preview.setEnabled(true);
        preview.onClick(() => {
            clearSetupPlacementPreview();
            onConfirm();
        });
        w.addChild(preview);
    }

    w.x = x - windowWidth / 2;
    w.y = y - setupPreview.offsetY;
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
        const selectedKey = tileSelectionKey(tile);
        if (setupPlacementSelectionKey === selectedKey) {
            clearSetupPlacementPreview();
            return;
        }
        const c = board.getDispCoord(tile.Center.X, tile.Center.Y);
        const fc = canvas.getScaled(c);
        showSetupPlacementPreview(action, fc.x, fc.y, respond);
        setupPlacementSelectionKey = selectedKey;
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
        const selectedKey = vertexSelectionKey(v);
        if (setupPlacementSelectionKey === selectedKey) {
            clearSetupPlacementPreview();
            return;
        }
        const c = board.getDispCoord(v.C.X, v.C.Y);
        const fc = canvas.getScaled(c);
        showSetupPlacementPreview(action, fc.x, fc.y, respond);
        setupPlacementSelectionKey = selectedKey;
    });
}

/**
 * Ask the player to choose an edge
 * @param a PlayerActionChooseEdge
 */
export function chooseEdge(a: tsg.PlayerActionChooseEdge, action: tsg.PlayerAction) {
    board.highlightEdges(a.Allowed);
    const roadOptions = edgeKeySet(a.AllowRoad);
    const shipOptions = edgeKeySet(a.AllowShip);
    const hasPerEdgeBuildableOptions =
        Array.isArray(a.AllowRoad) || Array.isArray(a.AllowShip);

    board.setEdgeClickEvent((_, e) => {
        const c1 = board.getDispCoord(e.C.C1.X, e.C.C1.Y);
        const c2 = board.getDispCoord(e.C.C2.X, e.C.C2.Y);
        const fc = canvas.getScaled({
            X: (c1.X + c2.X) / 2,
            Y: (c1.Y + c2.Y) / 2,
        });

        const respond = (preferred?: "road" | "ship") => {
            if (preferred) {
                setupPreferredBuildable = preferred;
            }
            chooseBuildableAnchor = { x: fc.x, y: fc.y };
            board.resetEdgeHighlights();
            state.highlightPlayers();
            state.showPendingAction();
            clearSetupPlacementPreview();
            ws.getCommandHub().sendGameMessage({
                t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
                ar_data: e.C.encode(),
            });
        };
        if (!isSetupPlacementPreviewAction(action)) {
            respond();
            return;
        }
        const selectedKey = edgeSelectionKey(e);
        if (setupPlacementSelectionKey === selectedKey) {
            clearSetupPlacementPreview();
            return;
        }
        let setupTypeByEdge: SetupPreviewType | undefined = undefined;
        if (getSetupPreviewType(action) === "road_or_ship") {
            if (hasPerEdgeBuildableOptions) {
                const key = edgeKey(e);
                const canRoad = roadOptions.has(key);
                const canShip = shipOptions.has(key);
                if (canRoad && canShip) {
                    setupTypeByEdge = "road_or_ship";
                } else if (canShip) {
                    setupTypeByEdge = buttons.ButtonType.Ship;
                } else {
                    setupTypeByEdge = buttons.ButtonType.Road;
                }
            } else {
                setupTypeByEdge = e.IsBeach
                    ? "road_or_ship"
                    : buttons.ButtonType.Road;
            }
        }
        showSetupPlacementPreview(action, fc.x, fc.y, respond, setupTypeByEdge);
        setupPlacementSelectionKey = selectedKey;
    });
}

/**
 * Ask the player to choose a dice roll
 */
export function chooseDice() {
    clearChooseDice();

    const chooseDiceConfig = getOverlayConfig().chooseDice;
    const DICE_WIDTH = chooseDiceConfig.dieWidth;
    const WIDTH =
        chooseDiceConfig.padding * 2 +
        (DICE_WIDTH + chooseDiceConfig.gap) * 6 -
        chooseDiceConfig.gap;
    const HEIGHT =
        chooseDiceConfig.padding * 2 +
        2 * DICE_WIDTH +
        chooseDiceConfig.rowGap;
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
        white.x =
            chooseDiceConfig.padding +
            (DICE_WIDTH + chooseDiceConfig.gap) * (i - 1);
        white.y = chooseDiceConfig.padding;
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
        red.x =
            chooseDiceConfig.padding +
            (DICE_WIDTH + chooseDiceConfig.gap) * (i - 1);
        red.y =
            chooseDiceConfig.padding + DICE_WIDTH + chooseDiceConfig.rowGap;
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
    w.x = chooseDiceConfig.anchorX;
    w.y = canvas.getHeight() - chooseDiceConfig.bottomOffset - HEIGHT;
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

    if (setupPreferredBuildable) {
        const preferred = setupPreferredBuildable;
        setupPreferredBuildable = undefined;
        if (
            (preferred === "road" && allowRoad) ||
            (preferred === "ship" && allowShip)
        ) {
            resetPendingAction();
            ws.getCommandHub().sendGameMessage({
                t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
                ar_data: preferred,
            });
            return;
        }
    }

    const showBoth = allowRoad && allowShip;
    const chooseBuildableConfig = getOverlayConfig().chooseBuildable;
    const WIDTH = showBoth
        ? chooseBuildableConfig.dualWidth
        : chooseBuildableConfig.singleWidth;
    const HEIGHT = chooseBuildableConfig.height;
    const w = windows.getWindowSprite(WIDTH, HEIGHT);
    chooseBuildableWindow = w;
    w.zIndex = 1500;
    if (chooseBuildableAnchor) {
        const margin = chooseBuildableConfig.margin;
        const topY =
            chooseBuildableAnchor.y - HEIGHT - chooseBuildableConfig.topOffset;
        const bottomY =
            chooseBuildableAnchor.y +
            chooseBuildableConfig.bottomPlacementOffset;
        w.x = Math.max(
            margin,
            Math.min(
                chooseBuildableAnchor.x - WIDTH / 2,
                canvas.getWidth() - WIDTH - margin,
            ),
        );
        w.y =
            topY >= margin
                ? topY
                : Math.min(bottomY, canvas.getHeight() - HEIGHT - margin);
    } else {
        w.x = chooseBuildableConfig.defaultX;
        w.y = canvas.getHeight() - chooseBuildableConfig.bottomOffset - HEIGHT;
    }
    chooseBuildableAnchor = undefined;

    if (allowRoad) {
        const road = buttons.getButtonSprite(
            buttons.ButtonType.Road,
            chooseBuildableConfig.buttonSize,
        );
        road.x = showBoth
            ? chooseBuildableConfig.dualLeftX
            : chooseBuildableConfig.singleButtonX;
        road.y = chooseBuildableConfig.buttonY;
        road.setEnabled(true);
        road.onClick(() => {
            resetPendingAction();
            ws.getCommandHub().sendGameMessage({
                t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
                ar_data: "road",
            });
        });
        w.addChild(road);
    }

    if (allowShip) {
        const ship = buttons.getButtonSprite(
            buttons.ButtonType.Ship,
            chooseBuildableConfig.buttonSize,
            undefined,
            getCurrentPlayerColor(),
        );
        ship.x = showBoth
            ? chooseBuildableConfig.dualRightX
            : chooseBuildableConfig.singleButtonX;
        ship.y = chooseBuildableConfig.buttonY;
        ship.setEnabled(true);
        ship.onClick(() => {
            resetPendingAction();
            ws.getCommandHub().sendGameMessage({
                t: socketTypes.MSG_TYPE.ACTION_RESPONSE,
                ar_data: "ship",
            });
        });
        w.addChild(ship);
    }

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
