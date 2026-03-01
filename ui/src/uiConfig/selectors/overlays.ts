import { getUIConfig } from "../runtime.ts";

export function getOverlayConfig() {
    return getUIConfig().overlays;
}

export function getPendingActionOverlayConfig() {
    return getOverlayConfig().pendingAction;
}
