import * as PIXI from "pixi.js";
import { getBottomDockConfig } from "./uiConfig";
import * as assets from "./assets";

type DockRailOptions = {
    width: number;
    height: number;
    glossHeight?: number;
};

type DockPanelOptions = {
    width: number;
    height: number;
    headerHeight?: number;
};

type DockSlotOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    active?: boolean;
};

type DockSideRailOptions = {
    width: number;
    height: number;
    divider?: boolean;
};

type IconOptions = {
    asset: assets.AssetImage;
    width: number;
    height: number;
    x: number;
    y: number;
};

export function createDockRail({
    width,
    height,
    glossHeight,
}: DockRailOptions) {
    const bottomDock = getBottomDockConfig();
    const container = new PIXI.Container();

    const base = new PIXI.Graphics();
    base.lineStyle({
        color: bottomDock.shell.border,
        width: bottomDock.shell.borderWidth,
    });
    base.beginFill(bottomDock.shell.fill, 0.98);
    base.drawRoundedRect(0, 0, width, height, bottomDock.shell.radius);
    base.endFill();
    container.addChild(base);

    const topGlossHeight = glossHeight ?? Math.max(12, Math.floor(height * 0.32));
    const gloss = new PIXI.Graphics();
    gloss.beginFill(bottomDock.shell.glossFill, bottomDock.shell.glossAlpha);
    gloss.drawRoundedRect(4, 4, width - 8, topGlossHeight, bottomDock.shell.radius - 4);
    gloss.endFill();
    container.addChild(gloss);

    return container;
}

export function createDockPanel({
    width,
    height,
    headerHeight = 0,
}: DockPanelOptions) {
    const bottomDock = getBottomDockConfig();
    const panel = bottomDock.panel;
    const container = new PIXI.Container();

    const base = new PIXI.Graphics();
    base.lineStyle({
        color: panel.border,
        width: panel.borderWidth,
    });
    base.beginFill(panel.fill, 0.98);
    base.drawRoundedRect(0, 0, width, height, panel.radius);
    base.endFill();
    container.addChild(base);

    if (headerHeight > 0) {
        const header = new PIXI.Graphics();
        header.lineStyle({
            color: panel.headerBorder,
            width: 2,
        });
        header.beginFill(panel.headerFill, 0.95);
        header.drawRoundedRect(
            panel.inset,
            panel.inset,
            width - panel.inset * 2,
            headerHeight,
            Math.max(8, panel.radius - 6),
        );
        header.endFill();
        container.addChild(header);
    }

    const gloss = new PIXI.Graphics();
    gloss.beginFill(panel.glossFill, panel.glossAlpha);
    gloss.drawRoundedRect(
        panel.inset,
        panel.inset,
        width - panel.inset * 2,
        Math.max(12, Math.floor(height * 0.22)),
        Math.max(8, panel.radius - 6),
    );
    gloss.endFill();
    container.addChild(gloss);

    return container;
}

export function createDockSlot({
    x,
    y,
    width,
    height,
    active = false,
}: DockSlotOptions) {
    const bottomDock = getBottomDockConfig();
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;

    const slot = new PIXI.Graphics();
    slot.lineStyle({
        color: active ? bottomDock.slot.activeBorder : bottomDock.slot.border,
        width: bottomDock.slot.borderWidth,
    });
    slot.beginFill(active ? bottomDock.slot.activeFill : bottomDock.slot.fill, 0.97);
    slot.drawRoundedRect(0, 0, width, height, bottomDock.slot.radius);
    slot.endFill();
    container.addChild(slot);

    const gloss = new PIXI.Graphics();
    gloss.beginFill(bottomDock.slot.glossFill, bottomDock.slot.glossAlpha);
    gloss.drawRoundedRect(3, 3, width - 6, Math.max(10, Math.floor(height * 0.24)), bottomDock.slot.radius - 4);
    gloss.endFill();
    container.addChild(gloss);

    return container;
}

export function createDockSideRail({
    width,
    height,
    divider = true,
}: DockSideRailOptions) {
    const bottomDock = getBottomDockConfig();
    const container = new PIXI.Container();

    const rail = new PIXI.Graphics();
    rail.beginFill(bottomDock.rail.fill, 0.96);
    rail.drawRoundedRect(0, 0, width, height, bottomDock.rail.radius);
    rail.endFill();
    container.addChild(rail);

    if (divider) {
        const line = new PIXI.Graphics();
        line.beginFill(bottomDock.rail.dividerFill, 0.2);
        line.drawRect(width - 2, 6, 2, height - 12);
        line.endFill();
        container.addChild(line);
    }

    return container;
}

export function createCountChip(width: number, height: number) {
    const bottomDock = getBottomDockConfig();
    const sprite = new PIXI.Sprite();
    const g = new PIXI.Graphics();
    g.beginFill(bottomDock.chip.fill);
    g.drawRoundedRect(0, 0, width, height, bottomDock.chip.radius);
    g.endFill();
    sprite.texture = PIXI.RenderTexture.create({ width, height });
    return { sprite, graphic: g };
}

export function addIconSprite(container: PIXI.Container, options: IconOptions) {
    const sprite = new PIXI.Sprite();
    assets.assignTexture(sprite, options.asset);
    sprite.width = options.width;
    sprite.height = options.height;
    sprite.x = options.x;
    sprite.y = options.y;
    container.addChild(sprite);
    return sprite;
}

export function createPanelTitleTextStyle(
    overrides?: Partial<PIXI.ITextStyle>,
) {
    const panel = getBottomDockConfig().panel;
    return new PIXI.TextStyle({
        fontFamily: panel.fontFamily,
        fontSize: panel.titleFontSize,
        fill: panel.titleText,
        fontWeight: "bold",
        ...overrides,
    });
}

export function createPanelBodyTextStyle(
    overrides?: Partial<PIXI.ITextStyle>,
) {
    const panel = getBottomDockConfig().panel;
    return new PIXI.TextStyle({
        fontFamily: panel.fontFamily,
        fontSize: panel.bodyFontSize,
        fill: panel.bodyText,
        ...overrides,
    });
}

export function createPanelCaptionTextStyle(
    overrides?: Partial<PIXI.ITextStyle>,
) {
    const panel = getBottomDockConfig().panel;
    return new PIXI.TextStyle({
        fontFamily: panel.fontFamily,
        fontSize: panel.captionFontSize,
        fill: panel.titleText,
        ...overrides,
    });
}
