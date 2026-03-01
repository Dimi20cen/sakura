import { getUIConfig } from "../runtime.ts";

export function getWindowsConfig() {
    return getUIConfig().windows;
}

export function getYesNoWindowConfig() {
    return getWindowsConfig().yesNo;
}

export function getTooltipConfig() {
    return getWindowsConfig().tooltip;
}

export function getErrorModalConfig() {
    return getWindowsConfig().errorModal;
}
