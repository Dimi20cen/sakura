import test from "node:test";
import assert from "node:assert/strict";

import {
    DEFAULT_UI_CONFIG,
    configureUI,
    configureUIPreset,
    getAvailableUIPresets,
    getUIConfig,
    resetUIConfig,
} from "../uiConfig.ts";

function computeDefaultHandWidth() {
    const config = getUIConfig();
    const rightRailX =
        config.canvas.width - config.hud.padding - config.hud.rightRail.width;
    const actionBarWidth =
        config.hud.actionBar.innerOffset +
        config.hud.actionBar.buttonSpacing * config.hud.actionBar.buttonCount;
    const width =
        rightRailX -
        config.hud.bottomRail.leftInset -
        config.hud.bottomRail.gap -
        actionBarWidth;

    return Math.max(
        config.hud.bottomRail.handMinWidth,
        Math.min(config.hud.bottomRail.handMaxWidth, Math.floor(width)),
    );
}

function computeEvenlySpacedRowXPositions(
    containerWidth: number,
    itemWidth: number,
    itemCount: number,
    preferredGap = 6,
    minInset = 4,
) {
    if (itemCount <= 0) {
        return [];
    }

    if (itemCount === 1) {
        return [Math.max(minInset, Math.floor((containerWidth - itemWidth) / 2))];
    }

    const availableGapWidth = Math.max(
        0,
        containerWidth - minInset * 2 - itemWidth * itemCount,
    );
    const gap = Math.min(preferredGap, availableGapWidth / (itemCount - 1));
    const usedWidth = itemWidth * itemCount + gap * (itemCount - 1);
    const inset = Math.max(minInset, (containerWidth - usedWidth) / 2);

    return Array.from({ length: itemCount }, (_, index) =>
        Math.round(inset + index * (itemWidth + gap)),
    );
}

test("configureUI merges nested overrides without discarding sibling defaults", () => {
    resetUIConfig();

    configureUI({
        hud: {
            chat: {
                windowWidth: 320,
            },
            gameLog: {
                height: 280,
            },
        },
        windows: {
            fillAlpha: 0.75,
        },
    });

    const config = getUIConfig();

    assert.equal(config.hud.chat.windowWidth, 320);
    assert.equal(
        config.hud.chat.windowHeight,
        DEFAULT_UI_CONFIG.hud.chat.windowHeight,
    );
    assert.equal(config.hud.gameLog.height, 280);
    assert.equal(config.hud.gameLog.width, DEFAULT_UI_CONFIG.hud.gameLog.width);
    assert.equal(config.windows.fillAlpha, 0.75);
    assert.equal(
        config.controls.fullscreenButton.x,
        DEFAULT_UI_CONFIG.controls.fullscreenButton.x,
    );
});

test("configureUI preserves the active preset when applying later overrides", () => {
    resetUIConfig();

    configureUIPreset("compact");
    configureUI({
        windows: {
            fillAlpha: 0.75,
        },
    });

    const config = getUIConfig();

    assert.equal(config.windows.fillAlpha, 0.75);
    assert.equal(config.hud.gameLog.height, 260);
    assert.equal(config.hud.chat.windowWidth, 236);
    assert.equal(config.hud.actionBar.buttonWidth, 60);
});

test("resetUIConfig restores defaults after overrides", () => {
    configureUI({
        canvas: {
            width: 1440,
        },
    });

    const reset = resetUIConfig();

    assert.deepEqual(reset, DEFAULT_UI_CONFIG);
    assert.deepEqual(getUIConfig(), DEFAULT_UI_CONFIG);
});

test("configureUIPreset applies preset defaults and optional overrides", () => {
    resetUIConfig();

    configureUIPreset("compact", {
        hud: {
            actionBar: {
                buttonWidth: 58,
            },
        },
    });

    const config = getUIConfig();

    assert.equal(config.hud.gameLog.height, 260);
    assert.equal(config.hud.actionBar.buttonWidth, 58);
    assert.equal(config.hud.chat.windowWidth, 236);
});

test("getAvailableUIPresets exposes supported preset names", () => {
    assert.deepEqual(getAvailableUIPresets(), [
        "default",
        "compact",
        "mobileLandscape",
    ]);
});

test("default trade editor fits before the action bar", () => {
    resetUIConfig();

    const config = getUIConfig();
    const handLeft = config.hud.bottomRail.leftInset;
    const actionBarX =
        handLeft + computeDefaultHandWidth() + config.hud.bottomRail.gap;
    const actionRailWidth = Math.max(48, config.windows.yesNo.width);
    const editorRightEdge =
        handLeft +
        config.trade.editor.offerWidth +
        config.trade.editor.actionRailGap +
        actionRailWidth;

    assert.ok(
        editorRightEdge <= actionBarX,
        `expected trade editor right edge ${editorRightEdge} to fit before action bar at ${actionBarX}`,
    );
});

test("resource bank chip positions stay inside the narrowest preset width", () => {
    const config = configureUIPreset("mobileLandscape");
    const positions = computeEvenlySpacedRowXPositions(
        config.hud.resourceBank.width,
        34,
        6,
        6,
        4,
    );

    assert.equal(positions.length, 6);
    assert.ok(positions[0] >= 4);
    assert.ok(positions[5] + 34 <= config.hud.resourceBank.width);
});
