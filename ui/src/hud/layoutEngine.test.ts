import test from "node:test";
import assert from "node:assert/strict";

import { resetUIConfig, initializeUIConfig } from "../uiConfig/index.ts";
import { buildHUDLayout, computeHandWidthForViewport } from "./layoutEngine.ts";

test("layout engine stacks right rail widgets in order", () => {
    resetUIConfig();

    const layout = buildHUDLayout({
        canvasWidth: 1600,
        canvasHeight: 900,
        playerCount: 4,
    });

    assert.equal(layout.widgets.gameLog!.y, 4);
    assert.equal(
        layout.widgets.chatLane!.y,
        layout.widgets.gameLog!.y + layout.widgets.gameLog!.height + 8,
    );
    assert.equal(
        layout.widgets.resourceBank!.y,
        layout.widgets.chatLane!.y + layout.widgets.chatLane!.height + 8,
    );
});

test("layout engine places action bar after the hand", () => {
    resetUIConfig();

    const layout = buildHUDLayout({
        canvasWidth: 1600,
        canvasHeight: 900,
        playerCount: 4,
    });

    assert.equal(
        layout.widgets.actionBar!.x,
        layout.widgets.hand!.x + layout.widgets.hand!.width + 8,
    );
});

test("layout engine hand width matches configured viewport clamp", () => {
    resetUIConfig();

    const layout = buildHUDLayout({
        canvasWidth: 1280,
        canvasHeight: 720,
    });

    assert.equal(layout.widgets.hand!.width, computeHandWidthForViewport(1280));
});

test("layout engine aligns chat input inside the chat window", () => {
    resetUIConfig();

    const layout = buildHUDLayout({
        canvasWidth: 1600,
        canvasHeight: 900,
    });

    assert.ok(layout.widgets.chatInput!.x >= layout.widgets.chatWindow!.x);
    assert.ok(layout.widgets.chatInput!.y >= layout.widgets.chatWindow!.y);
    assert.ok(
        layout.widgets.chatInput!.x + layout.widgets.chatInput!.width <=
            layout.widgets.chatWindow!.x + layout.widgets.chatWindow!.width,
    );
    assert.ok(
        layout.widgets.chatInput!.y + layout.widgets.chatInput!.height <=
            layout.widgets.chatWindow!.y + layout.widgets.chatWindow!.height,
    );
});

test("layout engine respects compact preset widths", () => {
    initializeUIConfig({ preset: "compact" });

    const layout = buildHUDLayout({
        canvasWidth: 1600,
        canvasHeight: 900,
    });

    assert.equal(layout.widgets.gameLog!.width, 252);
    assert.equal(layout.widgets.resourceBank!.width, 252);
    assert.equal(layout.widgets.chatWindow!.width, 236);
});
