import { ensureHUDRelayoutHooks, relayoutHUD } from "./hudRelayout";
import ReconnectingWebSocket from "reconnecting-websocket";
import CommandHub from "./commands";

let commandHub: CommandHub;
let thisPlayerOrder: number;
let receiving = false;

export function setGameWsReceiving(val: boolean) {
    receiving = val;
}

export function isGameWsReceiving() {
    return receiving;
}

export function getCommandHub(): CommandHub {
    return commandHub;
}

export function getThisPlayerOrder(): number {
    return thisPlayerOrder;
}

export function isSpectator() {
    return thisPlayerOrder > 200;
}

/** Initialize the command hub */
export function initialize(socket: ReconnectingWebSocket, order: number) {
    commandHub = new CommandHub(socket);
    thisPlayerOrder = order;
    ensureHUDRelayoutHooks();
    relayoutHUD();
}
