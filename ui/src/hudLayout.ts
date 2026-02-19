type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const HUD_PADDING = 20;
const HUD_GAP = 12;

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
