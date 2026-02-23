import { decode } from "@msgpack/msgpack";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import Error from "next/error";
import { useRouter } from "next/router";
import useSWR from "swr";
import { GameSettings } from "../tsg";
import { DISPLAY_GAME_MODE, GAME_MODE } from "../src/lobby";
import { useAnonymousAuth } from "../hooks/auth";
import { basicFetcher, getIdFromToken } from "../utils";
import { createGame } from "../utils/game";
import { classNames } from "../utils/styles";
import Header from "./header";
import { white as spinner } from "./spinner";

const textClass = classNames(
    "px-3 sm:px-6 py-3 text-center text-xs sm:text-sm uppercase tracking-[0.08em] font-semibold text-[color:var(--ui-ivory-soft)]",
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

type ParsedLobbyGame = LobbyGame & {
    parsedSettings: GameSettings;
};

const parseGameSettings = (settings: string): GameSettings | null => {
    try {
        return new GameSettings(decode(Buffer.from(settings, "base64")));
    } catch {
        return null;
    }
};

const renderGame = (
    games: ParsedLobbyGame[],
    selectedGameId: string,
    handleRowClick: (gameId: string) => () => void,
) => {
    return games.map((game) => {
        const { id, parsedSettings } = game;
        return (
            <tr
                key={id}
                onClick={handleRowClick(id)}
                className={classNames(
                    "cursor-pointer ui-panel",
                    selectedGameId === id
                        ? "bg-[rgba(122,31,36,0.62)] border-[rgba(183,148,90,0.55)] shadow-[0_8px_20px_rgba(122,31,36,0.35)]"
                        : "bg-[rgba(38,31,28,0.78)] border-[rgba(231,222,206,0.12)]",
                )}
            >
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center text-sm sm:text-base text-[color:var(--ui-ivory)]">
                    {DISPLAY_GAME_MODE[parsedSettings.Mode as GAME_MODE]}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center text-sm sm:text-base text-[color:var(--ui-ivory)]">
                    {game.host}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center text-sm sm:text-base text-[color:var(--ui-ivory)]">
                    {[...Array(parsedSettings.MaxPlayers)].map((_, i: number) => (
                        <span
                            key={i}
                            className={classNames(
                                game.active_players > i
                                    ? "text-[color:var(--ui-gold-soft)]"
                                    : "text-[rgba(244,239,228,0.45)]",
                                "text-sm mr-1",
                            )}
                        >
                            &#x2B24;
                        </span>
                    ))}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center text-sm sm:text-base text-[color:var(--ui-ivory)]">
                    {parsedSettings.MapName}
                </td>
            </tr>
        );
    });
};

const renderGameCards = (
    games: ParsedLobbyGame[],
    selectedGameId: string,
    handleRowClick: (gameId: string) => () => void,
) => {
    return games.map((game) => {
        const { id, parsedSettings } = game;
        return (
            <button
                key={id}
                onClick={handleRowClick(id)}
                className={classNames(
                    "ui-panel w-full rounded-xl border px-4 py-3 text-left transition-colors duration-200",
                    selectedGameId === id
                        ? "bg-[rgba(122,31,36,0.62)] border-[rgba(183,148,90,0.55)]"
                        : "bg-[rgba(38,31,28,0.78)] border-[rgba(231,222,206,0.12)]",
                )}
            >
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[color:var(--ui-ivory)] font-semibold">
                        {DISPLAY_GAME_MODE[parsedSettings.Mode as GAME_MODE]}
                    </span>
                    <span className="text-[color:var(--ui-ivory-soft)]">
                        {parsedSettings.MapName}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-[color:var(--ui-ivory-soft)]">
                        Host: {game.host}
                    </span>
                    <span className="text-[color:var(--ui-ivory)]">
                        {[...Array(parsedSettings.MaxPlayers)].map((_, i: number) => (
                            <span
                                key={i}
                                className={classNames(
                                    game.active_players > i
                                        ? "text-[color:var(--ui-gold-soft)]"
                                        : "text-[rgba(244,239,228,0.45)]",
                                    "text-sm mr-1",
                                )}
                            >
                                &#x2B24;
                            </span>
                        ))}
                    </span>
                </div>
            </button>
        );
    });
};

const GameList: FunctionComponent = () => {
    const [token] = useAnonymousAuth();
    const { data, error } = useSWR(
        token ? ["/api/games", token] : null,
        basicFetcher,
    );
    const [selectedGameId, setSelectedGameId] = useState("");
    const [lastGameId, setLastGameId] = useState("");
    const [lastGameProfileId, setLastGameProfileId] = useState("");
    const [currentProfileId, setCurrentProfileId] = useState("");
    const [actionError, setActionError] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            setLastGameId(localStorage.getItem("lastGameId") || "");
            setLastGameProfileId(localStorage.getItem("lastGameProfileId") || "");
            setCurrentProfileId(getIdFromToken(localStorage.getItem("auth")) || "");
        }
    }, [token]);

    const handleRowClick = (gameId: string) => () => {
        setActionError("");
        setSelectedGameId(gameId);
    };

    const allGames = useMemo<ParsedLobbyGame[]>(() => {
        const rawGames = Array.isArray(data?.games) ? (data.games as LobbyGame[]) : [];
        return rawGames
            .map((g) => {
                const parsedSettings = g.settings ? parseGameSettings(g.settings) : null;
                if (!parsedSettings) {
                    return null;
                }
                return {
                    ...g,
                    parsedSettings,
                };
            })
            .filter((g): g is ParsedLobbyGame => Boolean(g));
    }, [data?.games]);

    const selectedGame = useMemo(
        () => allGames.find((g) => g.id === selectedGameId),
        [allGames, selectedGameId],
    );

    const canReconnect = (game?: ParsedLobbyGame) => {
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
            setActionError("Select a game first.");
            return;
        }
        setActionError("");
        router.push(`/${selectedGameId}`);
    };

    const handleHostGame = async () => {
        setActionError("");
        if (!token) {
            setActionError("Authentication is still loading. Try again in a second.");
            return;
        }

        const [createData] = await createGame(token);
        if (!createData) {
            return;
        }
        if (createData.error) {
            setActionError(createData.error);
            return;
        }
        router.push(`/${createData.id}`);
    };

    if (error) {
        console.error(error);
        return (
            <>
                <Header />
                <Error statusCode={500} />
            </>
        );
    }
    if (data && data.error) {
        return <Error statusCode={data.status} />;
    }
    if (!token || !data) {
        return (
            <>
                <Header />
                <div className="text-[color:var(--ui-ivory)] w-full h-screen flex">
                    {spinner()}
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="ui-page ui-fade-in">
                <div className="ui-grid gap-4 mt-4 sm:mt-6">
                    <section className="ui-panel ui-panel-pad">
                        <div className="mb-3 sm:mb-4">
                            <h1 className="ui-title ui-title-lg">Lobby</h1>
                            <p className="ui-text-muted">
                                Select an active match to join, reconnect, or spectate.
                            </p>
                        </div>
                        <div className="-mx-2 px-2">
                            <div className="sm:hidden space-y-2 max-h-[360px] overflow-auto">
                                {allGames.length > 0 ? (
                                    renderGameCards(
                                        allGames,
                                        selectedGameId,
                                        handleRowClick,
                                    )
                                ) : (
                                    <div className="ui-panel rounded-xl border border-[rgba(231,222,206,0.12)] px-4 py-6 text-center text-[color:var(--ui-ivory-soft)] text-sm">
                                        No active games found.
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col min-h-[10vh] max-h-[70vh]">
                                <div className="flex-grow overflow-auto max-h-[320px]">
                                    <table className="ui-data-table">
                                        <thead>
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
                                        <tbody>
                                            {allGames.length > 0 ? (
                                                renderGame(
                                                    allGames,
                                                    selectedGameId,
                                                    handleRowClick,
                                                )
                                            ) : (
                                                <tr className="ui-panel">
                                                    <td
                                                        colSpan={4}
                                                        className="px-4 py-8 text-center text-[color:var(--ui-ivory-soft)] text-sm"
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
                    </section>
                    {selectedGame ? (
                        <div className="w-full max-w-xs sm:max-w-sm mx-auto ui-fade-in">
                            <button
                                className={classNames("ui-button ui-button-primary")}
                                onClick={handleGameAction}
                            >
                                {getActionLabel()}
                            </button>
                        </div>
                    ) : null}
                    <div className="w-full max-w-xs sm:max-w-sm mx-auto">
                        <button
                            className={classNames("ui-button ui-button-secondary")}
                            onClick={handleHostGame}
                        >
                            Create Room
                        </button>
                    </div>
                    {actionError ? (
                        <div className="w-full max-w-lg mx-auto rounded-md border border-[rgba(242,180,185,0.4)] bg-[rgba(122,31,36,0.4)] px-3 py-2 text-sm text-[#f2b4b9]">
                            {actionError}
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
};

export default GameList;
