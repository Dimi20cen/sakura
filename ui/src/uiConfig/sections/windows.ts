import type { UIConfig } from "../types.ts";

export const windowsConfig: UIConfig["windows"] = {
    borderColor: 0x000000,
    borderWidth: 2,
    fillColor: 0xffffff,
    fillAlpha: 0.9,
    cornerRadius: 4,
    yesNo: {
        width: 42,
        height: 80,
        buttonSize: 32,
        inset: 5,
        gap: 8,
    },
    tooltip: {
        fontSize: 14,
        wordWrapWidth: 200,
        maxWidth: 210,
        padding: 5,
        cardWidth: 32,
        cardGap: 5,
        viewportInset: 5,
        offsetX: 10,
        offsetY: 5,
    },
    errorModal: {
        width: 300,
        height: 300,
        titleFontSize: 28,
        bodyFontSize: 16,
        bodyWidth: 260,
        closeButtonSize: 40,
    },
};
