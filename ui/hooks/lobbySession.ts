import { useEffect, useMemo, useRef } from "react";
import { useAnonymousAuth } from "./auth";
import { useGameServer } from "./gameServer";
import { createTransportClient, TransportClient } from "../src/net/transport";
import { adaptWsResponse } from "../src/protocol/adapter";
import { useAppDispatch, useAppSelector } from "../src/store/hooks";
import { SOCKET_STATE } from "../src/sock";
import { createLobbyCommands } from "../src/commands/index";
import { setServer, setSocketState } from "../src/store/connectionSlice";
import { applyWsMessage } from "../src/store/lobbySlice";

export function useLobbySession(gameId: string | undefined) {
    const [token] = useAnonymousAuth();
    const [gameServer, gameExists] = useGameServer(gameId || "");
    const dispatch = useAppDispatch();

    const lobbyState = useAppSelector((state) => state.lobby);
    const socketState = useAppSelector((state) => state.connection.socketState);

    const transportRef = useRef<TransportClient | null>(null);

    useEffect(() => {
        dispatch(setServer({ gameExists, gameServer }));
    }, [dispatch, gameExists, gameServer]);

    useEffect(() => {
        if (!gameId || !token || !gameServer || !gameExists) {
            return;
        }

        const proto = gameServer.includes("https") ? "wss" : "ws";
        const url = `${proto}://${gameServer.replace(
            /^https?\:\/\//i,
            "",
        )}/socket?id=${gameId}&token=${token}`;

        const transport = createTransportClient(url, {
            onOpen: () => {
                dispatch(setSocketState(SOCKET_STATE.OPEN));
                createLobbyCommands(transport).initLobby();
            },
            onError: () => {
                dispatch(setSocketState(SOCKET_STATE.ERROR));
            },
            onClose: () => {
                dispatch(setSocketState(SOCKET_STATE.CLOSE));
            },
            onMessage: (msg) => {
                const event = adaptWsResponse(msg);

                switch (event.kind) {
                    case "lobby":
                        dispatch(applyWsMessage(event.payload));
                        return;
                    case "session":
                        if (event.payload.message.includes("E74")) {
                            window.location.href = "/lobby";
                        }
                        alert(event.payload.message);
                        if (event.payload.type === "end") {
                            transport.disconnect(1000, "Client closed connection");
                        }
                        return;
                    default:
                        console.error("Unhandled websocket payload", event.payload);
                }
            },
        });

        transportRef.current = transport;
        dispatch(setSocketState(SOCKET_STATE.INIT));
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
    }, [dispatch, gameExists, gameId, gameServer, token]);

    const commands = useMemo(() => {
        if (!transportRef.current) {
            return null;
        }
        return createLobbyCommands(transportRef.current);
    }, [socketState]);

    return {
        lobbyState,
        socketState,
        gameExists,
        gameServer,
        commands,
        socketRef: transportRef.current?.socketRef,
        disconnect: () => transportRef.current?.disconnect(),
    };
}
