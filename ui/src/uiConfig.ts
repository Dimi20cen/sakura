type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type SakuraUIConfig = {
    canvas: {
        width: number;
        height: number;
        resolution: number;
    };
    controls: {
        fullscreenButton: {
            x: number;
            y: number;
            size: number;
        };
        settingsButton: {
            x: number;
            y: number;
            iconX: number;
            iconY: number;
            iconScale: number;
        };
        pauseToggle: {
            x: number;
            y: number;
            size: number;
        };
    };
    hud: {
        padding: number;
        gap: number;
        playerPanel: {
            width: number;
            rowHeight: number;
            headerOffset: number;
            scaleDefault: number;
            scaleCrowded: number;
            crowdedThreshold: number;
            highlightRowHeight: number;
        };
        rightRail: {
            width: number;
            bottomInset: number;
            topInset: number;
        };
        gameLog: {
            width: number;
            height: number;
            visibleRows: number;
        };
        chat: {
            laneWidth: number;
            laneHeight: number;
            windowWidth: number;
            windowHeight: number;
            minWindowBottom: number;
            popupRightInset: number;
            popupTailInset: number;
            inputInsetRight: number;
            inputInsetBottom: number;
            inputHeight: number;
            inputBorderWidth: number;
            inputHorizontalPadding: number;
        };
        resourceBank: {
            width: number;
            height: number;
        };
        bottomRail: {
            leftInset: number;
            bottomInset: number;
            gap: number;
            handHeight: number;
            handMinWidth: number;
            handMaxWidth: number;
        };
        actionBar: {
            innerOffset: number;
            buttonSpacing: number;
            buttonCount: number;
            height: number;
            buttonWidth: number;
            buttonInset: number;
            countWidth: number;
            countHeight: number;
            countFontSize: number;
            stackGap: number;
        };
        dice: {
            rightRailGap: number;
            aboveActionBarGap: number;
            minTopInset: number;
        };
        misc: {
            bankSize: number;
            bankTopMin: number;
            devConfirmationOffsetY: number;
            specialBuildOffsetX: number;
            specialBuildOffsetY: number;
            spectatorsX: number;
            spectatorsY: number;
        };
    };
    windows: {
        borderColor: number;
        borderWidth: number;
        fillColor: number;
        fillAlpha: number;
        cornerRadius: number;
        yesNo: {
            width: number;
            height: number;
            buttonSize: number;
            inset: number;
            gap: number;
        };
        tooltip: {
            fontSize: number;
            wordWrapWidth: number;
            maxWidth: number;
            padding: number;
            cardWidth: number;
            cardGap: number;
            viewportInset: number;
            offsetX: number;
            offsetY: number;
        };
        errorModal: {
            width: number;
            height: number;
            titleFontSize: number;
            bodyFontSize: number;
            bodyWidth: number;
            closeButtonSize: number;
        };
    };
    bottomDock: {
        shell: {
            fill: number;
            border: number;
            borderWidth: number;
            radius: number;
            glossFill: number;
            glossAlpha: number;
        };
        slot: {
            fill: number;
            border: number;
            borderWidth: number;
            radius: number;
            glossFill: number;
            glossAlpha: number;
            activeFill: number;
            activeBorder: number;
        };
        rail: {
            fill: number;
            radius: number;
            dividerFill: number;
        };
        chip: {
            fill: number;
            border: number;
            text: number;
            radius: number;
        };
        timer: {
            fill: number;
            border: number;
            stripFill: number;
            text: number;
            subtext: number;
        };
    };
    overlays: {
        pendingAction: {
            x: number;
            y: number;
            width: number;
            height: number;
            closeButtonSize: number;
            textX: number;
            textY: number;
            fontSize: number;
        };
        setupPreview: {
            buttonSize: number;
            singleWidth: number;
            dualWidth: number;
            height: number;
            offsetY: number;
            padding: number;
            secondaryButtonX: number;
        };
        chooseDice: {
            dieWidth: number;
            gap: number;
            padding: number;
            rowGap: number;
            anchorX: number;
            bottomOffset: number;
        };
        chooseBuildable: {
            singleWidth: number;
            dualWidth: number;
            height: number;
            defaultX: number;
            bottomOffset: number;
            margin: number;
            topOffset: number;
            bottomPlacementOffset: number;
            buttonSize: number;
            buttonY: number;
            singleButtonX: number;
            dualLeftX: number;
            dualRightX: number;
        };
        gameOver: {
            width: number;
            playerRowHeight: number;
            extraHeight: number;
            titleFontSize: number;
            titleY: number;
            pivotYDivisor: number;
        };
    };
    trade: {
        editor: {
            offerWidth: number;
            windowHeight: number;
            cardWidth: number;
            leftX: number;
            panelGap: number;
            rowGap: number;
            bottomOffset: number;
            askExtraOffset: number;
            compactAskBaseWidth: number;
            ckAskBaseWidth: number;
            ckPossibleAskWidth: number;
            basePossibleAskWidth: number;
            contentInsetLeft: number;
            railWidth: number;
            railRadius: number;
            iconSize: number;
            surfaceFill: number;
            surfaceBorder: number;
            surfaceBorderWidth: number;
            railFill: number;
            actionRailGap: number;
        };
        offers: {
            laneRightOffset: number;
            laneTop: number;
            laneGap: number;
            scale: number;
            cardWindowWidth: number;
            cardWindowHeight: number;
            cardWidth: number;
            panelGap: number;
            markerPlusX: number;
            markerPlusY: number;
            markerMinusX: number;
            markerMinusY: number;
            acceptAvatarStep: number;
            acceptPanelPadding: number;
            acceptPanelHeight: number;
            counterButtonWindowSize: number;
            offererPanelWidth: number;
            offererPanelHeight: number;
            offererOffsetX: number;
            enterAnimationOffsetX: number;
        };
    };
    settingsPanel: {
        detailsWidth: number;
        detailsHeight: number;
        detailsX: number;
        detailsY: number;
        titleX: number;
        rowStartY: number;
        rowStep: number;
        fontSize: number;
    };
    hand: {
        devConfirmationCardWidth: number;
        devConfirmationButtonGap: number;
        devConfirmationButtonHeight: number;
    };
};

