import { MSG_RES_TYPE, WsResponse } from "../sock";
import { DomainEvent } from "./events";

export function adaptWsResponse(msg: WsResponse): DomainEvent {
    if (msg.t === MSG_RES_TYPE.END_SESS) {
        return {
            kind: "session",
            payload: {
                type: "end",
                message: String(msg.data ?? "Disconnected"),
            },
        };
    }

    if (msg.t === MSG_RES_TYPE.ERROR) {
        return {
            kind: "session",
            payload: {
                type: "error",
                message: String(msg.data ?? "Unknown server error"),
            },
        };
    }

    if (msg.l === "l") {
        return {
            kind: "lobby",
            payload: {
                t: msg.t,
                data: msg.data,
            },
        };
    }

    if (msg.l === "g") {
        return {
            kind: "game",
            payload: msg,
        };
    }

    return {
        kind: "unknown",
        payload: msg,
    };
}
