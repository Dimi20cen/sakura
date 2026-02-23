import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SOCKET_STATE } from "../sock";
import { LobbyConnectionState } from "./types";

const initialState: LobbyConnectionState = {
    socketState: SOCKET_STATE.INIT,
    gameExists: null,
    gameServer: "",
};

const connectionSlice = createSlice({
    name: "connection",
    initialState,
    reducers: {
        setSocketState(state, action: PayloadAction<SOCKET_STATE>) {
            state.socketState = action.payload;
        },
        setServer(
            state,
            action: PayloadAction<{ gameExists: boolean | null; gameServer: string }>,
        ) {
            state.gameExists = action.payload.gameExists;
            state.gameServer = action.payload.gameServer;
        },
        setLobbyError(state, action: PayloadAction<string>) {
            state.lastError = action.payload;
        },
        setLobbyDisconnected(state, action: PayloadAction<string>) {
            state.disconnectedMessage = action.payload;
        },
        clearLobbyConnectionMessages(state) {
            state.lastError = undefined;
            state.disconnectedMessage = undefined;
        },
        resetConnection() {
            return initialState;
        },
    },
});

export const {
    setSocketState,
    setServer,
    setLobbyError,
    setLobbyDisconnected,
    clearLobbyConnectionMessages,
    resetConnection,
} =
    connectionSlice.actions;

export default connectionSlice.reducer;
