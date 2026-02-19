type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const HUD_PADDING = 20;
const HUD_GAP = 12;
const PLAYER_PANEL_BOTTOM_OFFSET = 125;
const BANK_SIZE = 90;
const BANK_TOP_MIN = 10;

const ACTION_BAR_INNER_OFFSET = 12;
const ACTION_BAR_BUTTON_SPACING = 74;
const ACTION_BAR_RIGHT_OFFSET = 30;
const ACTION_BAR_BOTTOM = 120;

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
    return {
        x: canvasWidth - panelWidth * panelScale - HUD_PADDING,
        y: Math.max(
            HUD_PADDING,
            canvasHeight - panelHeight * panelScale - PLAYER_PANEL_BOTTOM_OFFSET,
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
        x: canvasWidth - HUD_PADDING - BANK_SIZE,
        y: Math.max(BANK_TOP_MIN, playerPanelY - 95),
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
    return {
        x:
            canvasWidth -
            (ACTION_BAR_INNER_OFFSET + ACTION_BAR_BUTTON_SPACING * 5) -
            ACTION_BAR_RIGHT_OFFSET,
        y: canvasHeight - ACTION_BAR_BOTTOM,
    };
}

type HandPositionInput = {
    canvasHeight: number;
    handHeight: number;
};

export function computeHandPosition({ canvasHeight, handHeight }: HandPositionInput) {
    return {
        x: HUD_PADDING,
        y: canvasHeight - handHeight - 30,
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
        x: HUD_PADDING,
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
    const fallbackX = canvasWidth - HUD_PADDING - diceWidth;
    const fallbackY = actionBarTop - HUD_GAP - diceHeight;

    let x = fallbackX;
    let y = fallbackY;

    if (playerPanel) {
        // Prefer placing dice to the left of the player panel to avoid overlap.
        x = Math.min(fallbackX, playerPanel.x - HUD_GAP - diceWidth);

        // Keep dice near lower HUD area while staying above action bar.
        const panelAlignedY = playerPanel.y + playerPanel.height - diceHeight - 6;
        y = Math.min(fallbackY, panelAlignedY);
    }

    x = Math.max(HUD_PADDING, x);
    y = Math.max(HUD_PADDING, Math.min(canvasHeight - HUD_PADDING - diceHeight, y));

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
    return {
        x: canvasWidth - 40 - 100,
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
        x: canvasWidth - HUD_PADDING,
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
        x: canvasWidth - HUD_PADDING,
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
