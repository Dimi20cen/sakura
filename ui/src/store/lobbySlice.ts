import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { IAdvancedSettings, IGameSettings, LobbyPlayerState } from "../../tsg";
import { MSG_RES_TYPE } from "../sock";
import { LobbyState } from "./types";

export enum GAME_MODE {
    Base = 1,
    CitiesAndKnights = 2,
}

export const getInitialLobbyState = (): LobbyState => ({
    players: [],
    maxPlayers: 4,
    started: false,
    order: -1,
    settings: {
        Mode: GAME_MODE.Base,
        Private: false,
        MapName: "Base",
        DiscardLimit: 0,
        VictoryPoints: 0,
        SpecialBuild: false,
        MaxPlayers: 4,
        EnableKarma: true,
        Speed: "normal",
        Advanced: false,
    },
    advanced: {
        RerollOn7: false,
    },
    ready: false,
    canStart: false,
    chatMessages: [],
});

function getOrderFromToken(players: LobbyPlayerState[], fallback: number) {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("auth") : null;
    if (!token) return fallback;

    try {
        const decoded = jwtDecode(token) as { username?: string };
        const mine = players.find((p) => p.Username === decoded.username);
        return mine?.Order ?? fallback;
    } catch {
        return fallback;
    }
}

const lobbySlice = createSlice({
    name: "lobby",
    initialState: getInitialLobbyState(),
    reducers: {
        setSettings(state, action: PayloadAction<IGameSettings>) {
            state.settings = action.payload;
        },
        setAdvanced(state, action: PayloadAction<IAdvancedSettings>) {
            state.advanced = action.payload;
        },
        applyWsMessage(
            state,
            action: PayloadAction<{ t: MSG_RES_TYPE; data: any }>,
        ) {
            const ws = action.payload;
            switch (ws.t) {
                case MSG_RES_TYPE.LOBBY_PLAYERS: {
                    const players: LobbyPlayerState[] = ws.data.map(
                        (p: any) => new LobbyPlayerState(p),
                    );
                    const order = getOrderFromToken(players, state.order);

                    state.players = players;
                    state.order = order;
                    state.ready =
                        players.find((p) => p.Order === order)?.Ready ?? false;
                    state.canStart = players.every((p) => p.Ready);
                    return;
                }
                case MSG_RES_TYPE.LOBBY_GAME_STARTED:
                    state.started = true;
                    state.order = ws.data;
                    return;

                case MSG_RES_TYPE.LOBBY_SETTINGS:
                    state.settings = ws.data;
                    return;

                case MSG_RES_TYPE.LOBBY_ADVANCED_SETTINGS:
                    state.advanced = ws.data;
                    return;

                case MSG_RES_TYPE.LOBBY_SETTINGS_OPTIONS:
                    state.settingsOptions = ws.data;
                    return;

                case MSG_RES_TYPE.CHAT: {
                    const text = ws.data.text;
                    const last = state.chatMessages[state.chatMessages.length - 1];
                    if (last?.msg !== text) {
                        state.chatMessages.push({
                            id: state.chatMessages.length,
                            msg: text,
                        });
                    }
                    return;
                }

                default:
                    return;
            }
        },
    },
});

export const { setSettings, setAdvanced, applyWsMessage } = lobbySlice.actions;
export default lobbySlice.reducer;
