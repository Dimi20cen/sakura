import * as PIXI from "pixi.js";
import * as assets from "./assets";
import * as canvas from "./canvas";
import * as state from "./state";
import * as tsg from "../tsg";
import { BuildableType, CardType, DevelopmentCardType } from "./entities";
import { buildHUDLayout } from "./hud/layoutEngine";
import type { HUDFrame } from "./hud/types";
import { getBottomDockConfig, getGameLogConfig } from "./uiConfig";
import {
    createDockPanel,
    createPanelBodyTextStyle,
} from "./uiDock";

export type LogEntryType =
    | "notice"
    | "resource_gain"
    | "resource_loss"
    | "bank_trade"
    | "player_trade"
    | "dice_roll"
    | "build_action"
    | "dev_card_use"
    | "dev_card_draw";

export type LogLeadingIcon =
    | "notice"
    | "player"
    | "bank"
    | "dice"
    | "development_card";

export type LogEntryEmphasis = "normal" | "muted" | "highlight";

export type LogEntry = {
    id: number;
    type: LogEntryType;
    actorName?: string;
    actorColor?: string;
    actorOrder?: number;
    verb?: string;
    target?: string;
    counterpartyOrder?: number;
    text?: string;
    givenIcons?: number[];
    resourceIcons?: number[];
    leadingIcon?: LogLeadingIcon;
    emphasis?: LogEntryEmphasis;
};

type LogEntryInput = Omit<LogEntry, "id">;

const WIDTH = () => getGameLogConfig().width;
const HEIGHT = () => getGameLogConfig().height;
const MAX_ENTRIES = 80;
const ROW_HEIGHT = 28;
const CONTENT_LEFT = 6;
const CONTENT_RIGHT = 10;
const ROW_LEFT = 14;
const ROW_RIGHT = 16;
const ROW_TOP = 3;
const RESOURCE_ICON_SIZE = 14;
const RESOURCE_ICON_GAP = 2;
const PART_GAP = 4;

function getVisibleRows() {
    const configured = getGameLogConfig().visibleRows;
    const availableHeight = HEIGHT() - 16;
    const fitted = Math.max(1, Math.floor(availableHeight / ROW_HEIGHT));
    return Math.min(configured, fitted);
}

let container: PIXI.Container | null = null;
let content: PIXI.Container | null = null;
let entries: LogEntry[] = [];
let entryId = 0;
let pendingCardMoves: tsg.CardMoveInfo[] = [];
let pendingCardMoveFlush: ReturnType<typeof setTimeout> | null = null;
let lastSevenRollAt = 0;
let authoritativeEventsActive = false;
let lastAppliedGameEventSeq = 0;

function getPlayerName(order: number) {
    if (order < 0) {
        return "Bank";
    }

    const states = state.lastKnownStates || [];
    const found = states.find((p) => p.Order === order);
    return found?.Username || `Player ${order + 1}`;
}

function getPlayerColor(order: number) {
    if (order < 0) {
        return undefined;
    }

    const states = state.lastKnownStates || [];
    const found = states.find((p) => p.Order === order);
    return found?.Color || undefined;
}

function getPlayerMeta(order: number) {
    return {
        name: getPlayerName(order),
        color: getPlayerColor(order),
    };
}

function formatEntryText(entry: LogEntry) {
    if (entry.text) {
        return entry.text;
    }

    return [entry.actorName, entry.verb, entry.target].filter(Boolean).join(" ");
}

function getEntryTextColor(entry: LogEntry) {
    const panel = getBottomDockConfig().panel;
    if (entry.emphasis === "muted") {
        return 0x6f6a61;
    }
    if (entry.emphasis === "highlight") {
        return panel.titleText;
    }
    return panel.bodyText;
}

