import { getUIConfig } from "../runtime.ts";

export function getCanvasConfig() {
    return getUIConfig().canvas;
}
