import * as PIXI from "pixi.js";
import * as assets from "./assets";
import * as board from "./board";
import * as state from "./state";
import * as actions from "./actions";
import * as buttons from "./buttons";
import * as canvas from "./canvas";
import { buildHUDLayout } from "./hud/layoutEngine";
import type { HUDFrame } from "./hud/types";
import { computeDicePosition } from "./hudLayout";
import { sound } from "@pixi/sound";
import { DieRollState } from "../tsg";
import { getCommandHub } from "./ws";
import { getBottomDockConfig } from "./uiConfig";

let redDiceSprite: PIXI.Sprite;
let redDiceInner: PIXI.Sprite;
let whiteDiceSprite: PIXI.Sprite;
let whiteDiceInner: PIXI.Sprite;
let eventDiceSprite: PIXI.Sprite;
let eventDiceInner: PIXI.Sprite;
let diceContainer: PIXI.Container;
let revealTimer: number | null = null;

enum DiceVisualState {
    Idle = "idle",
    AwaitingRoll = "awaiting-roll",
    Rolling = "rolling",
    Revealed = "revealed",
}

let visualState: DiceVisualState = DiceVisualState.Idle;
let flashTickerActive = false;
const DICE_SIZE = 64;
const DICE_GAP = 4;
const DOUBLE_DICE_WIDTH = DICE_SIZE * 2 + DICE_GAP;

export function getDiceLayoutMetrics() {
    if (!whiteDiceInner || whiteDiceInner.destroyed) {
        return {};
    }

    const diceWidth =
        (whiteDiceSprite?.x || DICE_SIZE + DICE_GAP) +
        (whiteDiceInner.width || DICE_SIZE);
    const eventHeight =
        eventDiceInner && !eventDiceInner.destroyed
            ? (eventDiceInner.height || 42) + 10
            : 0;
    const diceHeight = (whiteDiceInner.height || 64) + eventHeight;

    return {
        diceWidth,
        diceHeight,
    };
}

function updateDicePosition() {
    if (!diceContainer || diceContainer.destroyed) {
        return;
    }

    const {
        diceWidth = DOUBLE_DICE_WIDTH,
        diceHeight = 64,
    } = getDiceLayoutMetrics();
    const actionBarTop =
        buttons.container && !buttons.container.destroyed
            ? buttons.container.y
            : canvas.getHeight() - 120;

    const pos = computeDicePosition({
        canvasWidth: canvas.getWidth(),
        canvasHeight: canvas.getHeight(),
        diceWidth,
        diceHeight,
        actionBarTop,
        playerPanel: state.getPlayerPanelBounds(),
    });

    // Container uses pivot, so convert desired top-left coords to pivot coords.
    diceContainer.x = pos.x + diceContainer.pivot.x;
    diceContainer.y = pos.y + diceContainer.pivot.y;
}

function clearRevealTimer() {
    if (revealTimer === null) {
        return;
    }
    window.clearTimeout(revealTimer);
    revealTimer = null;
}

function stopFlashTicker() {
    if (!flashTickerActive) {
        return;
    }
    flashTickerActive = false;
    canvas.app.slowTicker.remove(diceFlashFun);
}

function startFlashTicker() {
    if (flashTickerActive) {
        return;
    }
    flashTickerActive = true;
    canvas.app.slowTicker.add(diceFlashFun);
}

function applyVisualState() {
    if (!redDiceInner || !whiteDiceInner) {
        return;
    }

    const interactive = visualState === DiceVisualState.AwaitingRoll;
    redDiceInner.interactive = interactive;
    whiteDiceInner.interactive = interactive;
    redDiceInner.cursor = interactive ? "pointer" : "default";
    whiteDiceInner.cursor = interactive ? "pointer" : "default";

    if (visualState === DiceVisualState.AwaitingRoll) {
        startFlashTicker();
        return;
    }

    stopFlashTicker();
    redDiceInner.tint = 0xffffff;
    whiteDiceInner.tint = 0xffffff;
}

function setVisualState(next: DiceVisualState) {
    clearRevealTimer();
    visualState = next;
    applyVisualState();
    canvas.app.markDirty();
}

export function relayout() {
    const {
        diceWidth = DOUBLE_DICE_WIDTH,
        diceHeight = 64,
    } = getDiceLayoutMetrics();
    setFrame(
        buildHUDLayout({
            canvasWidth: canvas.getWidth(),
            canvasHeight: canvas.getHeight(),
            diceWidth,
            diceHeight,
        }).widgets.dice!,
    );
    canvas.app.markDirty();
}

export function setFrame(frame: HUDFrame) {
    if (!diceContainer || diceContainer.destroyed) {
        return;
    }
    diceContainer.x = frame.x + diceContainer.pivot.x;
    diceContainer.y = frame.y + diceContainer.pivot.y;
}

/**
 * Get a border for the dice
 * @param s Length of side of square
 * @returns PIXI.Graphics
 */
function getBorder(s: number) {
    const panel = getBottomDockConfig().panel;
    const border = new PIXI.Graphics();
    border.lineStyle({ color: panel.border, width: 2 });
    border.beginFill(0, 0);
    border.drawRoundedRect(0, 0, s, s, 10 * (s / 64));
    border.endFill();
    return border;
}

/**
 * Stop flashing the dice and send the roll command
 */
