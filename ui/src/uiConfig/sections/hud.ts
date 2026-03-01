import type { UIConfig } from "../types.ts";

const RHYTHM = 4;
const SHARED_RAIL_HEIGHT = 80;
const RIGHT_RAIL_PANEL_WIDTH = 286;
const CLUSTER_GAP = 2;
const EDGE_INSET = 2;

export const hudConfig: UIConfig["hud"] = {
    padding: EDGE_INSET,
    gap: RHYTHM,
    playerPanel: {
        width: 286,
        rowHeight: SHARED_RAIL_HEIGHT + CLUSTER_GAP,
        headerOffset: 0,
        scaleDefault: 1,
        scaleCrowded: 1,
        crowdedThreshold: 4,
        highlightRowHeight: SHARED_RAIL_HEIGHT + CLUSTER_GAP,
    },
    rightRail: {
        width: RIGHT_RAIL_PANEL_WIDTH,
        bottomInset: 0,
        topInset: EDGE_INSET,
    },
    gameLog: {
        width: RIGHT_RAIL_PANEL_WIDTH,
        height: 298,
        visibleRows: 11,
    },
    chat: {
        laneWidth: RIGHT_RAIL_PANEL_WIDTH,
        laneHeight: 40,
        windowWidth: 268,
        windowHeight: 180,
        minWindowBottom: 250,
        popupRightInset: 20,
        popupTailInset: 50,
        inputInsetRight: RHYTHM * 6,
        inputInsetBottom: 256,
        inputHeight: RHYTHM * 7,
        inputBorderWidth: 2,
        inputHorizontalPadding: RHYTHM,
    },
    resourceBank: {
        width: RIGHT_RAIL_PANEL_WIDTH,
        height: 72,
    },
    bottomRail: {
        leftInset: 0,
        bottomInset: 0,
        gap: CLUSTER_GAP,
        handHeight: SHARED_RAIL_HEIGHT,
        handMinWidth: 260,
        handMaxWidth: 760,
    },
    actionBar: {
        innerOffset: RHYTHM * 3,
        buttonSpacing: 74,
        buttonCount: 5,
        height: SHARED_RAIL_HEIGHT,
        buttonWidth: 66,
        buttonInset: 12,
        countWidth: 20,
        countHeight: 19,
        countFontSize: 13,
        stackGap: CLUSTER_GAP,
    },
    dice: {
        rightRailGap: 34,
        aboveActionBarGap: RHYTHM * 4,
        minTopInset: 20,
    },
    misc: {
        bankSize: 90,
        bankTopMin: 10,
        devConfirmationOffsetY: 360,
        specialBuildOffsetX: 100,
        specialBuildOffsetY: 260,
        spectatorsX: 60,
        spectatorsY: 20,
        endTurnSlotIndex: 4,
        timerAboveEndTurnGap: CLUSTER_GAP,
        diceAboveTimerGap: CLUSTER_GAP,
        statusAboveDiceGap: RHYTHM * 2,
        statusWidth: 224,
        statusHeight: 40,
        timerWidth: 72,
        timerHeight: 40,
        statusLeftOfTimerGap: 4,
        shipAboveStatusGap: CLUSTER_GAP,
        timerRightNudge: 0,
    },
};
