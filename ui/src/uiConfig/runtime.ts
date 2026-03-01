import { mergeConfig } from "./merge.ts";
import { presetOverrides } from "./presets.ts";
import { bottomDockConfig } from "./sections/bottomDock.ts";
import { canvasConfig } from "./sections/canvas.ts";
import { controlsConfig } from "./sections/controls.ts";
import { handConfig } from "./sections/hand.ts";
import { hudConfig } from "./sections/hud.ts";
import { overlaysConfig } from "./sections/overlays.ts";
import { settingsPanelConfig } from "./sections/settings.ts";
import { tradeConfig } from "./sections/trade.ts";
import { windowsConfig } from "./sections/windows.ts";
import type { DeepPartial, UIConfig, UIPresetName } from "./types.ts";

export const defaultUIConfig: UIConfig = {
    canvas: canvasConfig,
    controls: controlsConfig,
    hud: hudConfig,
    windows: windowsConfig,
    bottomDock: bottomDockConfig,
    overlays: overlaysConfig,
    trade: tradeConfig,
    settingsPanel: settingsPanelConfig,
    hand: handConfig,
};

let activeUIConfig: UIConfig = structuredClone(defaultUIConfig);

export function initializeUIConfig(options?: {
    preset?: UIPresetName;
    overrides?: DeepPartial<UIConfig>;
}) {
    const preset = options?.preset ?? "default";
    activeUIConfig = mergeConfig(
        mergeConfig(defaultUIConfig, presetOverrides[preset]),
        options?.overrides ?? {},
    );
    return activeUIConfig;
}

export function getUIConfig() {
    return activeUIConfig;
}

export function resetUIConfig() {
    activeUIConfig = structuredClone(defaultUIConfig);
    return activeUIConfig;
}

export function getAvailableUIPresets(): UIPresetName[] {
    return Object.keys(presetOverrides) as UIPresetName[];
}
