import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MSG_RES_TYPE, SOCKET_STATE, WsResponse } from "../sock";

export type GameRuntimeState = {
    socketState: SOCKET_STATE;
    receiving: boolean;
    lastGameStateSeq: number;
    lastMessageType?: MSG_RES_TYPE;
    settings?: any;
    gameState?: any;
    secretState?: any;
    pendingAction?: any;
    tradeOffer?: any;
    spectators: string[];
    lastError?: string;
    disconnectedMessage?: string;
};

const initialState: GameRuntimeState = {
    socketState: SOCKET_STATE.INIT,
    receiving: false,
    lastGameStateSeq: 0,
    spectators: [],
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setGameSocketState(state, action: PayloadAction<SOCKET_STATE>) {
            state.socketState = action.payload;
        },
        resetGameState() {
            return initialState;
        },
        setDisconnectedMessage(state, action: PayloadAction<string>) {
            state.disconnectedMessage = action.payload;
        },
        setGameError(state, action: PayloadAction<string>) {
            state.lastError = action.payload;
        },
        applyGameWsMessage(state, action: PayloadAction<WsResponse>) {
            const msg = action.payload;

            if (msg.t === MSG_RES_TYPE.INIT_SETTINGS) {
                state.receiving = true;
                state.lastGameStateSeq = 0;
            } else if (!state.receiving) {
                return;
            }

            state.lastMessageType = msg.t;

            switch (msg.t) {
                case MSG_RES_TYPE.INIT_SETTINGS:
                    state.settings = msg.data;
                    return;

                case MSG_RES_TYPE.GAME_STATE:
                    const stateSeq = Number(msg.data?.sq || 0);
                    if (stateSeq > 0 && stateSeq <= state.lastGameStateSeq) {
                        return;
                    }
                    if (stateSeq > 0) {
                        state.lastGameStateSeq = stateSeq;
                    }
                    state.gameState = msg.data;
                    return;

                case MSG_RES_TYPE.SECRET_STATE:
                    state.secretState = msg.data;
                    return;

                case MSG_RES_TYPE.ACTION_EXPECTED:
                    state.pendingAction = msg.data;
                    return;

                case MSG_RES_TYPE.TRADE_OFFER:
                    state.tradeOffer = msg.data;
                    return;

                case MSG_RES_TYPE.SPECTATOR_LIST:
                    state.spectators = msg.data;
                    return;

                case MSG_RES_TYPE.ERROR:
                    state.lastError = String(msg.data ?? "Unknown error");
                    return;

                case MSG_RES_TYPE.END_SESS:
                    state.disconnectedMessage = String(
                        msg.data ?? "Disconnected from server",
                    );
                    return;

                default:
                    return;
            }
        },
    },
});

export const {
    setGameSocketState,
    resetGameState,
    setDisconnectedMessage,
    setGameError,
    applyGameWsMessage,
} = gameSlice.actions;

export default gameSlice.reducer;
