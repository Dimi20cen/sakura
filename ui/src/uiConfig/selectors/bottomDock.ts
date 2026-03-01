import { getUIConfig } from "../runtime.ts";

export function getBottomDockConfig() {
    return getUIConfig().bottomDock;
}
