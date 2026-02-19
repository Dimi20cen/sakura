import { FunctionComponent } from "react";
import { decode } from "@msgpack/msgpack";
import { useRouter } from "next/router";
import useSWR from "swr";
import Error from "next/error";
import { useEffect, useState } from "react";
import { basicFetcher, getIdFromToken } from "../utils";
import { classNames } from "../utils/styles";
import { useAnonymousAuth } from "../hooks/auth";
import { createGame } from "../utils/game";
import { white as spinner } from "./spinner";
import Header from "./header";
import { GameSettings } from "../tsg";
import { DISPLAY_GAME_MODE, GAME_MODE } from "../src/lobby";

const textClass = classNames(
    `px-2 sm:px-6 py-3 tracking-wider text-center text-sm sm:text-lg font-medium`,
    "text-white",
);

type LobbyGame = {
    id: string;
    private: boolean;
    server: string;
    stage: number;
    active_players: number;
    players: number;
    host: string;
    settings: string;
    reconnectable?: boolean;
};

const renderGame = (
    games: LobbyGame[],
    selectedGameId: string,
    handleRowClick: (gameId: string) => () => void,
) => {
    return games.map((game: LobbyGame) => {
        if (!game.settings) {
            return null;
        }
        try {
            const { id, settings } = game;
            const gameSettings = new GameSettings(
                decode(Buffer.from(settings, "base64")),
            );
            return (
                <tr
                    key={id}
                    onClick={handleRowClick(id)}
                    className={classNames(
                        "cursor-pointer backdrop-blur-lg border-bottom-2",
                        selectedGameId === id
                            ? "bg-indigo-800 bg-opacity-80"
                            : "bg-black bg-opacity-50",
                    )}
                >
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center text-base sm:text-lg text-white bg-clip-text">
                        {DISPLAY_GAME_MODE[gameSettings.Mode as GAME_MODE]}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center text-base sm:text-lg text-white bg-clip-text">
                        {game.host}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center text-base sm:text-lg text-white bg-clip-text">
                        {[...Array(gameSettings.MaxPlayers)].map(
                            (_, i: number) => (
                                <span
                                    key={i}
                                    className={classNames(
                                        game.active_players > i
                                            ? "text-black opacity-80"
                                            : "text-white",
                                        "text-base mr-1",
                                    )}
                                >
                                    &#x2B24;
                                </span>
                            ),
                        )}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center text-base sm:text-lg text-white bg-clip-text">
                        {gameSettings.MapName}
                    </td>
                </tr>
            );
        } catch {
            return null;
        }
    });
};