function clampTextToWidth(
    value: string,
    style: PIXI.TextStyle,
    maxWidth: number,
) {
    if (!value || maxWidth <= 0) {
        return "";
    }

    const fullWidth = PIXI.TextMetrics.measureText(value, style).width;
    if (fullWidth <= maxWidth) {
        return value;
    }

    let low = 0;
    let high = value.length;
    let best = "";

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const candidate = `${value.slice(0, mid).trimEnd()}...`;
        const width = PIXI.TextMetrics.measureText(candidate, style).width;
        if (width <= maxWidth) {
            best = candidate;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return best || "...";
}

function addTextPart(
    row: PIXI.Container,
    value: string | undefined,
    style: PIXI.TextStyle,
    x: number,
    maxWidth: number,
) {
    if (!value || maxWidth <= 0) {
        return x;
    }

    const fitted = clampTextToWidth(value, style, maxWidth);
    if (!fitted) {
        return x;
    }

    const text = new PIXI.Text(fitted, style);
    text.x = x;
    text.y = ROW_TOP;
    row.addChild(text);
    return text.x + text.width + PART_GAP;
}

function renderResourceIcons(row: PIXI.Container, entry: LogEntry) {
    const icons = entry.resourceIcons?.slice(0, 6) || [];
    if (!icons.length) {
        return WIDTH() - ROW_RIGHT;
    }

    const totalWidth =
        icons.length * RESOURCE_ICON_SIZE +
        Math.max(0, icons.length - 1) * RESOURCE_ICON_GAP;
    let x = WIDTH() - ROW_RIGHT - totalWidth;

    icons.forEach((ct) => {
        const icon = new PIXI.Sprite();
        icon.x = x;
        icon.y = 2;
        icon.width = RESOURCE_ICON_SIZE;
        icon.height = RESOURCE_ICON_SIZE;
        assets.assignTexture(icon, assets.cards[ct]);
        row.addChild(icon);
        x += RESOURCE_ICON_SIZE + RESOURCE_ICON_GAP;
    });

    return WIDTH() - ROW_RIGHT - totalWidth - 8;
}

function measureIconStripWidth(icons: number[] | undefined) {
    if (!icons?.length) {
        return 0;
    }

    const visibleCount = Math.min(icons.length, 6);
    return (
        visibleCount * RESOURCE_ICON_SIZE +
        Math.max(0, visibleCount - 1) * RESOURCE_ICON_GAP
    );
}

function renderTradeIcons(
    row: PIXI.Container,
    givenIcons: number[] | undefined,
    receivedIcons: number[] | undefined,
) {
    const outgoing = givenIcons?.slice(0, 6) || [];
    const incoming = receivedIcons?.slice(0, 6) || [];
    if (!outgoing.length && !incoming.length) {
        return WIDTH() - ROW_RIGHT;
    }

    const arrowWidth = outgoing.length && incoming.length ? 14 : 0;
    const outgoingWidth = measureIconStripWidth(outgoing);
    const incomingWidth = measureIconStripWidth(incoming);
    const totalWidth = outgoingWidth + arrowWidth + incomingWidth;
    let x = WIDTH() - ROW_RIGHT - totalWidth;

    outgoing.forEach((ct) => {
        const icon = new PIXI.Sprite();
        icon.x = x;
        icon.y = 2;
        icon.width = RESOURCE_ICON_SIZE;
        icon.height = RESOURCE_ICON_SIZE;
        assets.assignTexture(icon, assets.cards[ct]);
        row.addChild(icon);
        x += RESOURCE_ICON_SIZE + RESOURCE_ICON_GAP;
    });

    if (arrowWidth) {
        const arrow = new PIXI.Text(
            "->",
            createPanelBodyTextStyle({
                fontSize: 12,
                fill: getBottomDockConfig().panel.titleText,
                fontWeight: "bold",
            }),
        );
        arrow.x = x + 1;
        arrow.y = 3;
        row.addChild(arrow);
        x += arrowWidth;
    }

    incoming.forEach((ct) => {
        const icon = new PIXI.Sprite();
        icon.x = x;
        icon.y = 2;
        icon.width = RESOURCE_ICON_SIZE;
        icon.height = RESOURCE_ICON_SIZE;
        assets.assignTexture(icon, assets.cards[ct]);
        row.addChild(icon);
        x += RESOURCE_ICON_SIZE + RESOURCE_ICON_GAP;
    });

    return WIDTH() - ROW_RIGHT - totalWidth - 8;
}

function ensureUI() {
    if (!canvas.app) return;

    if (container && !container.destroyed) {
        return;
    }

    container = new PIXI.Container();
    container.zIndex = 1600;

    const bg = createDockPanel({
        width: WIDTH(),
        height: HEIGHT(),
        headerHeight: 0,
    });
    container.addChild(bg);

    content = new PIXI.Container();
    content.y = 8;

    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    mask.drawRect(
        CONTENT_LEFT,
        8,
        WIDTH() - CONTENT_LEFT - CONTENT_RIGHT,
        HEIGHT() - 16,
    );
    mask.endFill();
    container.addChild(mask);

    content.mask = mask;
    container.addChild(content);

    canvas.app.stage.addChild(container);
    relayout();
    rerender();
}

function rerender() {
    if (!content || content.destroyed) return;
    const feed = content;

    feed.removeChildren();

    const start = Math.max(0, entries.length - getVisibleRows());
    const visible = entries.slice(start);

    visible.forEach((entry, idx) => {
        const row = new PIXI.Container();
        row.y = idx * ROW_HEIGHT;
        const isNewest = idx === visible.length - 1;

        if (isNewest || entry.type === "dice_roll") {
            const highlight = new PIXI.Graphics();
            const fill =
                entry.type === "dice_roll"
                    ? getBottomDockConfig().panel.headerFill
                    : 0xffffff;
            const alpha = entry.type === "dice_roll" ? 0.08 : 0.14;
            highlight.beginFill(fill, alpha);
            highlight.drawRoundedRect(
                ROW_LEFT - 4,
                0,
                WIDTH() - ROW_LEFT - ROW_RIGHT + 6,
                ROW_HEIGHT - 4,
                6,
            );
            highlight.endFill();
            row.addChild(highlight);
        }

        const actorStyle = createPanelBodyTextStyle({
            fontSize: 14,
            fill: entry.actorColor || getEntryTextColor(entry),
            fontWeight: "bold",
        });
        const bodyStyle = createPanelBodyTextStyle({
            fontSize: 14,
            fill: getEntryTextColor(entry),
        });
        const targetStyle = createPanelBodyTextStyle({
            fontSize: 14,
            fill:
                entry.type === "dice_roll"
                    ? getBottomDockConfig().panel.titleText
                    : getEntryTextColor(entry),
            fontWeight: entry.type === "dice_roll" ? "bold" : "normal",
        });

        const textRight =
            entry.type === "bank_trade" || entry.type === "player_trade"
                ? renderTradeIcons(row, entry.givenIcons, entry.resourceIcons)
                : renderResourceIcons(row, entry);
        const textLeft = ROW_LEFT;
        let x = textLeft;
        const maxTextWidth = Math.max(0, textRight - textLeft);

        if (entry.text) {
            addTextPart(row, formatEntryText(entry), bodyStyle, x, maxTextWidth);
        } else {
            x = addTextPart(
                row,
                entry.actorName,
                actorStyle,
                x,
                Math.max(0, textRight - x),
            );
            x = addTextPart(
                row,
                entry.verb,
                bodyStyle,
                x,
                Math.max(0, textRight - x),
            );
            x = addTextPart(
                row,
                entry.target,
                targetStyle,
                x,
                Math.max(0, textRight - x),
            );
        }

        const divider = new PIXI.Graphics();
        divider.beginFill(
            getBottomDockConfig().panel.border,
            entry.type === "dice_roll" ? 0.5 : 0.35,
        );
        divider.drawRect(ROW_LEFT, ROW_HEIGHT - 2, WIDTH() - 20, 1);
        divider.endFill();
        row.addChild(divider);

        feed.addChild(row);
    });

    canvas.app.markDirty();
}

export function initialize() {
    ensureUI();
    resetAuthoritativeEvents();
    entries = [];
    entryId = 0;
    rerender();
}

export function relayout() {
    if (!container || container.destroyed) {
        return;
    }

    setFrame(
        buildHUDLayout({
            canvasWidth: canvas.getWidth(),
            canvasHeight: canvas.getHeight(),
        }).widgets.gameLog!,
    );
    canvas.app.markDirty();
}

export function setFrame(frame: HUDFrame) {
    if (!container || container.destroyed) {
        return;
    }
    container.x = frame.x;
    container.y = frame.y;
}

export function pushEntry(entry: LogEntryInput) {
    ensureUI();

    const lastEntry = entries[entries.length - 1];
    if (
        lastEntry &&
        lastEntry.type === "resource_gain" &&
        entry.type === "resource_gain" &&
        lastEntry.actorOrder === entry.actorOrder &&
        lastEntry.counterpartyOrder === entry.counterpartyOrder &&
        lastEntry.verb === entry.verb &&
        lastEntry.target === entry.target &&
        lastEntry.resourceIcons?.length &&
        entry.resourceIcons?.length
    ) {
        lastEntry.resourceIcons = [
            ...lastEntry.resourceIcons,
            ...entry.resourceIcons,
        ].slice(0, 12);
        rerender();
        return;
    }

    entries.push({
        id: entryId++,
        emphasis: "normal",
        ...entry,
    });

    if (entries.length > MAX_ENTRIES) {
        entries = entries.slice(entries.length - MAX_ENTRIES);
    }

    rerender();
}

function getRepeatedIcons(cardType: number, quantity: number) {
    const icons: number[] = [];
    for (let i = 0; i < quantity; i++) {
        icons.push(cardType);
    }
    return icons;
}

function pushResourceTransferEntry(
    gainerOrder: number,
    giverOrder: number,
    icons: number[],
) {
    if (gainerOrder < 0 || !icons.length) {
        return;
    }

    const actor = getPlayerMeta(gainerOrder);
    const lastEntry = entries[entries.length - 1];
    const counterpartyName =
        giverOrder >= 0 ? getPlayerName(giverOrder) : undefined;

    let verb = "received";
    let target: string | undefined;

    if (giverOrder >= 0) {
        const oppositeTrade =
            lastEntry?.type === "resource_gain" &&
            lastEntry.actorOrder === giverOrder &&
            lastEntry.counterpartyOrder === gainerOrder &&
            Array.isArray(lastEntry.resourceIcons) &&
            lastEntry.resourceIcons.length > 0;

        if (oppositeTrade) {
            lastEntry.verb = "traded";
            lastEntry.target = `with ${actor.name}`;
            verb = "traded";
            target = `with ${counterpartyName}`;
        } else if (icons.length === 1) {
            verb = "stole";
            target = `from ${counterpartyName}`;
        } else {
            verb = "took";
            target = `from ${counterpartyName}`;
        }
    }

    pushEntry({
        type: "resource_gain",
        actorName: actor.name,
        actorColor: actor.color,
        actorOrder: gainerOrder,
        counterpartyOrder: giverOrder >= 0 ? giverOrder : undefined,
        verb,
        target,
        resourceIcons: icons,
        leadingIcon: "player",
    });
}

function pushDiscardEntry(playerOrder: number, icons: number[]) {
    if (playerOrder < 0 || !icons.length) {
        return;
    }

    const actor = getPlayerMeta(playerOrder);
    pushEntry({
        type: "resource_loss",
        actorName: actor.name,
        actorColor: actor.color,
        actorOrder: playerOrder,
        verb: "discarded",
        resourceIcons: icons,
        leadingIcon: "player",
        emphasis: "muted",
    });
}

function pushBankTradeEntry(
    playerOrder: number,
    givenIcons: number[],
    receivedIcons: number[],
) {
    if (playerOrder < 0 || !givenIcons.length || !receivedIcons.length) {
        return;
    }

    const actor = getPlayerMeta(playerOrder);
    pushEntry({
        type: "bank_trade",
        actorName: actor.name,
        actorColor: actor.color,
        actorOrder: playerOrder,
        verb: "traded with bank",
        givenIcons,
        resourceIcons: receivedIcons,
        leadingIcon: "bank",
    });
}

function pushPlayerTradeEntry(
    actorOrder: number,
    counterpartyOrder: number,
    givenIcons: number[],
    receivedIcons: number[],
) {
    if (
        actorOrder < 0 ||
        counterpartyOrder < 0 ||
        !givenIcons.length ||
        !receivedIcons.length
    ) {
        return;
    }

    const actor = getPlayerMeta(actorOrder);
    pushEntry({
        type: "player_trade",
        actorName: actor.name,
        actorColor: actor.color,
        actorOrder,
        counterpartyOrder,
        verb: "traded with",
        target: getPlayerName(counterpartyOrder),
        givenIcons,
        resourceIcons: receivedIcons,
        leadingIcon: "player",
    });
}

function flushPendingCardMoves() {
    if (!pendingCardMoves.length) {
        return;
    }

    const moves = pendingCardMoves;
    pendingCardMoves = [];
    if (pendingCardMoveFlush) {
        clearTimeout(pendingCardMoveFlush);
        pendingCardMoveFlush = null;
    }

    const byTransfer: Record<string, { icons: number[]; total: number }> = {};
    const transferOrder: string[] = [];

    for (const move of moves) {
        const ct = Number(move.CardType);
        const quantity = Number(move.Quantity || 0);
        if (ct < CardType.Wood || ct > CardType.Coin) {
            continue;
        }
        if (quantity <= 0) {
            continue;
        }

        const gainerOrder = Number(move.GainerOrder);
        const giverOrder = Number(move.GiverOrder);
        if (gainerOrder < 0) {
            continue;
        }

        const key = `${gainerOrder}:${giverOrder}`;
        if (!byTransfer[key]) {
            byTransfer[key] = { icons: [], total: 0 };
            transferOrder.push(key);
        }
        byTransfer[key].icons.push(...getRepeatedIcons(ct, quantity));
        byTransfer[key].total += quantity;
    }

    const consumed = new Set<string>();

    transferOrder.forEach((key) => {
        if (consumed.has(key)) {
            return;
        }

        const data = byTransfer[key];
        if (!data?.total) {
            return;
        }

        const [gainerOrderRaw, giverOrderRaw] = key.split(":");
        const gainerOrder = Number(gainerOrderRaw);
        const giverOrder = Number(giverOrderRaw);

        if (giverOrder === -1) {
            const reverseKey = `-1:${gainerOrder}`;
            const reverse = byTransfer[reverseKey];
            if (reverse?.total) {
                pushBankTradeEntry(gainerOrder, reverse.icons, data.icons);
                consumed.add(key);
                consumed.add(reverseKey);
                return;
            }

            pushResourceTransferEntry(gainerOrder, giverOrder, data.icons);
            consumed.add(key);
            return;
        }

        if (gainerOrder === -1) {
            const looksLikeDiscard =
                Date.now() - lastSevenRollAt < 5000 && data.total >= 2;
            if (looksLikeDiscard) {
                pushDiscardEntry(giverOrder, data.icons);
            }
            consumed.add(key);
            return;
        }

        const reverseKey = `${giverOrder}:${gainerOrder}`;
        const reverse = byTransfer[reverseKey];
        if (reverse?.total) {
            pushPlayerTradeEntry(
                gainerOrder,
                giverOrder,
                reverse.icons,
                data.icons,
            );
            consumed.add(key);
            consumed.add(reverseKey);
            return;
        }

        pushResourceTransferEntry(gainerOrder, giverOrder, data.icons);
        consumed.add(key);
    });
}

function queueCardMove(move: tsg.CardMoveInfo) {
    if (authoritativeEventsActive) {
        return;
    }
    pendingCardMoves.push(move);
    if (pendingCardMoveFlush) {
        clearTimeout(pendingCardMoveFlush);
    }
    pendingCardMoveFlush = setTimeout(() => {
        flushPendingCardMoves();
    }, 90);
}

export function logDiceRoll(d: tsg.DieRollState) {
    if (authoritativeEventsActive) {
        return;
    }

    if (d.IsInit) {
        return;
    }

    flushPendingCardMoves();

    const roller =
        state.lastKnownGameState?.CurrentPlayerOrder !== undefined
            ? getPlayerName(state.lastKnownGameState.CurrentPlayerOrder)
            : "A player";

    const player = getPlayerMeta(
        state.lastKnownGameState?.CurrentPlayerOrder ?? -1,
    );
    pushEntry({
        type: "dice_roll",
        actorName: roller,
        actorColor: player.color,
        verb: "rolled",
        target: `${d.RedRoll + d.WhiteRoll} (${d.RedRoll}+${d.WhiteRoll})`,
        leadingIcon: "dice",
        emphasis: "highlight",
    });

    if (d.RedRoll + d.WhiteRoll === 7) {
        lastSevenRollAt = Date.now();
    }

    if (d.GainInfo?.length) {
        const gainMoves = d.GainInfo.map((move) => new tsg.CardMoveInfo(move));
        gainMoves.forEach(queueCardMove);
    }
}

export function logCardMove(move: tsg.CardMoveInfo) {
    if (authoritativeEventsActive) {
        return;
    }
    queueCardMove(move);
}

export function logVertexPlacement(vp: tsg.VertexPlacement) {
    if (authoritativeEventsActive) {
        return;
    }
    flushPendingCardMoves();
    const actorName = vp.Owner?.Username || getPlayerName(vp.Owner?.Order ?? -1);
    const actorColor = vp.Owner?.Color || getPlayerColor(vp.Owner?.Order ?? -1);

    let verb = "placed";
    let target: string | undefined;

    switch (vp.Type) {
        case BuildableType.Settlement:
            target = "a Settlement";
            break;
        case BuildableType.City:
            verb = "built";
            target = "a City";
            break;
        default:
            return;
    }

    pushEntry({
        type: "build_action",
        actorName,
        actorColor,
        verb,
        target,
        leadingIcon: "player",
    });
}

export function logEdgePlacement(ep: tsg.Road) {
    if (authoritativeEventsActive) {
        return;
    }
    flushPendingCardMoves();
    const actorName = ep.Owner?.Username || getPlayerName(ep.Owner?.Order ?? -1);
    const actorColor = ep.Owner?.Color || getPlayerColor(ep.Owner?.Order ?? -1);

    let target: string | undefined;

    switch (ep.Type) {
        case BuildableType.Road:
            target = "a Road";
            break;
        case BuildableType.Ship:
            target = "a Ship";
            break;
        default:
            return;
    }

    pushEntry({
        type: "build_action",
        actorName,
        actorColor,
        verb: "placed",
        target,
        leadingIcon: "player",
    });
}

export function logDevCardUse(info: tsg.DevCardUseInfo) {
    if (authoritativeEventsActive) {
        return;
    }

    // Server often sends a hide/removal follow-up message; log only visible event.
    if (!info.CardType || info.Time !== 0) {
        return;
    }

    flushPendingCardMoves();

    const actor =
        state.lastKnownGameState?.CurrentPlayerOrder !== undefined
            ? getPlayerName(state.lastKnownGameState.CurrentPlayerOrder)
            : "A player";

    const player = getPlayerMeta(
        state.lastKnownGameState?.CurrentPlayerOrder ?? -1,
    );
    pushEntry({
        type: "dev_card_use",
        actorName: actor,
        actorColor: player.color,
        verb: "played",
        target: "a development card",
        leadingIcon: "development_card",
    });
}

export function logDevCardDraw(playerOrder: number) {
    if (authoritativeEventsActive) {
        return;
    }
    flushPendingCardMoves();
    const player = getPlayerMeta(playerOrder);
    pushEntry({
        type: "dev_card_draw",
        actorName: player.name,
        actorColor: player.color,
        verb: "bought",
        target: "a development card",
        leadingIcon: "development_card",
    });
}

export function logNotice(text: string) {
    flushPendingCardMoves();
    pushEntry({
        type: "notice",
        text,
        leadingIcon: "notice",
        emphasis: "muted",
    });
}

export function hasAuthoritativeEvents() {
    return authoritativeEventsActive;
}

export function resetAuthoritativeEvents() {
    if (pendingCardMoveFlush) {
        clearTimeout(pendingCardMoveFlush);
        pendingCardMoveFlush = null;
    }
    pendingCardMoves = [];
    lastSevenRollAt = 0;
    authoritativeEventsActive = false;
    lastAppliedGameEventSeq = 0;
}

function expandEventCards(cards: tsg.GameEventCard[] | undefined) {
    if (!cards?.length) {
        return [];
    }

    const icons: number[] = [];
    for (const card of cards) {
        const quantity = Number(card.Quantity || 0);
        const type = Number(card.Type);
        if (quantity <= 0) {
            continue;
        }
        icons.push(...getRepeatedIcons(type, quantity));
    }
    return icons;
}

function getBuildAction(buildableType: number) {
    switch (buildableType) {
        case BuildableType.City:
            return { verb: "built", target: "a City" };
        case BuildableType.Settlement:
            return { verb: "placed", target: "a Settlement" };
        case BuildableType.Road:
            return { verb: "placed", target: "a Road" };
        case BuildableType.Ship:
            return { verb: "placed", target: "a Ship" };
        default:
            return null;
    }
}

function getDevCardPlayTarget(cardType: number) {
    switch (cardType) {
        case DevelopmentCardType.Knight:
            return "a Knight";
        case DevelopmentCardType.Monopoly:
            return "Monopoly";
        case DevelopmentCardType.RoadBuilding:
            return "Road Building";
        case DevelopmentCardType.YearOfPlenty:
            return "Year of Plenty";
        case DevelopmentCardType.VictoryPoint:
            return "a Victory Point card";
        default:
            return "a development card";
    }
}

function activateAuthoritativeEvents() {
    if (authoritativeEventsActive) {
        return;
    }

    if (pendingCardMoveFlush) {
        clearTimeout(pendingCardMoveFlush);
        pendingCardMoveFlush = null;
    }
    pendingCardMoves = [];
    entries = [];
    authoritativeEventsActive = true;
}

function applyAuthoritativeGameEvent(event: tsg.GameEvent) {
    activateAuthoritativeEvents();

    const seq = Number(event.Seq || 0);
    if (seq > 0) {
        if (seq <= lastAppliedGameEventSeq) {
            return;
        }
        lastAppliedGameEventSeq = seq;
    }

    flushPendingCardMoves();

    const actor = getPlayerMeta(Number(event.ActorOrder ?? -1));
    const actorOrder = Number(event.ActorOrder ?? -1);
    const targetOrder = Number(event.TargetOrder ?? -1);
    const counterpartyOrder = Number(event.CounterpartyOrder ?? -1);
    const resourceIcons = expandEventCards(event.Resources);
    const givenIcons = expandEventCards(event.Given);
    const receivedIcons = expandEventCards(event.Received);

    switch (event.Type) {
        case "dice_rolled":
            pushEntry({
                type: "dice_roll",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                verb: "rolled",
                target: `${Number(event.RedRoll || 0) + Number(event.WhiteRoll || 0)} (${Number(event.RedRoll || 0)}+${Number(event.WhiteRoll || 0)})`,
                emphasis: "highlight",
            });
            if (
                Number(event.RedRoll || 0) + Number(event.WhiteRoll || 0) ===
                7
            ) {
                lastSevenRollAt = Date.now();
            }
            return;

        case "resources_received":
            pushEntry({
                type: "resource_gain",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                verb: "received",
                resourceIcons,
            });
            return;

        case "build_placed": {
            const action = getBuildAction(Number(event.BuildableType));
            if (!action) {
                return;
            }
            pushEntry({
                type: "build_action",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                verb: action.verb,
                target: action.target,
            });
            return;
        }

        case "dev_card_bought":
            pushEntry({
                type: "dev_card_draw",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                verb: "bought",
                target: "a development card",
            });
            return;

        case "dev_card_played":
            pushEntry({
                type: "dev_card_use",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                verb: "played",
                target: getDevCardPlayTarget(Number(event.DevelopmentCard)),
            });
            return;

        case "bank_trade_completed":
            pushEntry({
                type: "bank_trade",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                verb: "gave bank",
                target: receivedIcons.length ? "and took" : undefined,
                givenIcons,
                resourceIcons: receivedIcons,
            });
            return;

        case "player_trade_completed":
            pushEntry({
                type: "player_trade",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                counterpartyOrder,
                verb: "traded with",
                target: getPlayerName(counterpartyOrder),
                givenIcons,
                resourceIcons: receivedIcons,
            });
            return;

        case "cards_stolen":
            pushEntry({
                type: "resource_gain",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                counterpartyOrder: targetOrder,
                verb: "stole from",
                target: getPlayerName(targetOrder),
            });
            return;

        case "cards_discarded":
            pushEntry({
                type: "resource_loss",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                verb: "discarded",
                resourceIcons,
                emphasis: "muted",
            });
            return;

        case "robber_moved":
            pushEntry({
                type: "notice",
                actorName: actor.name,
                actorColor: actor.color,
                actorOrder,
                verb: "moved the",
                target:
                    String(event.Token || "").toLowerCase() === "pirate"
                        ? "pirate"
                        : "robber",
            });
            return;

        default:
            return;
    }
}

export function applyGameEvent(event: tsg.GameEvent) {
    applyAuthoritativeGameEvent(event);
}

export function applyGameEventHistory(history: tsg.GameEventHistory) {
    if (!history.Events?.length) {
        return;
    }

    history.Events
        .filter(Boolean)
        .sort((left, right) => Number(left.Seq || 0) - Number(right.Seq || 0))
        .forEach(applyAuthoritativeGameEvent);
}
