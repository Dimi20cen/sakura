import * as PIXI from "pixi.js";
import * as assets from "./assets";
import * as canvas from "./canvas";
import * as windows from "./windows";
import { sound } from "@pixi/sound";
import { GameSettings } from "../tsg";
import { DISPLAY_GAME_MODE, GAME_MODE } from "./lobby";
import { capitalizeFirstLetter } from "../utils";
import { getCommandHub, isSpectator } from "./ws";
import {
    getSettingsButtonConfig,
    getSettingsPanelConfig,
} from "./uiConfig";
import {
    createPanelBodyTextStyle,
    createPanelTitleTextStyle,
} from "./uiDock";

export let settingsContainer: PIXI.Container;
export let settingsMenuContainer: PIXI.Container;
export let settingDetailsContainer: PIXI.Container;
let gameSettings: GameSettings;
let pauseMenuText: PIXI.Text | null = null;
let muteMenuText: PIXI.Text | null = null;
let paused = false;

function rerender() {
    canvas.app.markDirty();
}

function hidePanels() {
    if (settingsMenuContainer && !settingsMenuContainer.destroyed) {
        settingsMenuContainer.visible = false;
    }
    if (settingDetailsContainer && !settingDetailsContainer.destroyed) {
        settingDetailsContainer.visible = false;
    }
}

function getPauseLabel() {
    return paused ? "Resume Game" : "Pause Game";
}

function refreshPauseMenuLabel() {
    if (!pauseMenuText || pauseMenuText.destroyed) {
        return;
    }
    pauseMenuText.text = getPauseLabel();
}

function isMuted() {
    return Boolean(sound.context?.muted);
}

function getMuteLabel() {
    return isMuted() ? "Unmute Game" : "Mute Game";
}

function refreshMuteMenuLabel() {
    if (!muteMenuText || muteMenuText.destroyed) {
        return;
    }
    muteMenuText.text = getMuteLabel();
}

function createMenuOption(
    text: string,
    y: number,
    onClick: () => void,
    disabled = false,
) {
    const row = new PIXI.Container();
    row.x = 8;
    row.y = y;
    row.interactive = !disabled;
    row.cursor = disabled ? "default" : "pointer";

    const label = new PIXI.Text(
        text,
        createPanelTitleTextStyle({
            fontSize: 14,
            fill: disabled ? 0x666666 : 0x000000,
            align: "left",
            fontWeight: "bold",
        }),
    );
    row.addChild(label);

    if (!disabled) {
        row.on("pointerdown", (event) => {
            event.stopPropagation();
            onClick();
            rerender();
        });
    }

    return { row, label };
}

export function initialize(s: GameSettings) {
    gameSettings = s;
    const settingsButton = getSettingsButtonConfig();
    const settingsPanel = getSettingsPanelConfig();

    hidePanels();

    settingsContainer = new PIXI.Container();
    const settingsSprite = new PIXI.Sprite();
    assets.assignTexture(settingsSprite, assets.settings);
    settingsSprite.scale.set(settingsButton.iconScale);
    settingsSprite.anchor.x = 0.5;
    settingsSprite.anchor.y = 0.5;
    settingsSprite.x = settingsButton.iconX;
    settingsSprite.y = settingsButton.iconY;
    settingsContainer.x = settingsButton.x;
    settingsContainer.y = settingsButton.y;
    settingsContainer.zIndex = 900;
    settingsContainer.addChild(settingsSprite);
    settingsContainer.interactive = true;
    settingsContainer.cursor = "pointer";

    settingsMenuContainer = new PIXI.Container();
    settingsMenuContainer.addChild(windows.getWindowSprite(170, 116));
    settingsMenuContainer.x = settingsPanel.detailsX;
    settingsMenuContainer.y = settingsPanel.detailsY;
    settingsMenuContainer.zIndex = 20000;
    settingsMenuContainer.visible = false;

    const gameSettingsOption = createMenuOption("Game Settings", 12, () => {
        settingDetailsContainer.visible = !settingDetailsContainer.visible;
    });
    settingsMenuContainer.addChild(gameSettingsOption.row);

    const pauseOption = createMenuOption(
        getPauseLabel(),
        44,
        () => {
            getCommandHub().togglePause();
            settingsMenuContainer.visible = false;
        },
        isSpectator(),
    );
    pauseMenuText = pauseOption.label;
    settingsMenuContainer.addChild(pauseOption.row);

    const muteOption = createMenuOption(getMuteLabel(), 76, () => {
        if (isMuted()) {
            sound.unmuteAll();
        } else {
            sound.muteAll();
        }
        refreshMuteMenuLabel();
    });
    muteMenuText = muteOption.label;
    settingsMenuContainer.addChild(muteOption.row);

    settingDetailsContainer = new PIXI.Container();
    settingDetailsContainer.addChild(
        windows.getWindowSprite(
            settingsPanel.detailsWidth,
            settingsPanel.detailsHeight,
        ),
    );
    settingDetailsContainer.x = settingsPanel.detailsX;
    settingDetailsContainer.y = settingsPanel.detailsY;
    settingDetailsContainer.zIndex = 20000;
    settingDetailsContainer.visible = false;

    const addSettingsText = (text: string, idx: number) => {
        const t = new PIXI.Text(
            text,
            createPanelBodyTextStyle({
                fontSize: settingsPanel.fontSize,
                fill: 0x000000,
                align: "left",
                fontWeight: "bold",
            }),
        );
        t.x = settingsPanel.titleX;
        t.y =
            idx === 0
                ? settingsPanel.rowStartY
                : settingsPanel.rowStartY + settingsPanel.rowStep * idx;
        settingDetailsContainer.addChild(t);
    };
    addSettingsText("Game Settings", 0);
    addSettingsText(
        `Mode: ${DISPLAY_GAME_MODE[gameSettings.Mode as GAME_MODE]}`,
        1,
    );
    addSettingsText(`Private: ${gameSettings.Private ? "Yes" : "No"}`, 2);
    addSettingsText(`Map: ${gameSettings.MapName}`, 3);
    addSettingsText(`Discard Limit: ${gameSettings.DiscardLimit}`, 4);
    addSettingsText(`Victory Points: ${gameSettings.VictoryPoints}`, 5);
    addSettingsText(`Max Players: ${gameSettings.MaxPlayers}`, 6);
    addSettingsText(
        `Special Build Phase: ${gameSettings.SpecialBuild ? "Yes" : "No"}`,
        7,
    );
    addSettingsText(`Karma: ${gameSettings.EnableKarma ? "Yes" : "No"}`, 8);
    addSettingsText(`Speed: ${capitalizeFirstLetter(gameSettings.Speed)}`, 9);
    addSettingsText(`Advanced Mode: ${gameSettings.Advanced ? "Yes" : "No"}`, 10);

    settingsContainer.on("pointerdown", (event) => {
        event.stopPropagation();
        settingsMenuContainer.visible = !settingsMenuContainer.visible;
        if (!settingsMenuContainer.visible) {
            settingDetailsContainer.visible = false;
        }
        rerender();
    });

    canvas.app.stage.addChild(settingsContainer);
    canvas.app.stage.addChild(settingsMenuContainer);
    canvas.app.stage.addChild(settingDetailsContainer);
    refreshPauseMenuLabel();
    refreshMuteMenuLabel();
}

export function setPaused(isPaused: boolean) {
    paused = isPaused;
    refreshPauseMenuLabel();
    rerender();
}