export type SakuraUIPresetName =
    | "default"
    | "compact"
    | "mobileLandscape";

export const DEFAULT_UI_CONFIG: SakuraUIConfig = {
    canvas: {
        width: 1200,
        height: 800,
        resolution: 1.25,
    },
    controls: {
        fullscreenButton: {
            x: 20,
            y: 64,
            size: 30,
        },
        settingsButton: {
            x: 10,
            y: 10,
            iconX: 25,
            iconY: 25,
            iconScale: 0.3,
        },
        pauseToggle: {
            x: 20,
            y: 108,
            size: 36,
        },
    },
    hud: {
        padding: 12,
        gap: 8,
        playerPanel: {
            width: 250,
            rowHeight: 80,
            headerOffset: 15,
            scaleDefault: 1.08,
            scaleCrowded: 1,
            crowdedThreshold: 4,
            highlightRowHeight: 79,
        },
        rightRail: {
            width: 292,
            bottomInset: 6,
            topInset: 4,
        },
        gameLog: {
            width: 270,
            height: 300,
            visibleRows: 13,
        },
        chat: {
            laneWidth: 270,
            laneHeight: 34,
            windowWidth: 250,
            windowHeight: 160,
            minWindowBottom: 250,
            popupRightInset: 20,
            popupTailInset: 50,
            inputInsetRight: 25,
            inputInsetBottom: 256,
            inputHeight: 25,
            inputBorderWidth: 2,
            inputHorizontalPadding: 4,
        },
        resourceBank: {
            width: 270,
            height: 66,
        },
        bottomRail: {
            leftInset: 10,
            bottomInset: 8,
            gap: 8,
            handHeight: 90,
            handMinWidth: 260,
            handMaxWidth: 900,
        },
        actionBar: {
            innerOffset: 12,
            buttonSpacing: 74,
            buttonCount: 5,
            height: 90,
            buttonWidth: 66,
            buttonInset: 12,
            countWidth: 20,
            countHeight: 19,
            countFontSize: 13,
            stackGap: 10,
        },
        dice: {
            rightRailGap: 10,
            aboveActionBarGap: 10,
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
        },
    },
    windows: {
        borderColor: 0x000000,
        borderWidth: 2,
        fillColor: 0xffffff,
        fillAlpha: 0.9,
        cornerRadius: 4,
        yesNo: {
            width: 42,
            height: 80,
            buttonSize: 32,
            inset: 5,
            gap: 8,
        },
        tooltip: {
            fontSize: 14,
            wordWrapWidth: 200,
            maxWidth: 210,
            padding: 5,
            cardWidth: 32,
            cardGap: 5,
            viewportInset: 5,
            offsetX: 10,
            offsetY: 5,
        },
        errorModal: {
            width: 300,
            height: 300,
            titleFontSize: 28,
            bodyFontSize: 16,
            bodyWidth: 260,
            closeButtonSize: 40,
        },
    },
    bottomDock: {
        shell: {
            fill: 0x8b5727,
            border: 0x5b3318,
            borderWidth: 3,
            radius: 18,
            glossFill: 0xffe1a8,
            glossAlpha: 0.14,
        },
        slot: {
            fill: 0x6a3e1c,
            border: 0x5a341a,
            borderWidth: 2,
            radius: 14,
            glossFill: 0xffe1a8,
            glossAlpha: 0.1,
            activeFill: 0x69b84c,
            activeBorder: 0x0d5f2d,
        },
        rail: {
            fill: 0x10bfd0,
            radius: 14,
            dividerFill: 0x0f79c8,
        },
        chip: {
            fill: 0x064dd1,
            border: 0xffffff,
            text: 0xffffff,
            radius: 4,
        },
        timer: {
            fill: 0xf1ead7,
            border: 0x0b6c8c,
            stripFill: 0x17b6cf,
            text: 0x5a341a,
            subtext: 0x0b6c8c,
        },
    },
    overlays: {
        pendingAction: {
            x: 20,
            y: 20,
            width: 450,
            height: 40,
            closeButtonSize: 38,
            textX: 10,
            textY: 20,
            fontSize: 20,
        },
        setupPreview: {
            buttonSize: 52,
            singleWidth: 62,
            dualWidth: 118,
            height: 62,
            offsetY: 78,
            padding: 5,
            secondaryButtonX: 61,
        },
        chooseDice: {
            dieWidth: 40,
            gap: 5,
            padding: 10,
            rowGap: 15,
            anchorX: 20,
            bottomOffset: 140,
        },
        chooseBuildable: {
            singleWidth: 76,
            dualWidth: 140,
            height: 62,
            defaultX: 20,
            bottomOffset: 140,
            margin: 10,
            topOffset: 16,
            bottomPlacementOffset: 16,
            buttonSize: 52,
            buttonY: 6,
            singleButtonX: 12,
            dualLeftX: 10,
            dualRightX: 74,
        },
        gameOver: {
            width: 450,
            playerRowHeight: 95,
            extraHeight: 80,
            titleFontSize: 32,
            titleY: 30,
            pivotYDivisor: 4,
        },
    },
    trade: {
        editor: {
            offerWidth: 440,
            windowHeight: 90,
            cardWidth: 52,
            leftX: 20,
            panelGap: 20,
            rowGap: 10,
            bottomOffset: 20,
            askExtraOffset: 110,
            compactAskBaseWidth: 440,
            ckAskBaseWidth: 440,
            ckPossibleAskWidth: 440,
            basePossibleAskWidth: 440,
            contentInsetLeft: 70,
            railWidth: 56,
            railRadius: 14,
            iconSize: 26,
            surfaceFill: 0xe9e4db,
            surfaceBorder: 0x0f79c8,
            surfaceBorderWidth: 3,
            railFill: 0x10bfd0,
            actionRailGap: 8,
        },
        offers: {
            laneRightOffset: 430,
            laneTop: 20,
            laneGap: 70,
            scale: 0.8,
            cardWindowWidth: 250,
            cardWindowHeight: 80,
            cardWidth: 40,
            panelGap: 30,
            markerPlusX: 263,
            markerPlusY: -8,
            markerMinusX: 260,
            markerMinusY: -20,
            acceptAvatarStep: 50,
            acceptPanelPadding: 10,
            acceptPanelHeight: 80,
            counterButtonWindowSize: 42,
            offererPanelWidth: 60,
            offererPanelHeight: 80,
            offererOffsetX: -70,
            enterAnimationOffsetX: 40,
        },
    },
    settingsPanel: {
        detailsWidth: 170,
        detailsHeight: 240,
        detailsX: 15,
        detailsY: 65,
        titleX: 10,
        rowStartY: 10,
        rowStep: 20,
        fontSize: 13,
    },
    hand: {
        devConfirmationCardWidth: 120,
        devConfirmationButtonGap: 10,
        devConfirmationButtonHeight: 80,
    },
};

