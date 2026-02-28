import {
    ChangeEventHandler,
    FunctionComponent,
    KeyboardEventHandler,
    useEffect,
    useRef,
    useState,
} from "react";
import { classNames } from "../utils/styles";
import { SOCKET_STATE } from "../src/sock";
import { GAME_MODE } from "../src/store/lobbySlice";
import Error from "next/error";
import Pixi from "./pixi";
import PlayerList from "./playerList";
import { white as spinner } from "./spinner";
import { useRouter } from "next/router";
import Header from "./header";
import { IAdvancedSettings, IGameSettings } from "../tsg";
import { getIdFromToken, toggleFullscreen } from "../utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useLobbySession } from "../hooks/lobbySession";
import Image from "next/legacy/image";

const selectClasses =
    "ui-input form-select appearance-none block w-full !h-11 !py-2 !text-[15px] !font-normal";
const labelClasses =
    "block text-[color:var(--ui-ivory-soft)] text-xs uppercase tracking-[0.08em] mb-2";
const settingCardClasses =
    "ui-setting-card rounded-xl";
const valueControlClasses =
    "ui-value-control rounded-lg";
const stepperButtonClasses =
    "ui-stepper-btn p-1.5 rounded-md disabled:opacity-40 transition-colors";
const rangeInputClasses =
    "w-full h-2 rounded-lg appearance-none cursor-pointer accent-[color:var(--ui-gold)] disabled:opacity-40";
const turnTimerOptions = [
    { value: "15s", label: "15s" },
    { value: "30s", label: "30s" },
    { value: "60s", label: "60s" },
    { value: "120s", label: "120s" },
    { value: "240s", label: "240s" },
    { value: "200m", label: "200m" },
];

function normalizeTimerSpeed(speed: string) {
    const normalized = (speed || "").trim().toLowerCase();
    const compact = normalized.replace(/\s+/g, "");
    const aliasMap: Record<string, string> = {
        "12s": "15s",
        "15": "15s",
        "30": "30s",
        "60": "60s",
        "120": "120s",
        "240": "240s",
        fast: "30s",
        normal: "60s",
        slow: "240s",
        "200min": "200m",
        "200 m": "200m",
        "200minutes": "200m",
        veryslow: "200m",
    };
    return aliasMap[compact] || aliasMap[normalized] || normalized;
}

function getDefaultVictoryPointsForSettings(
    mode: number,
    mapName: string,
    fallback: number,
) {
    if (mode === GAME_MODE.Seafarers) {
        switch (mapName) {
            case "Seafarers - Heading for New Shores":
                return 14;
            case "Seafarers - The Four Islands":
                return 13;
            case "Seafarers - Through the Desert":
                return 14;
            default:
                return fallback > 0 ? fallback : 12;
        }
    }

    if (mode === GAME_MODE.CitiesAndKnights) {
        return 13;
    }

    return 10;
}