const GameList: FunctionComponent = () => {
    const [token] = useAnonymousAuth();
    const { data, error } = useSWR(["/api/games", token ?? null], basicFetcher);
    const { data: sData, error: sError } = useSWR(
        ["/api/games?stage=playing", token ?? null],
        basicFetcher,
    );
    const [selectedGameId, setSelectedGameId] = useState("");
    const [lastGameId, setLastGameId] = useState("");
    const [lastGameProfileId, setLastGameProfileId] = useState("");
    const [currentProfileId, setCurrentProfileId] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            setLastGameId(localStorage.getItem("lastGameId") || "");
            setLastGameProfileId(
                localStorage.getItem("lastGameProfileId") || "",
            );
            setCurrentProfileId(getIdFromToken(localStorage.getItem("auth")) || "");
        }
    }, [token]);

    const handleRowClick = (gameId: string) => () => {
        setSelectedGameId(gameId);
    };

    const allGames: LobbyGame[] = (() => {
        const map = new Map<string, LobbyGame>();
        (data?.games || []).forEach((g: LobbyGame) => map.set(g.id, g));
        (sData?.games || []).forEach((g: LobbyGame) => map.set(g.id, g));
        return Array.from(map.values());
    })();

    const selectedGame = allGames.find((g) => g.id === selectedGameId);

    const canReconnect = (game?: LobbyGame) => {
        if (!game) {
            return false;
        }
        if (game.reconnectable) {
            return true;
        }
        return Boolean(
            game.id === lastGameId &&
                currentProfileId &&
                lastGameProfileId === currentProfileId,
        );
    };

    const getActionLabel = () => {
        if (!selectedGame) {
            return "";
        }
        if (canReconnect(selectedGame)) {
            return "Reconnect";
        }
        return selectedGame.stage === 0 ? "Join" : "Spectate";
    };

    const handleGameAction = () => {
        if (!selectedGameId) {
            alert("Select a game first.");
            return;
        }
        router.push(`/${selectedGameId}`);
    };

    const handleHostGame = async () => {
        const [createData, _] = await createGame(token!);
        if (!createData) {
            return;
        }
        if (createData.error) {
            console.error(createData.error);
            return;
        }
        router.push(`/${createData.id}`);
    };

    if (error || sError) {
        console.error(error);
        console.error(sError);
        return (
            <>
                <Header />
                <Error statusCode={500} />;
            </>
        );
    }
    if (data && data.error) return <Error statusCode={data.status} />;
    if (!data || !sData)
        return (
            <>
                <Header />
                <div className="text-white w-full h-screen flex">
                    {spinner()}
                </div>
            </>
        );

    return (
        <>
            <Header />
            <div className="max-w-7xl min-h-screen mx-auto my-2 sm:my-4 py-2 sm:py-4 px-3 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4">
                    <div className="-my-2 overflow-x-auto basis-full">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-4 lg:px-6">
                            <div className="flex flex-col border-0 border-blue-500 min-h-[10vh] max-h-[80vh]">
                                <div className="flex-grow overflow-auto max-h-[250px] sm:max-h-[270px]">
                                    <table
                                        className="relative min-w-full divide-y-4 divide-transparent border-separate table-auto"
                                        style={{
                                            borderSpacing: "0 3px",
                                        }}
                                    >
                                        <thead className="sticky top-0 bg-black bg-opacity-80 backdrop-blur">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className={classNames(
                                                        textClass,
                                                        "sticky top-0 w-1/4",
                                                    )}
                                                >
                                                    Mode
                                                </th>
                                                <th
                                                    scope="col"
                                                    className={classNames(
                                                        textClass,
                                                        "sticky top-0 w-1/4",
                                                    )}
                                                >
                                                    Host
                                                </th>
                                                <th
                                                    scope="col"
                                                    className={classNames(
                                                        textClass,
                                                        "sticky top-0 w-1/4",
                                                    )}
                                                >
                                                    Players
                                                </th>
                                                <th
                                                    scope="col"
                                                    className={classNames(
                                                        textClass,
                                                        "sticky top-0 w-1/4",
                                                    )}
                                                >
                                                    Map
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="">
                                            {allGames.length > 0 ? (
                                                renderGame(
                                                    allGames,
                                                    selectedGameId,
                                                    handleRowClick,
                                                )
                                            ) : (
                                                <tr className="bg-black bg-opacity-50">
                                                    <td
                                                        colSpan={4}
                                                        className="px-4 py-8 text-center text-white text-base"
                                                    >
                                                        No active games found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    {selectedGame ? (
                        <div className="w-full max-w-xs sm:max-w-sm mx-auto">
                            <button
                                className={classNames(
                                    "h-12 w-full text-lg sm:text-xl rounded-xl",
                                    "bg-green-700 hover:bg-green-900 text-white",
                                )}
                                onClick={handleGameAction}
                            >
                                {getActionLabel()}
                            </button>
                        </div>
                    ) : null}
                    <div className="w-full max-w-xs sm:max-w-sm mx-auto">
                        <button
                            className={classNames(
                                "h-12 w-full text-lg sm:text-xl rounded-xl",
                                "bg-indigo-700 hover:bg-indigo-900 text-white",
                            )}
                            onClick={handleHostGame}
                        >
                            Host Game
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GameList;
