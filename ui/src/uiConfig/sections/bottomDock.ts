import type { UIConfig } from "../types.ts";

export const bottomDockConfig: UIConfig["bottomDock"] = {
    shell: {
        fill: 0x8b5727,
        border: 0x5b3318,
        borderWidth: 3,
        radius: 18,
        glossFill: 0xffe1a8,
        glossAlpha: 0.14,
    },
    slot: {
        fill: 0x6a3e1c,
        border: 0x5a341a,
        borderWidth: 2,
        radius: 14,
        glossFill: 0xffe1a8,
        glossAlpha: 0.1,
        activeFill: 0x69b84c,
        activeBorder: 0x0d5f2d,
    },
    rail: {
        fill: 0x10bfd0,
        radius: 14,
        dividerFill: 0x0f79c8,
    },
    chip: {
        fill: 0x064dd1,
        border: 0xffffff,
        text: 0xffffff,
        radius: 4,
    },
    timer: {
        fill: 0xf1ead7,
        border: 0x0b6c8c,
        stripFill: 0x17b6cf,
        text: 0x5a341a,
        subtext: 0x0b6c8c,
    },
};