function rollDice() {
    if (visualState !== DiceVisualState.AwaitingRoll) {
        return;
    }
    setVisualState(DiceVisualState.Rolling);
    getCommandHub().rollDice();
}

/**
 * Render the dice sprites.
 * @param redRoll Red die roll
 * @param whiteRoll White die roll
 * @param eventRoll Event die roll
 */
export async function render(
    redRoll: number,
    whiteRoll: number,
    eventRoll: number,
) {
    const SIZE = DICE_SIZE;

    if (!diceContainer || diceContainer.destroyed) {
        const SIZE = DICE_SIZE;
        diceContainer = new PIXI.Container();
        diceContainer.x = canvas.getWidth() - 230;
        diceContainer.y = canvas.getHeight() - 180;
        diceContainer.zIndex = 1100;
        canvas.app.stage.addChild(diceContainer);

        redDiceSprite = new PIXI.Sprite();
        redDiceInner = new PIXI.Sprite();
        redDiceInner.width = SIZE;
        redDiceInner.height = SIZE;
        redDiceInner.interactive = true;
        redDiceInner.cursor = "pointer";
        redDiceInner.on("pointerdown", rollDice);
        diceContainer.addChild(redDiceSprite);
        redDiceSprite.addChild(redDiceInner);
        redDiceSprite.addChild(getBorder(SIZE));

        whiteDiceSprite = new PIXI.Sprite();
        whiteDiceInner = new PIXI.Sprite();
        whiteDiceInner.width = SIZE;
        whiteDiceInner.height = SIZE;
        whiteDiceSprite.x = SIZE + DICE_GAP;
        whiteDiceInner.interactive = true;
        whiteDiceInner.cursor = "pointer";
        whiteDiceInner.on("pointerdown", rollDice);
        diceContainer.addChild(whiteDiceSprite);
        whiteDiceSprite.addChild(whiteDiceInner);
        whiteDiceSprite.addChild(getBorder(SIZE));

        diceContainer.pivot.x = DOUBLE_DICE_WIDTH / 2;
        diceContainer.pivot.y = 32;
    }

    if (eventRoll && (!eventDiceInner || eventDiceInner.destroyed)) {
        eventDiceSprite = new PIXI.Sprite();
        eventDiceInner = new PIXI.Sprite();
        eventDiceInner.width = (SIZE * 2) / 3;
        eventDiceInner.height = (SIZE * 2) / 3;
        eventDiceSprite.x = 108;
        eventDiceSprite.y = -40;
        diceContainer.addChild(eventDiceSprite);
        eventDiceSprite.addChild(eventDiceInner);
        eventDiceSprite.addChild(getBorder((SIZE * 2) / 3));
    }

    updateDicePosition();

    assets.assignTexture(redDiceInner, assets.diceRed[redRoll]);
    assets.assignTexture(whiteDiceInner, assets.diceWhite[whiteRoll]);

    if (eventRoll) {
        eventRoll = Math.min(4, eventRoll);
        assets.assignTexture(eventDiceInner, assets.diceEvent[eventRoll]);
    }

    applyVisualState();
    canvas.app.markDirty();
}

const diceFlashFun = (delta: number) => {
    if (
        !diceContainer ||
        diceContainer.destroyed ||
        !redDiceInner ||
        !whiteDiceInner
    ) {
        return;
    }

    (<number>redDiceInner.tint) -= 0x111111;
    if (<number>redDiceInner.tint < 0x666666) {
        redDiceInner.tint = 0xffffff;
    }
    whiteDiceInner.tint = redDiceInner.tint;

    diceContainer.render(canvas.app.renderer as PIXI.Renderer);
};

/**
 * Set the flashing state of the dice.
 * @param flash True to flash the dice, false to stop flashing
 */
export function setFlashing(flash: boolean) {
    if (flash) {
        setVisualState(DiceVisualState.AwaitingRoll);
    } else {
        if (visualState === DiceVisualState.AwaitingRoll) {
            setVisualState(DiceVisualState.Idle);
        }
    }
}

/**
 * Render the dice roll state and play sound.
 * @param redRoll Red die roll
 * @param whiteRoll White die roll
 * @param eventRoll Event die roll
 */
export async function rolled(
    redRoll: number,
    whiteRoll: number,
    eventRoll: number,
) {
    render(redRoll, whiteRoll, eventRoll);
    setVisualState(DiceVisualState.Revealed);
    revealTimer = window.setTimeout(() => {
        revealTimer = null;
        if (visualState === DiceVisualState.Revealed) {
            setVisualState(DiceVisualState.Idle);
        }
    }, 900);
    sound.play("soundDice");
}

/**
 * Handle the dice roll state message.
 * @param diceResp Dice roll response
 * @returns {void}
 */
export function handleMessage(diceResp: DieRollState) {
    if (diceResp.IsInit) {
        render(diceResp.RedRoll, diceResp.WhiteRoll, diceResp.EventRoll);
        setVisualState(DiceVisualState.Idle);
        return;
    }

    state.addPendingCardMoves(diceResp.GainInfo);
    rolled(diceResp.RedRoll, diceResp.WhiteRoll, diceResp.EventRoll);
    board.flashTile(diceResp.RedRoll + diceResp.WhiteRoll);
    actions.clearChooseDice();

    if (buttons.buttons.improveBox) {
        buttons.buttons.improveBox.callback = undefined;
    }
}
