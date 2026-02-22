import type { GameState, PlayerState } from "../../tsg";
import {
    computeTurnTimer,
    createInitialTurnTimerState,
    type TurnTimerCurrentPlayer,
    type TurnTimerMode,
    type TurnTimerState,
} from "../timer/turnTimer";

type TimerSnapshot = {
    currentPlayer: TurnTimerCurrentPlayer | null;
    timerPhaseId: number;
    timerEndsAtMs: number;
    serverNowMs: number;
};

export type TurnTimerView = {
    displaySeconds: number | null;
    mode: TurnTimerMode;
};

let timerState: TurnTimerState = createInitialTurnTimerState();
let snapshot: TimerSnapshot = {
    currentPlayer: null,
    timerPhaseId: 0,
    timerEndsAtMs: 0,
    serverNowMs: 0,
};

export function resetTurnTimerRuntime() {
    timerState = createInitialTurnTimerState();
    snapshot = {
        currentPlayer: null,
        timerPhaseId: 0,
        timerEndsAtMs: 0,
        serverNowMs: 0,
    };
}

export function syncTurnTimerSnapshot(
    gs: GameState | null,
    playerStates: PlayerState[] | null | undefined,
) {
    const currentOrder = gs?.CurrentPlayerOrder;
    const current =
        currentOrder === undefined
            ? null
            : playerStates?.find((p) => p?.Order === currentOrder) ?? null;

    snapshot = {
        currentPlayer: current
            ? {
                  Order: Number(current.Order || 0),
                  TimeLeft: Number(current.TimeLeft || 0),
              }
            : null,
        timerPhaseId: Number(gs?.TimerPhaseId || 0),
        timerEndsAtMs: Number(gs?.TimerEndsAtMs || 0),
        serverNowMs: Number(gs?.ServerNowMs || 0),
    };
}

export function getTurnTimerView(clientNowMs: number): TurnTimerView {
    const computed = computeTurnTimer(timerState, {
        currentPlayer: snapshot.currentPlayer,
        timerPhaseId: snapshot.timerPhaseId,
        timerEndsAtMs: snapshot.timerEndsAtMs,
        serverNowMs: snapshot.serverNowMs,
        clientNowMs,
    });
    timerState = computed.state;
    return {
        displaySeconds: computed.displaySeconds,
        mode: computed.mode,
    };
}
