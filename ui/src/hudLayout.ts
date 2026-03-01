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

/**
 * Central HUD tuning preset.
 *
 * Future position tweaks should happen here first.
 */
export const HUD_LAYOUT_PRESET = {
    padding: 12,
    gap: 8,

    // Right rail where player list/bank/chat anchor.
    rightRailWidth: 292,
    rightRailBottomInset: 6,
    rightRailTopInset: 4,
    gameLogHeight: 300,
    chatLaneHeight: 34,
    chatLaneWidth: 270,
    bankLaneHeight: 66,

    // Bottom rail where hand/action controls sit.
    bottomRailLeftInset: 10,
    bottomRailBottomInset: 8,
    bottomRailGap: 8,
    handHeight: 90,

    // Action bar placement relative to canvas and right rail.
    actionBarInnerOffset: 12,
    actionBarButtonSpacing: 74,
    actionBarHeight: 90,
    actionBarAboveHandGap: 8,

    // Dice placement around right rail/action bar.
    diceRightRailGap: 10,
    diceAboveActionBarGap: 10,
    diceAbovePlayerRailGap: 12,
    minTopInset: 20,

    // Misc legacy windows.
    bankSize: 90,
    bankTopMin: 10,
} as const;

function getHUDLayoutPreset() {
    const hud = getHudConfig();
    return {
        padding: hud.padding,
        gap: hud.gap,
        rightRailWidth: hud.rightRail.width,
        rightRailBottomInset: hud.rightRail.bottomInset,
        rightRailTopInset: hud.rightRail.topInset,
        gameLogHeight: hud.gameLog.height,
        chatLaneHeight: hud.chat.laneHeight,
        chatLaneWidth: hud.chat.laneWidth,
        bankLaneHeight: hud.resourceBank.height,
        bottomRailLeftInset: hud.bottomRail.leftInset,
        bottomRailBottomInset: hud.bottomRail.bottomInset,
        bottomRailGap: hud.bottomRail.gap,
        handHeight: hud.bottomRail.handHeight,
        actionBarInnerOffset: hud.actionBar.innerOffset,
        actionBarButtonSpacing: hud.actionBar.buttonSpacing,
        actionBarHeight: hud.actionBar.height,
        actionBarAboveHandGap: 8,
        diceRightRailGap: hud.dice.rightRailGap,
        diceAboveActionBarGap: hud.dice.aboveActionBarGap,
        diceAbovePlayerRailGap: 12,
        minTopInset: hud.dice.minTopInset,
        bankSize: hud.misc.bankSize,
        bankTopMin: hud.misc.bankTopMin,
    } as const;
}

export function getRightStackPanelWidth() {
    return getGameLogConfig().width;
}

function getRightRailX(canvasWidth: number) {
    const preset = getHUDLayoutPreset();
    return (
        canvasWidth -
        preset.padding -
        preset.rightRailWidth
    );
}

function getRightRailContentX(canvasWidth: number, contentWidth: number) {
    const preset = getHUDLayoutPreset();
    return canvasWidth - preset.padding - contentWidth;
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
    const preset = getHUDLayoutPreset();
    const y =
        canvasHeight -
        panelHeight * panelScale -
        preset.rightRailBottomInset;
    return {
        x: Math.max(
            preset.padding,
            getRightRailContentX(canvasWidth, panelWidth * panelScale),
        ),
        y: Math.max(preset.rightRailTopInset, y),
    };
}

type BankPositionInput = {
    canvasWidth: number;
    playerPanelY: number;
};

