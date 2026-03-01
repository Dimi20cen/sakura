import type { UITokens } from "./types.ts";

export const defaultTokens: UITokens = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 18,
    },
    radius: {
        sm: 4,
        md: 10,
        lg: 18,
    },
    chrome: {
        panelBorder: 0x000000,
        panelFill: 0xffffff,
        panelFillAlpha: 0.9,
    },
    dock: {
        shellFill: 0x8b5727,
        shellBorder: 0x5b3318,
        shellGloss: 0xffe1a8,
        slotFill: 0x6a3e1c,
        slotBorder: 0x5a341a,
        slotActiveFill: 0x69b84c,
        slotActiveBorder: 0x0d5f2d,
        railFill: 0x10bfd0,
        railDivider: 0x0f79c8,
        chipFill: 0x064dd1,
        chipBorder: 0xffffff,
        chipText: 0xffffff,
        timerFill: 0xf1ead7,
        timerBorder: 0x0b6c8c,
        timerStrip: 0x17b6cf,
        timerText: 0x5a341a,
        timerSubtext: 0x0b6c8c,
    },
};
