import { IAdvancedSettings, IGameSettings } from "../../tsg";
import { TransportClient } from "../net/transport";
import { MSG_LOCATION_TYPE, MSG_TYPE } from "../sock";

export function createLobbyCommands(transport: TransportClient) {
    return {
        initLobby: () => {
            transport.send({
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.INIT,
            });
        },
        setSettings: (settings: IGameSettings) => {
            transport.send({
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.SET_SETTINGS,
                settings,
            });
        },
        setAdvancedSettings: (advanced: IAdvancedSettings) => {
            transport.send({
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.SET_ADVANCED_SETTINGS,
                advanced,
            });
        },
        addBot: () => {
            transport.send({
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.BOT_ADD,
            });
        },
        setReady: (ready: boolean) => {
            transport.send({
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.READY,
                ready,
            });
        },
        startGame: () => {
            transport.send({
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.START_GAME,
            });
        },
        sendChat: (message: string) => {
            transport.send({
                l: MSG_LOCATION_TYPE.CHAT,
                t: MSG_TYPE.CHAT,
                cmsg: message,
            });
        },
        kickUser: (username: string) => {
            transport.send({
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.KICK,
                username,
            });
        },
        startSinglePlayer: () => {
            transport.send({
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.SINGLE_PLAYER,
            });
        },
    };
}

export type LobbyCommands = ReturnType<typeof createLobbyCommands>;
