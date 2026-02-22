import test from "node:test";
import assert from "node:assert/strict";
import {
    computeTurnTimer,
    createInitialTurnTimerState,
    type TurnTimerState,
} from "./turnTimer.ts";

function run(
    state: TurnTimerState,
    args: {
        order?: number;
        timeLeft?: number;
        phase?: number;
        endsAt?: number;
        serverNow?: number;
        now: number;
    },
) {
    return computeTurnTimer(state, {
        currentPlayer:
            args.order === undefined
                ? null
                : {
                      Order: args.order,
                      TimeLeft: args.timeLeft ?? 0,
                  },
        timerPhaseId: args.phase ?? 0,
        timerEndsAtMs: args.endsAt ?? 0,
        serverNowMs: args.serverNow ?? 0,
        clientNowMs: args.now,
    });
}

test("server countdown advances between snapshots with identical serverNow", () => {
    let state = createInitialTurnTimerState();

    const first = run(state, {
        order: 1,
        timeLeft: 120,
        phase: 8,
        endsAt: 121000,
        serverNow: 1000,
        now: 1000,
    });
    state = first.state;
    assert.equal(first.mode, "server");
    assert.equal(first.displaySeconds, 120);

    const second = run(state, {
        order: 1,
        timeLeft: 120,
        phase: 8,
        endsAt: 121000,
        serverNow: 1000,
        now: 2000,
    });
    assert.equal(second.mode, "server");
    assert.equal(second.displaySeconds, 119);
});

test("fallback mode counts down when timer metadata is absent", () => {
    let state = createInitialTurnTimerState();

    const first = run(state, {
        order: 2,
        timeLeft: 10,
        now: 5000,
    });
    state = first.state;
    assert.equal(first.mode, "fallback");
    assert.equal(first.displaySeconds, 10);

    const second = run(state, {
        order: 2,
        timeLeft: 10,
        now: 6000,
    });
    assert.equal(second.mode, "fallback");
    assert.equal(second.displaySeconds, 9);
});

test("paused mode is selected when metadata exists but timer end is zero", () => {
    const result = run(createInitialTurnTimerState(), {
        order: 1,
        timeLeft: 42,
        phase: 9,
        endsAt: 0,
        serverNow: 10000,
        now: 10000,
    });

    assert.equal(result.mode, "paused");
    assert.equal(result.displaySeconds, 42);
});

test("same phase only tightens timer end timestamp", () => {
    let state = createInitialTurnTimerState();

    const first = run(state, {
        order: 1,
        timeLeft: 30,
        phase: 5,
        endsAt: 30000,
        serverNow: 0,
        now: 0,
    });
    state = first.state;
    assert.equal(first.displaySeconds, 30);

    const looser = run(state, {
        order: 1,
        timeLeft: 30,
        phase: 5,
        endsAt: 35000,
        now: 1000,
    });
    assert.equal(looser.displaySeconds, 29);

    const tighter = run(state, {
        order: 1,
        timeLeft: 30,
        phase: 5,
        endsAt: 25000,
        now: 1000,
    });
    assert.equal(tighter.displaySeconds, 24);
});

test("no-player resets timer state and signals no-player mode", () => {
    const seeded = run(createInitialTurnTimerState(), {
        order: 3,
        timeLeft: 20,
        phase: 4,
        endsAt: 25000,
        serverNow: 5000,
        now: 5000,
    });
    const result = run(seeded.state, { now: 6000 });

    assert.equal(result.mode, "no-player");
    assert.equal(result.displaySeconds, null);
    assert.deepEqual(result.state, createInitialTurnTimerState());
});
