import { getUIConfig } from "../runtime.ts";

export function getHudConfig() {
    return getUIConfig().hud;
}

export function getPlayerPanelConfig() {
    return getHudConfig().playerPanel;
}

export function getGameLogConfig() {
    return getHudConfig().gameLog;
}

export function getChatConfig() {
    return getHudConfig().chat;
}

export function getResourceBankConfig() {
    return getHudConfig().resourceBank;
}

export function getBottomRailConfig() {
    return getHudConfig().bottomRail;
}

export function getActionBarConfig() {
    return getHudConfig().actionBar;
}

export function getDiceConfig() {
    return getHudConfig().dice;
}

export function getHudMiscConfig() {
    return getHudConfig().misc;
}
