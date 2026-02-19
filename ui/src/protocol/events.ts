import { MSG_LOCATION_TYPE, MSG_RES_TYPE, WsResponse } from "../sock";

export type LobbyDomainEvent = {
    kind: "lobby";
    payload: {
        t: MSG_RES_TYPE;
        data: any;
    };
};

export type GameDomainEvent = {
    kind: "game";
    payload: WsResponse;
};

export type SessionDomainEvent = {
    kind: "session";
    payload: {
        type: "error" | "end";
        message: string;
    };
};

export type UnknownDomainEvent = {
    kind: "unknown";
    payload: WsResponse;
};

export type DomainEvent =
    | LobbyDomainEvent
    | GameDomainEvent
    | SessionDomainEvent
    | UnknownDomainEvent;

export function isLobbyMessage(msg: WsResponse) {
    return msg.l === MSG_LOCATION_TYPE.LOBBY;
}
