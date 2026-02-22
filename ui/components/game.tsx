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
    "rounded-xl px-3 py-2.5 bg-[rgba(42,34,31,0.72)] border border-[rgba(231,222,206,0.16)]";
const valueControlClasses =
    "rounded-lg px-3 py-2.5 bg-[rgba(21,18,15,0.52)] border border-[rgba(231,222,206,0.2)] text-[color:var(--ui-ivory)]";
const stepperButtonClasses =
    "p-1.5 rounded-md hover:bg-[rgba(183,148,90,0.2)] disabled:opacity-40 transition-colors";
const rangeInputClasses =
    "w-full h-2 rounded-lg appearance-none cursor-pointer accent-[color:var(--ui-gold)] disabled:opacity-40";
const turnTimerOptions = [
    { value: "15s", label: "15s" },
    { value: "30s", label: "30s" },
    { value: "60s", label: "60s" },
    { value: "120s", label: "120s" },
    { value: "200m", label: "200m" },
];
const legacyTimerAlias: Record<string, string> = {
    "12s": "15s",
    fast: "30s",
    normal: "60s",
    slow: "120s",
};

const Game: FunctionComponent<{ gameId: string }> = ({ gameId }) => {
    const router = useRouter();
    const chatDiv = useRef<HTMLDivElement | null>(null);
    const { lobbyState, socketState, gameExists, commands, socketRef, disconnect } =
        useLobbySession(gameId);

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

    const changeMode: ChangeEventHandler<HTMLSelectElement> = (event) => {
        const mode = Number(event.target.value);
        const vpDefault =
            mode === GAME_MODE.CitiesAndKnights
                ? 13
                : mode === GAME_MODE.Seafarers
                  ? 12
                  : 10;
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

    const normalizedTimerValue =
        legacyTimerAlias[lobbyState.settings.Speed] || lobbyState.settings.Speed;
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

    function getCheckBox(text: string, setting: keyof IGameSettings) {
        const changeVal: ChangeEventHandler<HTMLInputElement> = (event) => {
            sendSettings({
                ...lobbyState.settings,
                [setting]: Boolean(event.target.checked),
            });
        };

        return (
            <div className="p-1 basis-full lg:basis-1/2">
                <div
                    className={classNames(
                        `${settingCardClasses} transition-colors duration-200`,
                        lobbyState.settings[setting]
                            ? "bg-[rgba(122,31,36,0.46)] border-[rgba(183,148,90,0.42)]"
                            : "",
                    )}
                >
                    <div className="flex justify-center">
                        <div className="w-full">
                            <input
                                className={classNames(
                                    "h-4 w-4 rounded-sm bg-[color:var(--ui-ivory)] checked:bg-[color:var(--ui-gold)] checked:border-[color:var(--ui-gold)]",
                                    "transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left mt-1.5 mr-2",
                                    lobbyState.order === 0
                                        ? "cursor-pointer"
                                        : "",
                                )}
                                type="checkbox"
                                aria-label={text}
                                checked={
                                    lobbyState.settings[setting] as boolean
                                }
                                id={setting}
                                disabled={lobbyState.order !== 0}
                                onChange={changeVal}
                            />
                            <label
                                className="block text-sm text-left text-[color:var(--ui-ivory)] cursor-pointer"
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
            <div className="p-1 basis-full lg:basis-1/3">
                <div
                    className={classNames(
                        `${settingCardClasses} px-4 pt-3 pb-2 transition-colors duration-200`,
                        lobbyState.advanced[setting]
                            ? "bg-[rgba(122,31,36,0.62)] border-[rgba(183,148,90,0.55)]"
                            : "",
                    )}
                >
                    <div className="flex justify-center">
                        <div className="w-full">
                            <input
                                className={classNames(
                                    "h-4 w-4 rounded-sm bg-[color:var(--ui-ivory)] checked:bg-[color:var(--ui-gold)] checked:border-[color:var(--ui-gold)]",
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
                <div className="ui-grid xl:grid-cols-[minmax(0,3fr),minmax(280px,1fr)] gap-4 lg:h-[calc(100vh-116px)]">
                <div className="basis-full min-h-0">
                    <div className="ui-panel ui-panel-pad text-center flex flex-col lg:overflow-y-auto lg:h-full">
                        <div>
                            <div className="basis-auto m-1 text-[color:var(--ui-ivory)] text-2xl p-2 pb-3">
                                Game Settings
                            </div>

                            <div className="flex flex-col lg:flex-row mt-1">
                                <div className="basis-full lg:basis-1/2 rounded-xl m-1">
                                    {/* Game mode selection */}
                                    <div className={settingCardClasses}>
                                        <div className="w-full">
                                            <label className={labelClasses} htmlFor="gameMode">
                                                Mode
                                            </label>
                                            <select
                                                className={selectClasses}
                                                aria-label="Game Mode"
                                                id="gameMode"
                                                onChange={changeMode}
                                                disabled={
                                                    lobbyState.order !== 0
                                                }
                                                value={lobbyState.settings.Mode}
                                            >
                                                <option value={GAME_MODE.Base}>
                                                    Basic
                                                </option>
                                                <option
                                                    value={
                                                        GAME_MODE.CitiesAndKnights
                                                    }
                                                >
                                                    Wonders &amp; Warriors
                                                </option>
                                                <option
                                                    value={GAME_MODE.Seafarers}
                                                >
                                                    Seafarers
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="basis-full lg:basis-1/2 rounded-xl m-1">
                                    {/* Map selection */}
                                    <div className={settingCardClasses}>
                                        <label className={labelClasses} htmlFor="mapName">
                                            Map Name
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
                            </div>

                            <div className="flex flex-col lg:flex-row mt-1 mb-2">
                                {getCheckBox("Private Game", "Private")}
                                {getCheckBox("Creative Mode", "CreativeMode")}
                            </div>

                            <div className="flex flex-col lg:flex-row md:mt-2">
                                <div className="basis-full lg:basis-1/4 rounded-xl m-1">
                                    {/* Max Player */}
                                    <div className={settingCardClasses}>
                                        <div className="w-full">
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
                                                    <span className="text-3xl font-semibold leading-none min-w-[5.5rem]">
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
                                    </div>
                                </div>
                                <div className="basis-full lg:basis-1/4 rounded-xl m-1">
                                    {/* Discard limit selection */}
                                    <div className={settingCardClasses}>
                                        <div className="w-full">
                                            <label className={labelClasses} htmlFor="discardlimit">
                                                Discard Limit (
                                                {
                                                    lobbyState.settings
                                                        .DiscardLimit
                                                }
                                                )
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
                                                disabled={
                                                    lobbyState.order !== 0
                                                }
                                                value={
                                                    lobbyState.settings
                                                        .DiscardLimit
                                                }
                                            />
                                            <div className="flex justify-between text-xs text-[rgba(244,239,228,0.7)] mt-1.5">
                                                <span>{minDiscardLimit}</span>
                                                <span>{maxDiscardLimit}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="basis-full lg:basis-1/4 rounded-xl m-1">
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
                                            <div className="flex justify-between text-xs text-[rgba(244,239,228,0.7)] mt-1.5">
                                                <span>{minVictoryPoints}</span>
                                                <span>{maxVictoryPoints}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="basis-full lg:basis-1/4 rounded-xl m-1">
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
                                                <span className="text-3xl font-semibold leading-none min-w-[5.5rem]">
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
                            </div>

                            {lobbyState.settings.Advanced && (
                                <>
                                    <div className="basis-auto rounded-xl m-1 text-[color:var(--ui-ivory)] text-2xl font-bold p-3 pb-3">
                                        Advanced Settings
                                    </div>
                                    <div className="flex flex-col lg:flex-row md:mt-2">
                                        {getAdvancedCheckBox(
                                            "Re-roll on 7",
                                            "RerollOn7",
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="basis-auto mt-6">
                            {/* Ready selection */}
                            <div
                                className={classNames(
                                    "w-3/4 sm:w-1/2 md:w-3/4 lg:w-3/4 xl:w-1/2 px-5 py-3 rounded-xl my-3 mx-auto border transition-colors duration-200",
                                    lobbyState.ready
                                        ? "bg-[rgba(88,44,48,0.58)] border-[rgba(183,148,90,0.45)]"
                                        : "bg-[rgba(61,42,35,0.62)] border-[rgba(231,222,206,0.18)]",
                                )}
                            >
                                <label
                                    className="w-full flex items-center gap-3 cursor-pointer text-left text-[color:var(--ui-ivory)]"
                                    htmlFor="ready"
                                >
                                    <input
                                        className="h-5 w-5 rounded-sm border-[rgba(231,222,206,0.45)] bg-[color:var(--ui-ivory)]
                                                   checked:bg-[color:var(--ui-gold)] checked:border-[color:var(--ui-gold)]
                                                   focus:ring-2 focus:ring-[rgba(183,148,90,0.45)] focus:ring-offset-0"
                                        type="checkbox"
                                        aria-label="Ready to play"
                                        checked={lobbyState.ready}
                                        id="ready"
                                        onChange={changeReady}
                                    />
                                    <span className="text-[1.95rem] leading-none">Ready</span>
                                </label>
                            </div>

                            <button
                                disabled={
                                    lobbyState.order != 0 ||
                                    !lobbyState.canStart
                                }
                                className={classNames(
                                    "ui-button w-3/4 sm:w-1/2 md:w-3/4 lg:w-3/4 xl:w-1/2 h-12 text-xl rounded-xl",
                                    lobbyState.order == 0 && lobbyState.canStart
                                        ? "ui-button-primary"
                                        : "bg-stone-700 opacity-40",
                                )}
                                onClick={startGame}
                            >
                                Start Game
                            </button>
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
                            className="text-[color:var(--ui-ivory)] bg-[rgba(21,18,15,0.45)] border border-[rgba(231,222,206,0.14)] rounded-lg text-left p-3 overflow-y-auto overscroll-contain h-[220px] sm:h-[240px] lg:h-[280px]"
                            ref={chatDiv}
                        >
                            <div className="space-y-1.5">
                                {lobbyState.chatMessages.length ? (
                                    lobbyState.chatMessages.map((m: { id: number; msg: string }) => (
                                        <p
                                            key={m.id}
                                            className="text-sm leading-relaxed text-[color:var(--ui-ivory)] break-words border-b border-[rgba(231,222,206,0.08)] pb-1"
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
                                src="/assets/timing-rules.png"
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
