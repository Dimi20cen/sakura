type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

/**
 * Central HUD tuning preset.
 *
 * Future position tweaks should happen here first.
 */
export const HUD_LAYOUT_PRESET = {
    padding: 20,
    gap: 12,

    // Right rail where player list/bank/chat anchor.
    rightRailWidth: 292,
    rightRailBottomInset: 6,

    // Bottom rail where hand/action controls sit.
    bottomRailLeftInset: 10,
    bottomRailBottomInset: 8,
    handHeight: 90,

    // Action bar placement relative to canvas and right rail.
    actionBarRightRailGap: 16,
    actionBarInnerOffset: 12,
    actionBarButtonSpacing: 74,
    actionBarHeight: 90,
    actionBarOverlapWithHand: -6,

    // Dice placement around right rail/action bar.
    diceRightRailGap: 4,
    diceAboveActionBarGap: 14,
    diceAbovePlayerRailGap: 12,
    minTopInset: 20,

    // Misc legacy windows.
    bankSize: 90,
    bankTopMin: 10,
} as const;

function getRightRailX(canvasWidth: number) {
    return (
        canvasWidth -
        HUD_LAYOUT_PRESET.padding -
        HUD_LAYOUT_PRESET.rightRailWidth
    );
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
    const rightRailX = getRightRailX(canvasWidth);
    return {
        x: Math.max(HUD_LAYOUT_PRESET.padding, rightRailX + HUD_LAYOUT_PRESET.rightRailWidth - panelWidth * panelScale),
        y: Math.max(
            4,
            canvasHeight -
                panelHeight * panelScale -
                HUD_LAYOUT_PRESET.rightRailBottomInset,
        ),
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
    return {
        x: canvasWidth - HUD_LAYOUT_PRESET.padding - HUD_LAYOUT_PRESET.bankSize,
        y: Math.max(HUD_LAYOUT_PRESET.bankTopMin, playerPanelY - 95),
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
    const actionBarWidth =
        HUD_LAYOUT_PRESET.actionBarInnerOffset +
        HUD_LAYOUT_PRESET.actionBarButtonSpacing * 5;
    const rightRailX = getRightRailX(canvasWidth);

    const handTop =
        canvasHeight -
        HUD_LAYOUT_PRESET.handHeight -
        HUD_LAYOUT_PRESET.bottomRailBottomInset;

    return {
        x: rightRailX - HUD_LAYOUT_PRESET.actionBarRightRailGap - actionBarWidth,
        // Keep action bar tied to the hand lane for stable spacing.
        y:
            handTop -
            HUD_LAYOUT_PRESET.actionBarHeight +
            HUD_LAYOUT_PRESET.actionBarOverlapWithHand,
    };
}

type HandPositionInput = {
    canvasHeight: number;
    handHeight: number;
};

export function computeHandPosition({
    canvasHeight,
    handHeight,
}: HandPositionInput) {
    return {
        x: HUD_LAYOUT_PRESET.bottomRailLeftInset,
        y:
            canvasHeight -
            handHeight -
            HUD_LAYOUT_PRESET.bottomRailBottomInset,
    };
}

type DevConfirmationPositionInput = {
    canvasHeight: number;
    handHeight: number;
};

export function computeDevConfirmationPosition({
    canvasHeight,
    handHeight,
}: DevConfirmationPositionInput) {
    return {
        x: HUD_LAYOUT_PRESET.padding,
        y: canvasHeight - handHeight - 360,
    };
}

type SpectatorsPositionInput = {
    canvasHeight: number;
};

export function computeSpectatorsPosition({
    canvasHeight: _canvasHeight,
}: SpectatorsPositionInput) {
    return {
        x: 60,
        y: 20,
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
    playerPanel,
}: DicePositionInput) {
    const rightRailX = getRightRailX(canvasWidth);

    let x = rightRailX - HUD_LAYOUT_PRESET.diceRightRailGap - diceWidth;
    let y =
        actionBarTop -
        HUD_LAYOUT_PRESET.diceAboveActionBarGap -
        diceHeight;

    if (playerPanel) {
        const aboveRailY =
            playerPanel.y - HUD_LAYOUT_PRESET.diceAbovePlayerRailGap - diceHeight;
        y = Math.min(y, aboveRailY);
    }

    x = Math.max(HUD_LAYOUT_PRESET.padding, x);
    y = Math.max(
        HUD_LAYOUT_PRESET.minTopInset,
        Math.min(
            canvasHeight - HUD_LAYOUT_PRESET.padding - diceHeight,
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
    const rightRailX = getRightRailX(canvasWidth);
    return {
        x: rightRailX - 100,
        y: canvasHeight - 260,
    };
}

type ChatWindowPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
};

export function computeChatWindowPosition({
    canvasWidth,
    canvasHeight,
}: ChatWindowPositionInput) {
    return {
        x: canvasWidth - HUD_LAYOUT_PRESET.padding,
        y: canvasHeight - 250,
    };
}

type ChatButtonPositionInput = {
    canvasWidth: number;
    canvasHeight: number;
};

export function computeChatButtonPosition({
    canvasWidth,
    canvasHeight,
}: ChatButtonPositionInput) {
    return {
        x: canvasWidth - HUD_LAYOUT_PRESET.padding,
        y: canvasHeight - 285,
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
    return {
        x: canvasWidth - (20 + 40 + 10),
        y: chatButtonY,
    };
}
