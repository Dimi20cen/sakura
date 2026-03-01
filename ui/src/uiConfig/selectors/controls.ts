import { getUIConfig } from "../runtime.ts";

export function getControlsConfig() {
    return getUIConfig().controls;
}

export function getFullscreenButtonConfig() {
    return getControlsConfig().fullscreenButton;
}

export function getSettingsButtonConfig() {
    return getControlsConfig().settingsButton;
}

export function getPauseToggleConfig() {
    return getControlsConfig().pauseToggle;
}
