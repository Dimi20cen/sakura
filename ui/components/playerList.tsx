import { FunctionComponent, MutableRefObject } from "react";
import { LobbyState } from "../src/store/types";
import { hexToUrlString } from "../utils";
import { classNames, playerColors } from "../utils/styles";
import ReconnectingWebSocket from "reconnecting-websocket";
import { PencilSquareIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { UsernameChangeModal } from "./UsernameChangeModal";
import {
    MSG_LOCATION_TYPE,
    MSG_TYPE,
    sendMessage,
    WsMessage,
} from "../src/sock";
import botImage from "../public/assets/bot.png";

const playerRowClass = (self: boolean, ready: boolean) => {
    let base =
        "relative mb-3 rounded-xl border flex text-[color:var(--ui-ivory)] px-4 py-4 transition-colors duration-200";

    if (self) {
        base += " font-bold";
        if (ready) {
            base +=
                " bg-[rgba(54,101,66,0.62)] border-[rgba(183,148,90,0.45)]";
        } else {
            base +=
                " bg-[rgba(122,31,36,0.65)] border-[rgba(183,148,90,0.52)]";
        }
        return base;
    }

    if (ready) {
        base +=
            " bg-[rgba(49,71,54,0.62)] border-[rgba(231,222,206,0.18)]";
    } else {
        base +=
            " bg-[rgba(54,35,36,0.72)] border-[rgba(231,222,206,0.18)]";
    }

    return base;
};

const PlayerList: FunctionComponent<{
    lobbyState: LobbyState;
    socket?: MutableRefObject<ReconnectingWebSocket | null>;
}> = ({ lobbyState, socket }) => {
    const usernameModal = UsernameChangeModal(socket);

    const kickUser = (username: string) => {
        if (socket?.current != null) {
            const msg: WsMessage = {
                l: MSG_LOCATION_TYPE.LOBBY,
                t: MSG_TYPE.KICK,
                username: username,
            };
            sendMessage(socket.current, msg);
        }
    };

    return (
        <div className="grid">
            {usernameModal.component}

            {lobbyState.players.map((player) => (
                <div
                    key={player.Order}
                    className={playerRowClass(
                        player.Order === lobbyState.order,
                        player.Ready,
                    )}
                >
                    <div
                        className={classNames(
                            "flex-shrink-0 rounded-full h-8 w-8 m-auto ring-1 ring-[rgba(231,222,206,0.4)]",
                            playerColors[hexToUrlString(player.Color)],
                        )}
                    >
                        {player.Username.endsWith("*") && (
                            <img src={botImage.src} />
                        )}
                    </div>
                    <div className="flex-col pl-4 text-left items-center w-full">
                        <span className="align-middle inline-block mr-2">
                            <p>{player.Username}</p>
                            <p className="font-normal text-xs text-[color:var(--ui-ivory-soft)]">
                                {player.GamesFinished}/{player.GamesStarted}
                            </p>
                        </span>

                        {player.Order === lobbyState.order ? (
                            <div className="align-middle inline-block float-right mx-1 mt-2">
                                <button onClick={usernameModal.openModal}>
                                    <PencilSquareIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ) : (
                            lobbyState.order === 0 && (
                                <div className="align-middle inline-block float-right mx-1 mt-2">
                                    <button
                                        onClick={() =>
                                            kickUser(player.Username)
                                        }
                                    >
                                        <XCircleIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            )
                        )}

                        <p className={classNames("text-sm truncate")}></p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlayerList;
