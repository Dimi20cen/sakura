import {
    getChatConfig,
    getControlsConfig,
    getHandConfig,
    getHudConfig,
} from "../uiConfig/index.ts";
import type { HUDFrame, HUDLayoutContext, HUDLayoutResult } from "./types.ts";

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function makeFrame(x: number, y: number, width: number, height: number): HUDFrame {
    return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
    };
}

export function computeActionBarWidth() {
    const hud = getHudConfig();
    return (
        hud.actionBar.innerOffset +
        hud.actionBar.buttonSpacing * hud.actionBar.buttonCount
    );
}

export function computeHandWidthForViewport(canvasWidth: number) {
    const hud = getHudConfig();
    const rightRailX =
        canvasWidth - hud.padding - hud.rightRail.width;
    const width =
        rightRailX -
        hud.bottomRail.leftInset -
        hud.bottomRail.gap -
        computeActionBarWidth();

    return clamp(
        Math.floor(width),
        hud.bottomRail.handMinWidth,
        hud.bottomRail.handMaxWidth,
    );
}

export function buildHUDLayout(context: HUDLayoutContext): HUDLayoutResult {
    const hud = getHudConfig();
    const controls = getControlsConfig();
    const chat = getChatConfig();
    const hand = getHandConfig();

    const playerPanelWidth = context.playerPanelWidth ?? hud.playerPanel.width;
    const playerPanelHeight =
        context.playerPanelHeight ??
        (context.playerCount ?? 0) * hud.playerPanel.rowHeight +
            hud.playerPanel.headerOffset;
    const playerPanelScale =
        context.playerPanelScale ??
        ((context.playerCount ?? 0) > hud.playerPanel.crowdedThreshold
            ? hud.playerPanel.scaleCrowded
            : hud.playerPanel.scaleDefault);
    const scaledPlayerPanelWidth = playerPanelWidth * playerPanelScale;
    const scaledPlayerPanelHeight = playerPanelHeight * playerPanelScale;

    const rightRail = makeFrame(
        context.canvasWidth - hud.padding - hud.rightRail.width,
        hud.rightRail.topInset,
        hud.rightRail.width,
        context.canvasHeight - hud.rightRail.topInset - hud.rightRail.bottomInset,
    );
    const handWidth = computeHandWidthForViewport(context.canvasWidth);
    const handFrame = makeFrame(
        hud.bottomRail.leftInset,
        context.canvasHeight - hud.bottomRail.handHeight - hud.bottomRail.bottomInset,
        handWidth,
        hud.bottomRail.handHeight,
    );
    const actionBarFrame = makeFrame(
        handFrame.x + handFrame.width + hud.bottomRail.gap,
        context.canvasHeight - hud.actionBar.height - hud.bottomRail.bottomInset,
        computeActionBarWidth(),
        hud.actionBar.height,
    );
    const actionBarSecondaryFrame = makeFrame(
        actionBarFrame.x + hud.actionBar.buttonSpacing - 18,
        actionBarFrame.y - hud.actionBar.height - hud.actionBar.stackGap,
        hud.actionBar.buttonSpacing + hud.actionBar.buttonWidth + 2 * hud.actionBar.buttonInset,
        hud.actionBar.height,
    );
    const boxFrame = makeFrame(
        actionBarFrame.x,
        actionBarSecondaryFrame.y - hud.actionBar.height - hud.actionBar.stackGap,
        hud.actionBar.buttonSpacing * 3 + hud.actionBar.buttonInset * 2 + hud.actionBar.buttonWidth,
        hud.actionBar.height,
    );

    const diceWidth = context.diceWidth ?? 138;
    const diceHeight = context.diceHeight ?? 64;
    const diceX = clamp(
        rightRail.x - hud.dice.rightRailGap - diceWidth,
        hud.padding,
        Math.max(hud.padding, context.canvasWidth - hud.padding - diceWidth),
    );
    const diceY = clamp(
        actionBarFrame.y - hud.dice.aboveActionBarGap - diceHeight,
        hud.dice.minTopInset,
        Math.max(hud.dice.minTopInset, context.canvasHeight - hud.padding - diceHeight),
    );
    const diceFrame = makeFrame(diceX, diceY, diceWidth, diceHeight);

    const playerPanelFrame = makeFrame(
        Math.max(
            hud.padding,
            context.canvasWidth - hud.padding - scaledPlayerPanelWidth,
        ),
        Math.max(
            hud.rightRail.topInset,
            context.canvasHeight -
                scaledPlayerPanelHeight -
                hud.rightRail.bottomInset,
        ),
        scaledPlayerPanelWidth,
        scaledPlayerPanelHeight,
    );
    const bankFrame = makeFrame(
        context.canvasWidth - hud.padding - hud.misc.bankSize,
        Math.max(hud.misc.bankTopMin, playerPanelFrame.y - 95),
        hud.misc.bankSize,
        hud.misc.bankSize,
    );
    const gameLogFrame = makeFrame(
        context.canvasWidth - hud.padding - hud.gameLog.width,
        hud.rightRail.topInset,
        hud.gameLog.width,
        hud.gameLog.height,
    );
    const chatLaneFrame = makeFrame(
        context.canvasWidth - hud.padding - hud.chat.laneWidth,
        gameLogFrame.y + gameLogFrame.height + hud.gap,
        hud.chat.laneWidth,
        hud.chat.laneHeight,
    );
    const resourceBankFrame = makeFrame(
        context.canvasWidth - hud.padding - hud.resourceBank.width,
        chatLaneFrame.y + chatLaneFrame.height + hud.gap,
        hud.resourceBank.width,
        hud.resourceBank.height,
    );
    const chatWindowBottom = Math.max(chat.minWindowBottom, chatLaneFrame.y + chatLaneFrame.height + 2);
    const chatWindowFrame = makeFrame(
        context.canvasWidth - hud.padding - chat.windowWidth,
        chatWindowBottom - chat.windowHeight,
        chat.windowWidth,
        chat.windowHeight,
    );
    const chatInputFrame = makeFrame(
        chatWindowFrame.x + 5,
        chatWindowFrame.y + chat.windowHeight - chat.inputHeight - 6,
        chat.windowWidth - 10,
        chat.inputHeight,
    );

    const specialBuildFrame = makeFrame(
        rightRail.x - hud.misc.specialBuildOffsetX,
        context.canvasHeight - hud.misc.specialBuildOffsetY,
        hud.actionBar.buttonWidth,
        hud.actionBar.buttonWidth,
    );
    const devConfirmationFrame = makeFrame(
        hud.padding,
        context.canvasHeight - hud.bottomRail.handHeight - hud.misc.devConfirmationOffsetY,
        hand.devConfirmationCardWidth + hud.gap,
        hand.devConfirmationButtonHeight,
    );
    const spectatorsFrame = makeFrame(
        hud.misc.spectatorsX,
        hud.misc.spectatorsY,
        48,
        32,
    );
    const turnTimerFrame = makeFrame(
        actionBarFrame.x + actionBarFrame.width - (context.turnTimerWidth ?? 76) - 6,
        actionBarFrame.y + (actionBarFrame.height - (context.turnTimerHeight ?? 36)) / 2,
        context.turnTimerWidth ?? 76,
        context.turnTimerHeight ?? 36,
    );
    const pauseToggleFrame = makeFrame(
        controls.pauseToggle.x,
        controls.pauseToggle.y,
        controls.pauseToggle.size,
        controls.pauseToggle.size,
    );

    return {
        regions: {
            rightRail,
            bottomRail: makeFrame(
                hud.bottomRail.leftInset,
                handFrame.y,
                rightRail.x - hud.bottomRail.leftInset,
                hud.bottomRail.handHeight,
            ),
            topLeftControls: makeFrame(
                0,
                0,
                controls.pauseToggle.x + controls.pauseToggle.size,
                controls.pauseToggle.y + controls.pauseToggle.size,
            ),
        },
        widgets: {
            playerPanel: playerPanelFrame,
            bank: bankFrame,
            actionBar: actionBarFrame,
            actionBarSecondary: actionBarSecondaryFrame,
            actionBarShips: makeFrame(
                diceFrame.x -
                    (hud.actionBar.buttonSpacing + hud.actionBar.buttonWidth + 2 * hud.actionBar.buttonInset) -
                    10,
                actionBarSecondaryFrame.y,
                hud.actionBar.buttonSpacing + hud.actionBar.buttonWidth + 2 * hud.actionBar.buttonInset,
                hud.actionBar.height,
            ),
            knightBox: boxFrame,
            improveBox: boxFrame,
            turnTimer: turnTimerFrame,
            pauseToggle: pauseToggleFrame,
            dice: diceFrame,
            specialBuild: specialBuildFrame,
            hand: handFrame,
            devConfirmation: devConfirmationFrame,
            spectators: spectatorsFrame,
            gameLog: gameLogFrame,
            chatLane: chatLaneFrame,
            chatWindow: chatWindowFrame,
            chatInput: chatInputFrame,
            resourceBank: resourceBankFrame,
        },
        anchors: {
            chatButtonCenter: {
                x: chatLaneFrame.x + chatLaneFrame.width / 2,
                y: chatLaneFrame.y + chatLaneFrame.height / 2,
            },
            chatPopup: {
                x:
                    context.canvasWidth -
                    (chat.popupRightInset + chat.popupTailInset + 10),
                y: chatLaneFrame.y + chatLaneFrame.height / 2,
            },
        },
    };
}
