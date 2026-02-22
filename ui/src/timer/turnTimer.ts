export type TurnTimerMode =
    | "server"
    | "fallback"
    | "paused"
    | "snapshot"
    | "no-player";

export type TurnTimerState = {
    timerPhaseId: number;
    timerEndsAtMs: number;
    timerServerOffsetMs: number;
    timerLastServerNowMs: number;
    fallbackTimerEndsAtMs: number;
    fallbackTimerOrder: number;
    fallbackSnapshotSeconds: number;
};

export type TurnTimerCurrentPlayer = {
    Order: number;
    TimeLeft: number;
};

export type ComputeTurnTimerInput = {
    currentPlayer: TurnTimerCurrentPlayer | null | undefined;
    timerPhaseId: number;
    timerEndsAtMs: number;
    serverNowMs: number;
    clientNowMs: number;
};

export type ComputeTurnTimerResult = {
    state: TurnTimerState;
    displaySeconds: number | null;
    mode: TurnTimerMode;
};

export function createInitialTurnTimerState(): TurnTimerState {
    return {
        timerPhaseId: -1,
        timerEndsAtMs: 0,
        timerServerOffsetMs: 0,
        timerLastServerNowMs: 0,
        fallbackTimerEndsAtMs: 0,
        fallbackTimerOrder: -1,
        fallbackSnapshotSeconds: -1,
    };
}

export function computeTurnTimer(
    current: TurnTimerState,
    input: ComputeTurnTimerInput,
): ComputeTurnTimerResult {
    const next: TurnTimerState = { ...current };
    const player = input.currentPlayer;
    if (!player) {
        return {
            state: createInitialTurnTimerState(),
            displaySeconds: null,
            mode: "no-player",
        };
    }

    const incomingPhaseId = Number(input.timerPhaseId || 0);
    const incomingEndsAtMs = Number(input.timerEndsAtMs || 0);
    const incomingServerNowMs = Number(input.serverNowMs || 0);
    const hasServerTimerMetadata =
        incomingPhaseId > 0 || incomingEndsAtMs > 0 || incomingServerNowMs > 0;

    if (
        incomingServerNowMs > 0 &&
        incomingServerNowMs !== next.timerLastServerNowMs
    ) {
        next.timerLastServerNowMs = incomingServerNowMs;
        next.timerServerOffsetMs = incomingServerNowMs - input.clientNowMs;
    }

    if (incomingPhaseId !== next.timerPhaseId) {
        next.timerPhaseId = incomingPhaseId;
        next.timerEndsAtMs = incomingEndsAtMs;
    } else if (
        incomingEndsAtMs > 0 &&
        (next.timerEndsAtMs <= 0 || incomingEndsAtMs < next.timerEndsAtMs)
    ) {
        // Same phase: only tighten downward to avoid visual "restarts".
        next.timerEndsAtMs = incomingEndsAtMs;
    }

    const snapshotSeconds = Math.max(0, Number(player.TimeLeft || 0));
    let displaySeconds = snapshotSeconds;
    let mode: TurnTimerMode = "snapshot";

    if (next.timerEndsAtMs > 0) {
        const estimatedServerNow = input.clientNowMs + next.timerServerOffsetMs;
        displaySeconds = Math.max(
            0,
            Math.ceil((next.timerEndsAtMs - estimatedServerNow) / 1000),
        );
        mode = "server";
    } else if (!hasServerTimerMetadata) {
        // Backward-compatible fallback for servers that don't send timer end timestamp.
        const orderChanged = next.fallbackTimerOrder !== Number(player.Order);
        const snapshotChanged = next.fallbackSnapshotSeconds !== snapshotSeconds;
        if (orderChanged || snapshotChanged || next.fallbackTimerEndsAtMs <= 0) {
            next.fallbackTimerOrder = Number(player.Order);
            next.fallbackSnapshotSeconds = snapshotSeconds;
            next.fallbackTimerEndsAtMs =
                input.clientNowMs + snapshotSeconds * 1000;
        }
        displaySeconds = Math.max(
            0,
            Math.ceil((next.fallbackTimerEndsAtMs - input.clientNowMs) / 1000),
        );
        mode = "fallback";
    } else {
        next.fallbackTimerEndsAtMs = 0;
        next.fallbackTimerOrder = -1;
        next.fallbackSnapshotSeconds = -1;
        mode = "paused";
    }

    return {
        state: next,
        displaySeconds,
        mode,
    };
}