let activeUIConfig: SakuraUIConfig = structuredClone(DEFAULT_UI_CONFIG);

const UI_PRESET_OVERRIDES: Record<
    SakuraUIPresetName,
    DeepPartial<SakuraUIConfig>
> = {
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
                rightRailGap: 8,
                aboveActionBarGap: 8,
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeConfig<T extends Record<string, unknown>>(
    base: T,
    overrides: DeepPartial<T>,
): T {
    const output: Record<string, unknown> = { ...base };

    Object.entries(overrides).forEach(([key, overrideValue]) => {
        if (overrideValue === undefined) {
            return;
        }

        const baseValue = output[key];
        output[key] =
            isPlainObject(baseValue) && isPlainObject(overrideValue)
                ? mergeConfig(
                      baseValue as Record<string, unknown>,
                      overrideValue as DeepPartial<Record<string, unknown>>,
                  )
                : overrideValue;
    });

    return output as T;
}

export function getUIConfig() {
    return activeUIConfig;
}

export function configureUI(overrides: DeepPartial<SakuraUIConfig>) {
    activeUIConfig = mergeConfig(activeUIConfig, overrides);
    return activeUIConfig;
}

export function configureUIPreset(
    presetName: SakuraUIPresetName,
    overrides?: DeepPartial<SakuraUIConfig>,
) {
    const preset = UI_PRESET_OVERRIDES[presetName];
    activeUIConfig = mergeConfig(
        mergeConfig(DEFAULT_UI_CONFIG, preset),
        overrides ?? {},
    );
    return activeUIConfig;
}

export function resetUIConfig() {
    activeUIConfig = structuredClone(DEFAULT_UI_CONFIG);
    return activeUIConfig;
}

export function getAvailableUIPresets(): SakuraUIPresetName[] {
    return Object.keys(UI_PRESET_OVERRIDES) as SakuraUIPresetName[];
}
