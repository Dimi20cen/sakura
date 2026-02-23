import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAnonymousAuth } from "./auth";
import { useGameServer } from "./gameServer";
import { createTransportClient, TransportClient } from "../src/net/transport";
import { adaptWsResponse } from "../src/protocol/adapter";
import { MSG_LOCATION_TYPE, MSG_TYPE, SOCKET_STATE } from "../src/sock";
import { useAppDispatch, useAppSelector } from "../src/store/hooks";
import {
    applyGameWsMessage,
    resetGameState,
    setDisconnectedMessage,
    setGameError,
    setGameSocketState,
} from "../src/store/gameSlice";
import { initialize, setGameWsReceiving } from "../src/ws";
import {
    handleGameRuntimeMessage,
    isHandledByGameRuntime,
} from "../src/store/gameRuntime";
import * as gameLog from "../src/gameLog";
import { showErrorWindow } from "../src/windows";

export function useGameSession(gameId: string, order: number) {
    const [token] = useAnonymousAuth();
    const [gameServer, gameExists] = useGameServer(gameId || "");
    const [init, setInit] = useState(false);
    const router = useRouter();

    const dispatch = useAppDispatch();
    const socketState = useAppSelector((state) => state.game.socketState);
    const transportRef = useRef<TransportClient | null>(null);

    useEffect(() => {
        if (!gameId || !token || !init || !gameServer || !gameExists) {
            return;
        }

        const proto = gameServer.includes("https") ? "wss" : "ws";
        const url = `${proto}://${gameServer.replace(
            /^https?\:\/\//i,
            "",
        )}/socket?id=${gameId}&token=${token}`;

        const transport = createTransportClient(url, {
            onOpen: () => {
                dispatch(setGameSocketState(SOCKET_STATE.OPEN));
                setGameWsReceiving(false);

                const ws = transport.socketRef.current;
                if (ws) {
                    initialize(ws, order);
                    transport.send({
                        l: MSG_LOCATION_TYPE.GAME,
                        t: MSG_TYPE.INIT,
                    });
                }
            },
            onError: () => {
                dispatch(setGameSocketState(SOCKET_STATE.ERROR));
            },
            onClose: () => {
                dispatch(setGameSocketState(SOCKET_STATE.CLOSE));
            },
            onMessage: (msg) => {
                const event = adaptWsResponse(msg);
                switch (event.kind) {
                    case "game":
                        dispatch(applyGameWsMessage(event.payload));
                        if (isHandledByGameRuntime(event.payload)) {
                            handleGameRuntimeMessage(event.payload);
                        } else {
                            console.error(
                                "Unhandled game websocket payload",
                                event.payload,
                            );
                        }
                        return;
                    case "session":
                        if (event.payload.type === "error") {
                            dispatch(setGameError(event.payload.message));
                            gameLog.logNotice(`Notice: ${event.payload.message}`);
                            showErrorWindow("Error", event.payload.message);
                        } else {
                            dispatch(setDisconnectedMessage(event.payload.message));
                            if (
                                event.payload.message
                                    .toLowerCase()
                                    .includes("inactive")
                            ) {
                                gameLog.logNotice(
                                    `Inactivity: ${event.payload.message}`,
                                );
                            } else {
                                gameLog.logNotice(
                                    `Disconnected: ${event.payload.message}`,
                                );
                            }
                            showErrorWindow("Disconnected", event.payload.message);
                            transport.disconnect(1000, "Client closed connection");
                        }

                        if (event.payload.message.includes("E74")) {
                            router.replace("/lobby");
                        }
                        return;
                    default:
                        console.error("Unhandled game websocket payload", event.payload);
                }
            },
        });

        transportRef.current = transport;
        dispatch(resetGameState());
        dispatch(setGameSocketState(SOCKET_STATE.INIT));
        transport.connect();

        const handleUnload = () => {
            transport.disconnect();
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            transport.disconnect();
            transportRef.current = null;
        };
    }, [dispatch, gameExists, gameId, gameServer, init, order, router, token]);

    const controls = useMemo(
        () => ({
            setInit,
            disconnect: () => transportRef.current?.disconnect(),
        }),
        [],
    );

    return {
        socketState,
        gameExists,
        ...controls,
    };
}
