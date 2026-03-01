import { getUIConfig } from "../runtime.ts";

export function getTradeConfig() {
    return getUIConfig().trade;
}

export function getTradeEditorConfig() {
    return getTradeConfig().editor;
}

export function getTradeOffersConfig() {
    return getTradeConfig().offers;
}
