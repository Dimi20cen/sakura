type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

import {
    getActionBarConfig,
    getBottomRailConfig,
    getChatConfig,
    getGameLogConfig,
    getHudConfig,
    getHudMiscConfig,
    getResourceBankConfig,
} from "./uiConfig";
import { buildHUDLayout, computeActionBarWidth, computeHandWidthForViewport } from "./hud/layoutEngine";

type HUDLayoutSnapshotInput = {
    canvasWidth: number;
    canvasHeight: number;
    playerPanelWidth?: number;
    playerPanelHeight?: number;
    playerPanelScale?: number;
    playerCount?: number;
    diceWidth?: number;
    diceHeight?: number;
};

export function getHUDLayoutSnapshot(input: HUDLayoutSnapshotInput) {
    return buildHUDLayout(input);
}

export function getRightStackPanelWidth() {
    return getGameLogConfig().width;
}

function getRightRailX(canvasWidth: number) {
    const hud = getHudConfig();
    return canvasWidth - hud.padding - hud.rightRail.width;
}

function getRightRailContentX(canvasWidth: number, contentWidth: number) {
    const hud = getHudConfig();
    return canvasWidth - hud.padding - contentWidth;
}

type PlayerPanelPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
    panelWidth: number;
    panelHeight: number;
    panelScale: number;
};

export function computePlayerPanelPosition({
    canvasWidth,
    canvasHeight,
    panelWidth,
    panelHeight,
    panelScale,
}: PlayerPanelPositionInput) {
    const frame = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight,
        playerPanelWidth: panelWidth,
        playerPanelHeight: panelHeight,
        playerPanelScale: panelScale,
    }).widgets.playerPanel!;
    return { x: frame.x, y: frame.y };
}

type BankPositionInput = {
    canvasWidth: number;
    playerPanelY: number;
};

export function computeBankPosition({
    canvasWidth,
    playerPanelY,
}: BankPositionInput) {
    const hud = getHudConfig();
    return {
        x: canvasWidth - hud.padding - hud.misc.bankSize,
        y: Math.max(hud.misc.bankTopMin, playerPanelY - 95),
    };
}

type ActionBarPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
};

export function computeActionBarPosition({
    canvasWidth,
    canvasHeight,
}: ActionBarPositionInput) {
    const frame = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight,
    }).widgets.actionBar!;
    return { x: frame.x, y: frame.y };
}

type HandPositionInput = {
    canvasHeight: number;
    handHeight: number;
};

export function computeHandWidth(canvasWidth: number) {
    return computeHandWidthForViewport(canvasWidth);
}

export function computeHandPosition({
    canvasHeight,
    handHeight,
}: HandPositionInput) {
    const hud = getHudConfig();
    return {
        x: hud.bottomRail.leftInset,
        y: canvasHeight - handHeight - hud.bottomRail.bottomInset,
    };
}

type ClampSpanWithinBoundsInput = {
    preferredX: number;
    minX: number;
    maxX: number;
    spanWidth: number;
};

export function clampSpanWithinBounds({
    preferredX,
    minX,
    maxX,
    spanWidth,
}: ClampSpanWithinBoundsInput) {
    const maxStartX = maxX - spanWidth;
    if (maxStartX <= minX) {
        return minX;
    }

    return Math.max(minX, Math.min(preferredX, maxStartX));
}

type EvenlySpacedRowXPositionsInput = {
    containerWidth: number;
    itemWidth: number;
    itemCount: number;
    preferredGap?: number;
    minInset?: number;
};

export function computeEvenlySpacedRowXPositions({
    containerWidth,
    itemWidth,
    itemCount,
    preferredGap = 6,
    minInset = 4,
}: EvenlySpacedRowXPositionsInput) {
    if (itemCount <= 0) {
        return [];
    }

    if (itemCount === 1) {
        return [Math.max(minInset, Math.floor((containerWidth - itemWidth) / 2))];
    }

    const availableGapWidth = Math.max(
        0,
        containerWidth - minInset * 2 - itemWidth * itemCount,
    );
    const gap = Math.min(preferredGap, availableGapWidth / (itemCount - 1));
    const usedWidth = itemWidth * itemCount + gap * (itemCount - 1);
    const inset = Math.max(minInset, (containerWidth - usedWidth) / 2);

    return Array.from({ length: itemCount }, (_, index) =>
        Math.round(inset + index * (itemWidth + gap)),
    );
}

