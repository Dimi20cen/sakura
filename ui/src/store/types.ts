import { IAdvancedSettings, IGameSettings, LobbyPlayerState } from "../../tsg";
import { SOCKET_STATE } from "../sock";

export type LobbyState = {
    players: LobbyPlayerState[];
    maxPlayers: number;
    started: boolean;
    order: number;
    ready: boolean;
    canStart: boolean;
    settings: IGameSettings;
    advanced: IAdvancedSettings;
    settingsOptions?: {
        MapName: string[];
    };
    chatMessages: { id: number; msg: string }[];
};

export type LobbyConnectionState = {
    socketState: SOCKET_STATE;
    gameExists: boolean | null;
    gameServer: string;
    lastError?: string;
    disconnectedMessage?: string;
};

export type LobbyStoreState = {
    lobby: LobbyState;
    connection: LobbyConnectionState;
};
