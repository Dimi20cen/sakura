import * as PIXI from "pixi.js";
import * as assets from "./assets";
import * as buttons from "./buttons";
import * as canvas from "./canvas";
import * as windows from "./windows";
import * as tsg from "../tsg";
import { CardType } from "./entities";
import { computeResourceBankPosition, RIGHT_STACK_PANEL_WIDTH } from "./hudLayout";

const WIDTH = RIGHT_STACK_PANEL_WIDTH;
const HEIGHT = 66;
const CARD_WIDTH = 34;
const CARD_HEIGHT = 48;
const COUNT_WIDTH = 20;
const COUNT_HEIGHT = 19;
const COUNT_FONT_SIZE = 13;

const RESOURCE_ORDER = [
    CardType.Wood,
    CardType.Brick,
    CardType.Wool,
    CardType.Wheat,
    CardType.Ore,
] as const;

type CardCountMap = Record<number, number>;

let container: PIXI.Container | null = null;
let chipText: Record<number, PIXI.Text> = {};
let devText: PIXI.Text | null = null;

let counts: CardCountMap = {
    [CardType.Wood]: 19,
    [CardType.Brick]: 19,
    [CardType.Wool]: 19,
    [CardType.Wheat]: 19,
    [CardType.Ore]: 19,
};

let devRemaining = 25;

function clampCount(v: number) {
    return Math.max(0, Math.min(99, v));
}

function refreshText() {
    for (const ct of RESOURCE_ORDER) {
        if (chipText[ct]) {
            chipText[ct].text = `${counts[ct] || 0}`;
        }
    }
    if (devText) {
        devText.text = `${devRemaining}`;
    }
    canvas.app?.markDirty();
}

function ensureUI() {
    if (!canvas.app) {
        return;
    }

    if (container && !container.destroyed) {
        return;
    }

    chipText = {};
    devText = null;

    container = new PIXI.Container();
    container.zIndex = 1400;

    container.addChild(windows.getWindowSprite(WIDTH, HEIGHT));

    let x = 26;
    for (const ct of RESOURCE_ORDER) {
        const chip = new PIXI.Container();

        const card = new PIXI.Sprite();
        assets.assignTexture(card, assets.cards[ct]);
        card.width = CARD_WIDTH;
        card.height = CARD_HEIGHT;
        chip.addChild(card);

        const count = buttons.getCountSprite(
            COUNT_WIDTH,
            COUNT_HEIGHT,
            COUNT_FONT_SIZE,
        );
        count.sprite.anchor.x = 1;
        count.sprite.x = CARD_WIDTH;
        count.sprite.y = 1;
        count.text.text = `${counts[ct] || 0}`;
        count.sprite.zIndex = 1;
        chip.sortableChildren = true;
        chip.addChild(count.sprite);
        chipText[ct] = count.text;

        chip.x = x;
        chip.y = 8;
        container.addChild(chip);

        x += 40;
    }

    const devChip = new PIXI.Container();
    const devCard = new PIXI.Sprite();
    assets.assignTexture(devCard, assets.cards[200]);
    devCard.width = CARD_WIDTH;
    devCard.height = CARD_HEIGHT;
    devChip.addChild(devCard);

    const devCount = buttons.getCountSprite(
        COUNT_WIDTH,
        COUNT_HEIGHT,
        COUNT_FONT_SIZE,
    );
    devCount.sprite.anchor.x = 1;
    devCount.sprite.x = CARD_WIDTH;
    devCount.sprite.y = 1;
    devCount.text.text = `${devRemaining}`;
    devCount.sprite.zIndex = 1;
    devChip.sortableChildren = true;
    devChip.addChild(devCount.sprite);
    devText = devCount.text;

    devChip.x = x;
    devChip.y = 8;
    container.addChild(devChip);

    canvas.app.stage.addChild(container);
    relayout();
    refreshText();
}

export function initialize() {
    ensureUI();
}

export function relayout() {
    if (!container || container.destroyed) {
        return;
    }

    const pos = computeResourceBankPosition({
        canvasWidth: canvas.getWidth(),
    });

    container.x = pos.x;
    container.y = pos.y;
    canvas.app.markDirty();
}

export function setMode(mode: number) {
    counts = {
        [CardType.Wood]: 19,
        [CardType.Brick]: 19,
        [CardType.Wool]: 19,
        [CardType.Wheat]: 19,
        [CardType.Ore]: 19,
    };

    // Base has 25 development cards. Cities and Knights has 3 progress stacks (17/18/18).
    devRemaining = mode === 2 ? 53 : 25;
    refreshText();
}

export function syncFromGameState(gs: tsg.GameState) {
    counts[CardType.Wood] = clampCount(Number(gs.BankWood || 0));
    counts[CardType.Brick] = clampCount(Number(gs.BankBrick || 0));
    counts[CardType.Wool] = clampCount(Number(gs.BankWool || 0));
    counts[CardType.Wheat] = clampCount(Number(gs.BankWheat || 0));
    counts[CardType.Ore] = clampCount(Number(gs.BankOre || 0));
    devRemaining = clampCount(Number(gs.BankDevRemaining || 0));
    refreshText();
}

export function applyCardMove(move: tsg.CardMoveInfo) {
    const ct = Number(move.CardType);
    if (ct < CardType.Wood || ct > CardType.Ore) {
        return;
    }

    const q = Number(move.Quantity || 0);
    if (!q) {
        return;
    }

    // Bank gave cards.
    if (move.GiverOrder === -1) {
        counts[ct] = clampCount((counts[ct] || 0) - q);
    }

    // Bank received cards.
    if (move.GainerOrder === -1) {
        counts[ct] = clampCount((counts[ct] || 0) + q);
    }

    refreshText();
}