export function computeBankPosition({
    canvasWidth,
    playerPanelY,
}: BankPositionInput) {
    const preset = getHUDLayoutPreset();
    return {
        x: canvasWidth - preset.padding - preset.bankSize,
        y: Math.max(preset.bankTopMin, playerPanelY - 95),
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
    const preset = getHUDLayoutPreset();
    const handWidth = computeHandWidth(canvasWidth);
    const x =
        preset.bottomRailLeftInset +
        handWidth +
        preset.bottomRailGap;

    return {
        x: Math.max(preset.padding, x),
        y:
            canvasHeight -
            preset.bottomRailBottomInset -
            preset.actionBarHeight,
    };
}

type HandPositionInput = {
    canvasHeight: number;
    handHeight: number;
};

export function computeHandWidth(canvasWidth: number) {
    const preset = getHUDLayoutPreset();
    const bottomRail = getBottomRailConfig();
    const actionBar = getActionBarConfig();
    const rightRailX = getRightRailX(canvasWidth);
    // Reserve space for the action bar and timer lane.
    const actionBarWidth =
        preset.actionBarInnerOffset +
        preset.actionBarButtonSpacing * actionBar.buttonCount;
    const width =
        rightRailX -
        preset.bottomRailLeftInset -
        preset.bottomRailGap -
        actionBarWidth;
    return Math.max(
        bottomRail.handMinWidth,
        Math.min(bottomRail.handMaxWidth, Math.floor(width)),
    );
}

export function computeHandPosition({
    canvasHeight,
    handHeight,
}: HandPositionInput) {
    const preset = getHUDLayoutPreset();
    return {
        x: preset.bottomRailLeftInset,
        y:
            canvasHeight -
            handHeight -
            preset.bottomRailBottomInset,
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
    return {
        x: hud.spectatorsX,
        y: hud.spectatorsY,
    };
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
    const preset = getHUDLayoutPreset();
    const rightRailX = getRightRailX(canvasWidth);

    let x = rightRailX - preset.diceRightRailGap - diceWidth;
    let y =
        actionBarTop -
        preset.diceAboveActionBarGap -
        diceHeight;

    x = Math.max(preset.padding, x);
    y = Math.max(
        preset.minTopInset,
        Math.min(
            canvasHeight - preset.padding - diceHeight,
            y,
        ),
    );

    return { x, y };
}

type SpecialBuildPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
};

export function computeSpecialBuildPosition({
    canvasWidth,
    canvasHeight,
}: SpecialBuildPositionInput) {
    const hud = getHudMiscConfig();
    const rightRailX = getRightRailX(canvasWidth);
    return {
        x: rightRailX - hud.specialBuildOffsetX,
        y: canvasHeight - hud.specialBuildOffsetY,
    };
}

type ChatWindowPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
};

type ChatLanePositionInput = {
    canvasWidth: number;
};

export function computeChatLanePosition({ canvasWidth }: ChatLanePositionInput) {
    const preset = getHUDLayoutPreset();
    return {
        x: getRightRailContentX(canvasWidth, preset.chatLaneWidth),
        y:
            preset.rightRailTopInset +
            preset.gameLogHeight +
            preset.gap,
    };
}

export function computeChatWindowPosition({
    canvasWidth,
    canvasHeight: _canvasHeight,
}: ChatWindowPositionInput) {
    const hud = getChatConfig();
    const preset = getHUDLayoutPreset();
    const chatBottom =
        preset.rightRailTopInset +
        preset.gameLogHeight +
        preset.gap +
        preset.chatLaneHeight;
    return {
        x: canvasWidth - getHudConfig().padding,
        y: Math.max(hud.minWindowBottom, chatBottom + 2),
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
    const hud = getChatConfig();
    const lane = computeChatLanePosition({ canvasWidth });
    return {
        x: lane.x + hud.laneWidth / 2,
        y: lane.y + hud.laneHeight / 2,
    };
}

type ChatPopupPositionInput = {
    canvasWidth: number;
    chatButtonY: number;
};

export function computeChatPopupPosition({
    canvasWidth,
    chatButtonY,
}: ChatPopupPositionInput) {
    const hud = getChatConfig();
    return {
        x:
            canvasWidth -
            (hud.popupRightInset + hud.popupTailInset + 10),
        y: chatButtonY,
    };
}

type GameLogPositionInput = {
    canvasWidth: number;
};

export function computeGameLogPosition({ canvasWidth }: GameLogPositionInput) {
    const preset = getHUDLayoutPreset();
    return {
        x: getRightRailContentX(canvasWidth, getGameLogConfig().width),
        y: preset.rightRailTopInset,
    };
}

type ResourceBankPositionInput = {
    canvasWidth: number;
};

export function computeResourceBankPosition({
    canvasWidth,
}: ResourceBankPositionInput) {
    const preset = getHUDLayoutPreset();
    const y =
        preset.rightRailTopInset +
        preset.gameLogHeight +
        preset.gap +
        preset.chatLaneHeight +
        preset.gap;
    return {
        x: getRightRailContentX(canvasWidth, getResourceBankConfig().width),
        y,
    };
}
