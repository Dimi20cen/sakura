import { configureStore } from "@reduxjs/toolkit";
import lobbyReducer from "./lobbySlice";
import connectionReducer from "./connectionSlice";
import gameReducer from "./gameSlice";

export const store = configureStore({
    reducer: {
        lobby: lobbyReducer,
        connection: connectionReducer,
        game: gameReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
