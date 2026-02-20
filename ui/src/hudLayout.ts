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

export const RIGHT_STACK_PANEL_WIDTH = HUD_LAYOUT_PRESET.chatLaneWidth;

function getRightRailX(canvasWidth: number) {
    return (
        canvasWidth -
        HUD_LAYOUT_PRESET.padding -
        HUD_LAYOUT_PRESET.rightRailWidth
    );
}

function getRightRailContentX(canvasWidth: number, contentWidth: number) {
    return canvasWidth - HUD_LAYOUT_PRESET.padding - contentWidth;
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
    const y =
        canvasHeight -
        panelHeight * panelScale -
        HUD_LAYOUT_PRESET.rightRailBottomInset;
    return {
        x: Math.max(
            HUD_LAYOUT_PRESET.padding,
            getRightRailContentX(canvasWidth, panelWidth * panelScale),
        ),
        y: Math.max(HUD_LAYOUT_PRESET.rightRailTopInset, y),
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
    const handWidth = computeHandWidth(canvasWidth);
    const x =
        HUD_LAYOUT_PRESET.bottomRailLeftInset +
        handWidth +
        HUD_LAYOUT_PRESET.bottomRailGap;

    return {
        x: Math.max(HUD_LAYOUT_PRESET.padding, x),
        y:
            canvasHeight -
            HUD_LAYOUT_PRESET.bottomRailBottomInset -
            HUD_LAYOUT_PRESET.actionBarHeight,
    };
}

type HandPositionInput = {
    canvasHeight: number;
    handHeight: number;
};

export function computeHandWidth(canvasWidth: number) {
    const rightRailX = getRightRailX(canvasWidth);
    const actionBarWidth =
        HUD_LAYOUT_PRESET.actionBarInnerOffset +
        HUD_LAYOUT_PRESET.actionBarButtonSpacing * 5;
    const width =
        rightRailX -
        HUD_LAYOUT_PRESET.bottomRailLeftInset -
        HUD_LAYOUT_PRESET.bottomRailGap -
        actionBarWidth;
    return Math.max(260, Math.min(900, Math.floor(width)));
}

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
    playerPanel: _playerPanel,
}: DicePositionInput) {
    const rightRailX = getRightRailX(canvasWidth);

    let x = rightRailX - HUD_LAYOUT_PRESET.diceRightRailGap - diceWidth;
    let y =
        actionBarTop -
        HUD_LAYOUT_PRESET.diceAboveActionBarGap -
        diceHeight;

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

type ChatLanePositionInput = {
    canvasWidth: number;
};

export function computeChatLanePosition({ canvasWidth }: ChatLanePositionInput) {
    return {
        x: getRightRailContentX(canvasWidth, HUD_LAYOUT_PRESET.chatLaneWidth),
        y:
            HUD_LAYOUT_PRESET.rightRailTopInset +
            HUD_LAYOUT_PRESET.gameLogHeight +
            HUD_LAYOUT_PRESET.gap,
    };
}

export function computeChatWindowPosition({
    canvasWidth,
    canvasHeight: _canvasHeight,
}: ChatWindowPositionInput) {
    const chatBottom =
        HUD_LAYOUT_PRESET.rightRailTopInset +
        HUD_LAYOUT_PRESET.gameLogHeight +
        HUD_LAYOUT_PRESET.gap +
        HUD_LAYOUT_PRESET.chatLaneHeight;
    return {
        x: canvasWidth - HUD_LAYOUT_PRESET.padding,
        y: Math.max(250, chatBottom + 2),
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
    const lane = computeChatLanePosition({ canvasWidth });
    return {
        x: lane.x + HUD_LAYOUT_PRESET.chatLaneWidth / 2,
        y: lane.y + HUD_LAYOUT_PRESET.chatLaneHeight / 2,
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

type GameLogPositionInput = {
    canvasWidth: number;
};

export function computeGameLogPosition({ canvasWidth }: GameLogPositionInput) {
    return {
        x: getRightRailContentX(canvasWidth, HUD_LAYOUT_PRESET.chatLaneWidth),
        y: HUD_LAYOUT_PRESET.rightRailTopInset,
    };
}

type ResourceBankPositionInput = {
    canvasWidth: number;
};

export function computeResourceBankPosition({
    canvasWidth,
}: ResourceBankPositionInput) {
    const y =
        HUD_LAYOUT_PRESET.rightRailTopInset +
        HUD_LAYOUT_PRESET.gameLogHeight +
        HUD_LAYOUT_PRESET.gap +
        HUD_LAYOUT_PRESET.chatLaneHeight +
        HUD_LAYOUT_PRESET.gap;
    return {
        x: getRightRailContentX(canvasWidth, HUD_LAYOUT_PRESET.chatLaneWidth),
        y,
    };
}
