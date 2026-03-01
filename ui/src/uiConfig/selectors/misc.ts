import { getUIConfig } from "../runtime.ts";

export function getHandConfig() {
    return getUIConfig().hand;
}

export function getSettingsPanelConfig() {
    return getUIConfig().settingsPanel;
}