const Game: FunctionComponent<{ gameId: string }> = ({ gameId }) => {
    const router = useRouter();
    const chatDiv = useRef<HTMLDivElement | null>(null);
    const {
        lobbyState,
        socketState,
        gameExists,
        lobbyError,
        disconnectedMessage,
        commands,
        socketRef,
        disconnect,
    } = useLobbySession(gameId);

    useEffect(() => {
        if (chatDiv.current) {
            chatDiv.current.scrollTop = chatDiv.current.scrollHeight;
        }
    }, [lobbyState.chatMessages.length]);

    useEffect(() => {
        if (typeof window !== "undefined" && gameId) {
            localStorage.setItem("lastGameId", gameId);
            const profileId = getIdFromToken(localStorage.getItem("auth"));
            if (profileId) {
                localStorage.setItem("lastGameProfileId", profileId);
            }
        }
    }, [gameId]);

    useEffect(() => {
        if (router.query.sp && commands) {
            commands.startSinglePlayer();
        }
    }, [commands, router.query.sp]);

    const mapOptions = lobbyState.settingsOptions?.MapName || [];
    const [showTimerInfo, setShowTimerInfo] = useState(false);
    const [showGameOptions, setShowGameOptions] = useState(false);

    const changeMode: ChangeEventHandler<HTMLSelectElement> = (event) => {
        const mode = Number(event.target.value);
        const vpDefault = getDefaultVictoryPointsForSettings(
            mode,
            lobbyState.settings.MapName,
            lobbyState.settings.VictoryPoints,
        );
        sendSettings({
            ...lobbyState.settings,
            Mode: mode,
            VictoryPoints: vpDefault,
        });
    };

    const changeMap = (name: string) => {
        sendSettings({
            ...lobbyState.settings,
            MapName: name,
            VictoryPoints: getDefaultVictoryPointsForSettings(
                lobbyState.settings.Mode,
                name,
                lobbyState.settings.VictoryPoints,
            ),
        });
    };

    const minPlayers = 2;
    const maxPlayersLimit = 6;
    const minDiscardLimit = 5;
    const maxDiscardLimit = 15;
    const minVictoryPoints = 5;
    const maxVictoryPoints = 21;

    const setMaxPlayers = (maxPlayers: number) => {
        sendSettings({
            ...lobbyState.settings,
            MaxPlayers: maxPlayers,
            SpecialBuild: maxPlayers > 4,
        });
    };

    const changeDiscard: ChangeEventHandler<HTMLInputElement> = (event) => {
        sendSettings({
            ...lobbyState.settings,
            DiscardLimit: Number(event.target.value),
        });
    };

    const changeVicP: ChangeEventHandler<HTMLInputElement> = (event) => {
        sendSettings({
            ...lobbyState.settings,
            VictoryPoints: Number(event.target.value),
        });
    };

    const changeSpeed = (nextSpeed: string) => {
        sendSettings({
            ...lobbyState.settings,
            Speed: nextSpeed,
        });
    };

    const normalizedTimerValue = normalizeTimerSpeed(lobbyState.settings.Speed);
    const matchedTimerIndex = turnTimerOptions.findIndex(
        (opt) => opt.value === normalizedTimerValue,
    );
    const timerIndex = matchedTimerIndex >= 0 ? matchedTimerIndex : 2;
    const selectedTimer = turnTimerOptions[timerIndex];

    const sendSettings = (settings: IGameSettings) => {
        commands?.setSettings(settings);
    };

    const sendAdvancedSettings = (advanced: IAdvancedSettings) => {
        commands?.setAdvancedSettings(advanced);
    };

    const botAdd = () => {
        commands?.addBot();
    };

    const changeReady: ChangeEventHandler<HTMLInputElement> = (event) => {
        commands?.setReady(Boolean(event.target.checked));
    };

    const startGame = () => {
        commands?.startGame();
    };

    const sendChat: KeyboardEventHandler<HTMLInputElement> = (event) => {
        let val: string = (event.target as any).value;
        val = val.trim();
        if (event.key.includes("Enter") && val) {
            (event.target as any).value = "";
            commands?.sendChat(val);
        }
    };

    if (socketState == SOCKET_STATE.ERROR || gameExists === false)
        return (
            <>
                <Header />
                <Error statusCode={404} />
            </>
        );

    if (socketState == SOCKET_STATE.INIT) {
        return (
            <>
                <Header />
                <div
                    className={classNames("text-2xl font-semibold text-white")}
                ></div>
                <div className="text-white w-full h-screen flex">
                    {spinner()}
                </div>
            </>
        );
    }

    if (lobbyState.started) {
        disconnect();
        return (
            <>
                <div className="h-screen overflow-hidden">
                    <Pixi gameId={gameId} order={lobbyState.order} />
                </div>
                <div className="bg-[color:var(--ui-ivory)] p-2 invisible portrait:visible">
                    <div className="text-[color:var(--ui-ink)]">
                        The game is best played in landscape mode on a mobile device.
                    </div>

                    <button
                        className="ui-button ui-button-primary !w-auto mt-2"
                        onClick={toggleFullscreen}
                    >
                        Toggle Fullscreen
                    </button>
                </div>
            </>
        );
    }

    function getAdvancedCheckBox(
        text: string,
        setting: keyof IAdvancedSettings,
    ) {
        const changeVal: ChangeEventHandler<HTMLInputElement> = (event) => {
            sendAdvancedSettings({
                ...lobbyState.advanced,
                [setting]: Boolean(event.target.checked),
            });
        };

        return (
            <div className="min-w-0">
                <div
                    className={classNames(
                        `${settingCardClasses} px-4 pt-3 pb-2 transition-colors duration-200`,
                        lobbyState.advanced[setting]
                            ? "ui-card-active"
                            : "",
                    )}
                >
                    <div className="flex justify-center">
                        <div className="w-full">
                            <input
                                className={classNames(
                                    "ui-check-input h-4 w-4 rounded-sm checked:bg-[color:var(--ui-gold)] checked:border-[color:var(--ui-gold)]",
                                    "transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left mt-1.5 mr-2",
                                    lobbyState.order === 0
                                        ? "cursor-pointer"
                                        : "",
                                )}
                                type="checkbox"
                                aria-label={text}
                                checked={
                                    lobbyState.advanced[setting] as boolean
                                }
                                id={setting}
                                disabled={lobbyState.order !== 0}
                                onChange={changeVal}
                            />
                            <label
                                className="block text-base text-left mb-1 text-[color:var(--ui-ivory)]"
                                htmlFor={setting}
                            >
                                {text}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="ui-page ui-fade-in !py-4">
                {(lobbyError || disconnectedMessage) && (
                    <div className="ui-panel ui-panel-pad ui-alert-error mb-3">
                        {lobbyError || disconnectedMessage}
                    </div>
                )}
                <div className="ui-grid xl:grid-cols-[minmax(0,3fr),minmax(280px,1fr)] gap-4 lg:h-[calc(100vh-116px)]">
                <div className="basis-full min-h-0">
                    <div className="ui-panel ui-panel-pad text-center flex flex-col lg:overflow-y-auto lg:h-full">
                        <div className="space-y-3">
                            <div className="text-[color:var(--ui-ivory)] text-2xl pt-1">
                                Game Settings
                            </div>

                            <div className="grid gap-2.5 sm:grid-cols-2">
                                <div className={settingCardClasses}>
                                    <label className={labelClasses} htmlFor="gameMode">
                                        Mode
                                    </label>
                                    <select
                                        className={selectClasses}
                                        aria-label="Game Mode"
                                        id="gameMode"
                                        onChange={changeMode}
                                        disabled={lobbyState.order !== 0}
                                        value={lobbyState.settings.Mode}
                                    >
                                        <option value={GAME_MODE.Base}>
                                            Basic
                                        </option>
                                        <option
                                            value={GAME_MODE.Seafarers}
                                        >
                                            Seafarers
                                        </option>
                                        <option
                                            value={
                                                GAME_MODE.CitiesAndKnights
                                            }
                                        >
                                            Cities and Knights
                                        </option>
                                    </select>
                                </div>
                                <div className={settingCardClasses}>
                                    <label className={labelClasses} htmlFor="mapName">
                                        Map
                                    </label>
                                    <select
                                        id="mapName"
                                        className={selectClasses}
                                        aria-label="Map Name"
                                        disabled={lobbyState.order !== 0}
                                        onChange={(event) =>
                                            changeMap(event.target.value)
                                        }
                                        value={lobbyState.settings.MapName}
                                    >
                                        {mapOptions.map((name: string) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-2.5 sm:grid-cols-2">
                                {/* Victory Point selection */}
                                <div className={settingCardClasses}>
                                    <div className="w-full">
                                            <label className={labelClasses} htmlFor="victoryPoint">
                                                Victory Points (
                                                {
                                                    lobbyState.settings
                                                        .VictoryPoints
                                                }
                                                )
                                            </label>
                                            <input
                                                className={rangeInputClasses}
                                                aria-label="Victory Points"
                                                id="victoryPoint"
                                                type="range"
                                                min={minVictoryPoints}
                                                max={maxVictoryPoints}
                                                step={1}
                                                onChange={changeVicP}
                                                disabled={
                                                    lobbyState.order !== 0
                                                }
                                                value={
                                                    lobbyState.settings
                                                        .VictoryPoints
                                                }
                                            />
                                            <div className="flex justify-between text-xs text-[color:var(--ui-text-dim)] mt-1.5">
                                                <span>{minVictoryPoints}</span>
                                                <span>{maxVictoryPoints}</span>
                                            </div>
                                    </div>
                                </div>
                                {/* Turn timer selection */}
                                <div className={settingCardClasses}>
                                    <div className="w-full">
                                            <div className="flex items-center justify-center gap-1 mb-2">
                                                <label className={labelClasses + " !mb-0"} htmlFor="turnTimerControl">
                                                    Turn Timer
                                                </label>
                                                <button
                                                    type="button"
                                                    aria-label="Show timer details"
                                                    onClick={() => setShowTimerInfo(true)}
                                                    className="text-[color:var(--ui-ivory-soft)] hover:text-[color:var(--ui-gold-soft)] transition-colors"
                                                >
                                                    <QuestionMarkCircleIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div
                                                id="turnTimerControl"
                                                className={classNames(
                                                    valueControlClasses,
                                                    "flex items-center justify-between",
                                                    lobbyState.order !== 0 ? "opacity-70" : "",
                                                )}
                                            >
                                                <button
                                                    type="button"
                                                    aria-label="Decrease turn timer"
                                                    className={stepperButtonClasses}
                                                    disabled={lobbyState.order !== 0}
                                                    onClick={() =>
                                                        changeSpeed(
                                                            turnTimerOptions[
                                                                (timerIndex -
                                                                    1 +
                                                                    turnTimerOptions.length) %
                                                                    turnTimerOptions.length
                                                            ].value,
                                                        )
                                                    }
                                                >
                                                    <ChevronLeftIcon className="w-5 h-5" />
                                                </button>
                                                <span className="text-2xl font-semibold leading-none min-w-[4.75rem]">
                                                    {selectedTimer.label}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label="Increase turn timer"
                                                    className={stepperButtonClasses}
                                                    disabled={lobbyState.order !== 0}
                                                    onClick={() =>
                                                        changeSpeed(
                                                            turnTimerOptions[
                                                                (timerIndex + 1) %
                                                                    turnTimerOptions.length
                                                            ].value,
                                                        )
                                                    }
                                                >
                                                    <ChevronRightIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                    </div>
                                </div>
                            </div>

                            <div className={settingCardClasses}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className={labelClasses + " !mb-0"}>
                                        Extra Options
                                    </div>
                                    <button
                                        type="button"
                                        className="ui-button ui-button-ghost !w-auto !h-8 !min-h-0 !px-3 text-xs uppercase tracking-[0.08em]"
                                        onClick={() =>
                                            setShowGameOptions((current) => !current)
                                        }
                                    >
                                        {showGameOptions ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {showGameOptions && (
                                    <div className="space-y-3 pt-3">
                                        <div className="flex flex-wrap gap-2">
                                            <label
                                                htmlFor="Private"
                                                className={classNames(
                                                    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200",
                                                    lobbyState.settings.Private
                                                        ? "ui-toggle-chip-on"
                                                        : "ui-toggle-chip-off",
                                                    lobbyState.order !== 0
                                                        ? "opacity-70 cursor-not-allowed"
                                                        : "",
                                                )}
                                            >
                                                <input
                                                    className="ui-check-input h-3.5 w-3.5 rounded-sm checked:bg-[color:var(--ui-gold)] checked:border-[color:var(--ui-gold)]"
                                                    type="checkbox"
                                                    id="Private"
                                                    aria-label="Private Game"
                                                    checked={lobbyState.settings.Private}
                                                    disabled={lobbyState.order !== 0}
                                                    onChange={(event) =>
                                                        sendSettings({
                                                            ...lobbyState.settings,
                                                            Private: Boolean(event.target.checked),
                                                        })
                                                    }
                                                />
                                                <span>Private Game</span>
                                            </label>
                                            <label
                                                htmlFor="CreativeMode"
                                                className={classNames(
                                                    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200",
                                                    lobbyState.settings.CreativeMode
                                                        ? "ui-toggle-chip-on"
                                                        : "ui-toggle-chip-off",
                                                    lobbyState.order !== 0
                                                        ? "opacity-70 cursor-not-allowed"
                                                        : "",
                                                )}
                                            >
                                                <input
                                                    className="ui-check-input h-3.5 w-3.5 rounded-sm checked:bg-[color:var(--ui-gold)] checked:border-[color:var(--ui-gold)]"
                                                    type="checkbox"
                                                    id="CreativeMode"
                                                    aria-label="Creative Mode"
                                                    checked={lobbyState.settings.CreativeMode}
                                                    disabled={lobbyState.order !== 0}
                                                    onChange={(event) =>
                                                        sendSettings({
                                                            ...lobbyState.settings,
                                                            CreativeMode: Boolean(event.target.checked),
                                                        })
                                                    }
                                                />
                                                <span>Creative Mode</span>
                                            </label>
                                        </div>
                                        <div className="grid gap-2.5 sm:grid-cols-2">
                                            <div>
                                                <label className={labelClasses} htmlFor="maxplayers-control">
                                                    Max Players
                                                </label>
                                                <div
                                                    id="maxplayers-control"
                                                    className={classNames(
                                                        valueControlClasses,
                                                        lobbyState.order !== 0
                                                            ? "opacity-70"
                                                            : "",
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            type="button"
                                                            aria-label="Decrease max players"
                                                            className={stepperButtonClasses}
                                                            disabled={
                                                                lobbyState.order !==
                                                                    0 ||
                                                                lobbyState.settings
                                                                    .MaxPlayers <=
                                                                    minPlayers
                                                            }
                                                            onClick={() =>
                                                                setMaxPlayers(
                                                                    Math.max(
                                                                        minPlayers,
                                                                        lobbyState
                                                                            .settings
                                                                            .MaxPlayers -
                                                                            1,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <ChevronLeftIcon className="w-5 h-5" />
                                                        </button>
                                                        <span className="text-2xl font-semibold leading-none min-w-[4.75rem]">
                                                            {
                                                                lobbyState.settings
                                                                    .MaxPlayers
                                                            }
                                                            /{maxPlayersLimit}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            aria-label="Increase max players"
                                                            className={stepperButtonClasses}
                                                            disabled={
                                                                lobbyState.order !==
                                                                    0 ||
                                                                lobbyState.settings
                                                                    .MaxPlayers >=
                                                                    maxPlayersLimit
                                                            }
                                                            onClick={() =>
                                                                setMaxPlayers(
                                                                    Math.min(
                                                                        maxPlayersLimit,
                                                                        lobbyState
                                                                            .settings
                                                                            .MaxPlayers +
                                                                            1,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <ChevronRightIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClasses} htmlFor="discardlimit">
                                                    Discard Limit ({lobbyState.settings.DiscardLimit})
                                                </label>
                                                <input
                                                    className={rangeInputClasses}
                                                    aria-label="Discard Limit"
                                                    id="discardlimit"
                                                    type="range"
                                                    min={minDiscardLimit}
                                                    max={maxDiscardLimit}
                                                    step={1}
                                                    onChange={changeDiscard}
                                                    disabled={lobbyState.order !== 0}
                                                    value={lobbyState.settings.DiscardLimit}
                                                />
                                                <div className="flex justify-between text-xs text-[color:var(--ui-text-dim)] mt-1.5">
                                                    <span>{minDiscardLimit}</span>
                                                    <span>{maxDiscardLimit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {lobbyState.settings.Advanced && (
                                <>
                                    <div className="text-[color:var(--ui-ivory)] text-xl font-semibold pt-1">
                                        Advanced Settings
                                    </div>
                                    <div className="grid gap-2.5 lg:grid-cols-3">
                                        {getAdvancedCheckBox(
                                            "Re-roll on 7",
                                            "RerollOn7",
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="basis-auto mt-5">
                            {lobbyState.order === 0 ? (
                                <button
                                    disabled={!lobbyState.canStart}
                                    className={classNames(
                                        "ui-button w-full sm:w-3/4 xl:w-2/3 h-12 text-xl rounded-xl",
                                        lobbyState.canStart
                                            ? "ui-button-primary"
                                            : "bg-stone-700 opacity-40",
                                    )}
                                    onClick={startGame}
                                >
                                    Start Game
                                </button>
                            ) : (
                                <div
                                    className={classNames(
                                        "w-full sm:w-3/4 xl:w-2/3 px-5 py-3 rounded-xl my-2 mx-auto border transition-colors duration-200",
                                        lobbyState.ready
                                            ? "ui-ready-on"
                                            : "ui-ready-off",
                                    )}
                                >
                                    <label
                                        className="w-full flex items-center gap-3 cursor-pointer text-left text-[color:var(--ui-ivory)]"
                                        htmlFor="ready"
                                    >
                                        <input
                                            className="ui-check-input h-5 w-5 rounded-sm
                                                   checked:bg-[color:var(--ui-gold)] checked:border-[color:var(--ui-gold)]
                                                   focus:ring-2 focus:ring-[color:var(--ui-focus-ring)] focus:ring-offset-0"
                                            type="checkbox"
                                            aria-label="Ready to play"
                                            checked={lobbyState.ready}
                                            id="ready"
                                            onChange={changeReady}
                                        />
                                        <span className="text-[1.6rem] leading-none">Ready</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="basis-full xl:basis-1/4 flex flex-col min-h-0">
                    <div className="ui-panel ui-panel-pad text-center flex-none">
                        <div className="basis-auto m-1 text-[color:var(--ui-ivory)] text-2xl p-2 pb-4">
                            Players ({lobbyState.players.length}/{lobbyState.settings.MaxPlayers})
                        </div>
                        <PlayerList lobbyState={lobbyState} socket={socketRef} />

                        <div className="basis-auto mt-2">
                            <button
                                disabled={lobbyState.order != 0}
                                className={classNames(
                                    "ui-button h-11 w-2/3 text-lg rounded-xl",
                                    lobbyState.order == 0
                                        ? "ui-button-secondary"
                                        : "bg-stone-700 opacity-40",
                                )}
                                onClick={botAdd}
                            >
                                Add Bot
                            </button>
                        </div>
                    </div>

                    <div className="ui-panel ui-panel-pad text-center mt-4 flex flex-col">
                        <div className="basis-auto rounded-xl m-1 text-[color:var(--ui-ivory)] text-3xl p-3 pb-4">
                            Chat
                        </div>

                        <div
                            className="ui-chat-box rounded-lg text-left p-3 overflow-y-auto overscroll-contain h-[220px] sm:h-[240px] lg:h-[280px]"
                            ref={chatDiv}
                        >
                            <div className="space-y-1.5">
                                {lobbyState.chatMessages.length ? (
                                    lobbyState.chatMessages.map((m: { id: number; msg: string }) => (
                                        <p
                                            key={m.id}
                                            className="ui-chat-msg text-sm leading-relaxed text-[color:var(--ui-ivory)] break-words pb-1"
                                        >
                                            {m.msg}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-sm text-[color:var(--ui-ivory-soft)] text-center pt-12">
                                        No messages yet.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 text-left">
                            <label
                                className="block text-xs uppercase tracking-[0.06em] text-[color:var(--ui-ivory-soft)] mb-1"
                                htmlFor="lobby-chat-input"
                            >
                                Message
                            </label>
                            <input
                                id="lobby-chat-input"
                                type="text"
                                className="ui-input"
                                placeholder="Press Enter to send"
                                onKeyDown={sendChat}
                            ></input>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            {showTimerInfo ? (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Timer reference table"
                    onClick={() => setShowTimerInfo(false)}
                >
                    <div
                        className="ui-panel ui-panel-pad w-full max-w-5xl max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="ui-title ui-title-md">Timer Reference</h3>
                            <button
                                type="button"
                                className="ui-button ui-button-ghost !w-auto !min-h-0 !px-3 !py-1"
                                onClick={() => setShowTimerInfo(false)}
                            >
                                Close
                            </button>
                        </div>
                        <div className="relative w-full min-h-[280px]">
                            <Image
                                src="/assets/shared/ui/timing-rules.png"
                                alt="Catan timer reference table"
                                layout="responsive"
                                width={1200}
                                height={760}
                                objectFit="contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default Game;