type DevConfirmationPositionInput = {
    canvasHeight: number;
    handHeight: number;
};

export function computeDevConfirmationPosition({
    canvasHeight,
    handHeight,
}: DevConfirmationPositionInput) {
    const hud = getHudMiscConfig();
    return {
        x: getHudConfig().padding,
        y: canvasHeight - handHeight - hud.devConfirmationOffsetY,
    };
}

type SpectatorsPositionInput = {
    canvasHeight: number;
};

export function computeSpectatorsPosition({
    canvasHeight: _canvasHeight,
}: SpectatorsPositionInput) {
    const hud = getHudMiscConfig();
    return { x: hud.spectatorsX, y: hud.spectatorsY };
}

type DicePositionInput = {
    canvasWidth: number;
    canvasHeight: number;
    diceWidth: number;
    diceHeight: number;
    actionBarTop: number;
    playerPanel?: Rect | null;
};

export function computeDicePosition({
    canvasWidth,
    canvasHeight,
    diceWidth,
    diceHeight,
    actionBarTop,
    playerPanel: _playerPanel,
}: DicePositionInput) {
    const frame = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight,
        diceWidth,
        diceHeight,
    }).widgets.dice!;
    return { x: frame.x, y: Math.min(frame.y, actionBarTop - getHudConfig().dice.aboveActionBarGap - diceHeight) };
}

type SpecialBuildPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
};

export function computeSpecialBuildPosition({
    canvasWidth,
    canvasHeight,
}: SpecialBuildPositionInput) {
    const frame = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight,
    }).widgets.specialBuild!;
    return { x: frame.x, y: frame.y };
}

type ChatWindowPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
};

type ChatLanePositionInput = {
    canvasWidth: number;
};

export function computeChatLanePosition({ canvasWidth }: ChatLanePositionInput) {
    const frame = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight:
            getHudConfig().rightRail.topInset +
            getGameLogConfig().height +
            getHudConfig().gap +
            getChatConfig().laneHeight +
            getResourceBankConfig().height +
            getHudConfig().rightRail.bottomInset,
    }).widgets.chatLane!;
    return { x: frame.x, y: frame.y };
}

export function computeChatWindowPosition({
    canvasWidth,
    canvasHeight: _canvasHeight,
}: ChatWindowPositionInput) {
    const frame = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight: _canvasHeight,
    }).widgets.chatWindow!;
    return {
        x: frame.x + frame.width,
        y: frame.y + frame.height,
    };
}

type ChatButtonPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
};

export function computeChatButtonPosition({
    canvasWidth,
    canvasHeight: _canvasHeight,
}: ChatButtonPositionInput) {
    return getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight: _canvasHeight,
    }).anchors.chatButtonCenter;
}

type ChatPopupPositionInput = {
    canvasWidth: number;
    chatButtonY: number;
};

export function computeChatPopupPosition({
    canvasWidth,
    chatButtonY,
}: ChatPopupPositionInput) {
    const point = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight: chatButtonY,
    }).anchors.chatPopup;
    return {
        x: point.x,
        y: chatButtonY,
    };
}

type GameLogPositionInput = {
    canvasWidth: number;
};

export function computeGameLogPosition({ canvasWidth }: GameLogPositionInput) {
    const frame = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight:
            getHudConfig().rightRail.topInset +
            getGameLogConfig().height +
            getHudConfig().rightRail.bottomInset,
    }).widgets.gameLog!;
    return { x: frame.x, y: frame.y };
}

type ResourceBankPositionInput = {
    canvasWidth: number;
};

export function computeResourceBankPosition({
    canvasWidth,
}: ResourceBankPositionInput) {
    const frame = getHUDLayoutSnapshot({
        canvasWidth,
        canvasHeight:
            getHudConfig().rightRail.topInset +
            getGameLogConfig().height +
            getHudConfig().gap +
            getChatConfig().laneHeight +
            getHudConfig().gap +
            getResourceBankConfig().height +
            getHudConfig().rightRail.bottomInset,
    }).widgets.resourceBank!;
    return { x: frame.x, y: frame.y };
}
