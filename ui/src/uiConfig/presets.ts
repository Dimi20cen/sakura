import type { DeepPartial, UIConfig, UIPresetName } from "./types.ts";

export const presetOverrides: Record<UIPresetName, DeepPartial<UIConfig>> = {
    default: {},
    compact: {
        controls: {
            fullscreenButton: {
                x: 16,
                y: 52,
                size: 28,
            },
            pauseToggle: {
                x: 16,
                y: 92,
                size: 32,
            },
        },
        hud: {
            padding: 10,
            gap: 6,
            playerPanel: {
                scaleDefault: 1,
            },
            rightRail: {
                width: 276,
            },
            gameLog: {
                width: 252,
                height: 260,
                visibleRows: 11,
            },
            chat: {
                laneWidth: 252,
                windowWidth: 236,
                windowHeight: 148,
            },
            resourceBank: {
                width: 252,
            },
            bottomRail: {
                gap: 6,
                handMinWidth: 220,
            },
            actionBar: {
                buttonSpacing: 68,
                buttonWidth: 60,
                buttonInset: 10,
                height: 82,
            },
            dice: {
                rightRailGap: 28,
                aboveActionBarGap: 14,
            },
        },
        overlays: {
            chooseDice: {
                dieWidth: 36,
            },
            chooseBuildable: {
                buttonSize: 48,
            },
            setupPreview: {
                buttonSize: 48,
                singleWidth: 58,
                dualWidth: 110,
                height: 58,
                secondaryButtonX: 57,
            },
        },
        trade: {
            editor: {
                offerWidth: 340,
                cardWidth: 48,
                rowGap: 8,
                compactAskBaseWidth: 16 + 48 * 5,
                ckAskBaseWidth: 16 + 48 * 6 + 30,
                ckPossibleAskWidth: 16 + 48 * 8,
                basePossibleAskWidth: 16 + 48 * 5,
                contentInsetLeft: 62,
                railWidth: 50,
                iconSize: 24,
            },
            offers: {
                laneRightOffset: 395,
                cardWindowWidth: 220,
                cardWidth: 36,
            },
        },
    },
    mobileLandscape: {
        controls: {
            fullscreenButton: {
                x: 12,
                y: 40,
                size: 24,
            },
            pauseToggle: {
                x: 12,
                y: 74,
                size: 28,
            },
            settingsButton: {
                x: 6,
                y: 6,
                iconX: 20,
                iconY: 20,
                iconScale: 0.24,
            },
        },
        hud: {
            padding: 8,
            gap: 6,
            playerPanel: {
                width: 230,
                rowHeight: 72,
                headerOffset: 12,
                scaleDefault: 0.94,
                scaleCrowded: 0.9,
            },
            rightRail: {
                width: 250,
            },
            gameLog: {
                width: 228,
                height: 220,
                visibleRows: 9,
            },
            chat: {
                laneWidth: 228,
                laneHeight: 30,
                windowWidth: 220,
                windowHeight: 132,
                inputInsetRight: 18,
                inputInsetBottom: 214,
            },
            resourceBank: {
                width: 228,
                height: 60,
            },
            bottomRail: {
                leftInset: 8,
                bottomInset: 6,
                gap: 6,
                handHeight: 82,
                handMinWidth: 180,
                handMaxWidth: 640,
            },
            actionBar: {
                innerOffset: 10,
                buttonSpacing: 60,
                height: 76,
                buttonWidth: 52,
                buttonInset: 8,
                countWidth: 18,
                countHeight: 17,
                countFontSize: 12,
                stackGap: 8,
            },
            dice: {
                rightRailGap: 24,
                aboveActionBarGap: 12,
                minTopInset: 12,
            },
            misc: {
                specialBuildOffsetY: 220,
            },
        },
        overlays: {
            pendingAction: {
                width: 360,
                fontSize: 17,
            },
            chooseDice: {
                dieWidth: 32,
                gap: 4,
                bottomOffset: 116,
            },
            chooseBuildable: {
                singleWidth: 68,
                dualWidth: 126,
                height: 56,
                bottomOffset: 116,
                buttonSize: 44,
                buttonY: 5,
                singleButtonX: 12,
                dualLeftX: 9,
                dualRightX: 70,
            },
            setupPreview: {
                buttonSize: 44,
                singleWidth: 54,
                dualWidth: 102,
                height: 54,
                offsetY: 68,
                secondaryButtonX: 53,
            },
            gameOver: {
                width: 390,
                playerRowHeight: 84,
                extraHeight: 70,
                titleFontSize: 28,
            },
        },
        settingsPanel: {
            detailsWidth: 156,
            detailsHeight: 228,
            detailsX: 10,
            detailsY: 52,
        },
        trade: {
            editor: {
                offerWidth: 300,
                windowHeight: 82,
                cardWidth: 44,
                leftX: 12,
                panelGap: 12,
                rowGap: 8,
                bottomOffset: 12,
                askExtraOffset: 96,
                compactAskBaseWidth: 16 + 44 * 5,
                ckAskBaseWidth: 16 + 44 * 6 + 30,
                ckPossibleAskWidth: 16 + 44 * 8,
                basePossibleAskWidth: 16 + 44 * 5,
                contentInsetLeft: 56,
                railWidth: 44,
                iconSize: 20,
            },
            offers: {
                laneRightOffset: 350,
                laneGap: 62,
                scale: 0.72,
                cardWindowWidth: 200,
                cardWindowHeight: 72,
                cardWidth: 32,
                panelGap: 22,
                markerPlusX: 214,
                markerMinusX: 210,
                acceptAvatarStep: 44,
                acceptPanelHeight: 72,
                offererPanelHeight: 72,
                offererOffsetX: -58,
                enterAnimationOffsetX: 28,
            },
        },
    },
};
