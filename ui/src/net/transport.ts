import { decode } from "@msgpack/msgpack";
import ReconnectingWebSocket from "reconnecting-websocket";
import { MutableRefObject } from "react";
import { WsMessage, WsResponse, sendMessage } from "../sock";

export type TransportCallbacks = {
    onOpen?: () => void;
    onError?: (ev: any) => void;
    onClose?: (ev: any) => void;
    onMessage?: (msg: WsResponse) => void;
};

export type TransportClient = {
    connect: () => void;
    disconnect: (code?: number, reason?: string) => void;
    send: (message: WsMessage) => void;
    socketRef: MutableRefObject<ReconnectingWebSocket | null>;
};

export function createTransportClient(
    url: string,
    callbacks: TransportCallbacks,
): TransportClient {
    const socketRef: MutableRefObject<ReconnectingWebSocket | null> = {
        current: null,
    };

    return {
        connect: () => {
            if (socketRef.current) {
                return;
            }

            const ws = new ReconnectingWebSocket(url, [], {
                connectionTimeout: 3000,
                maxRetries: 20,
                minReconnectionDelay: 100,
                maxReconnectionDelay: 2000,
            });

            ws.addEventListener("open", () => callbacks.onOpen?.());
            ws.addEventListener("error", (ev) => callbacks.onError?.(ev));
            ws.addEventListener("close", (ev) => callbacks.onClose?.(ev));
            ws.addEventListener("message", (event) => {
                event.data
                    .arrayBuffer()
                    .then((buf: ArrayBuffer) => {
                        callbacks.onMessage?.(decode(buf) as WsResponse);
                    })
                    .catch((err: unknown) => {
                        console.error("Failed to decode websocket message", err);
                    });
            });

            socketRef.current = ws;
        },
        disconnect: (code = 3001, reason = "Client disconnected") => {
            const ws = socketRef.current;
            if (!ws) return;

            if (
                ws.readyState === WebSocket.OPEN ||
                ws.readyState === WebSocket.CONNECTING
            ) {
                ws.close(code, reason);
            }

            socketRef.current = null;
        },
        send: (message: WsMessage) => {
            const ws = socketRef.current;
            if (!ws) return;
            sendMessage(ws, message);
        },
        socketRef,
    };
}
