import * as PIXI from "pixi.js";
import * as canvas from "./canvas";
import * as buttons from "./buttons";
import { getCardTexture } from "./hand";
import { getUIConfig } from "./uiConfig";

let currentErrorWindow: PIXI.Container | undefined;

/**
 * Create a new window background sprite
 * @param width Width of the window
 * @param height Height of the window
 */
export function getWindowSprite(width: number, height: number) {
    const { windows } = getUIConfig();
    const s = new PIXI.Sprite();
    const g = new PIXI.Graphics();
    g.lineStyle({
        color: windows.borderColor,
        width: windows.borderWidth,
    });
    g.beginFill(windows.fillColor, windows.fillAlpha);
    g.drawRoundedRect(0, 0, width, height, windows.cornerRadius);
    g.endFill();
    s.addChild(g);
    return s;
}

export class YesNoWindow {
    private _yesEnabled: boolean = false;
    private _noEnabled: boolean = false;
    public orientation: "vertical" | "horizontal" = "vertical";

    public container = new PIXI.Container();
    public _yesButton?: buttons.ButtonSprite;
    public _noButton?: buttons.ButtonSprite;

    private yesFun?: () => void;
    private noFun?: () => void;

    constructor(private x: number, private y: number) {
        return this;
    }

    /**
     * Set callback for yes button and make it enabled.
     * @param fun callback
     */
    public onYes(fun: () => void) {
        this.yesEnabled = true;
        this.yesFun = fun;
        return this;
    }

    /**
     * Set callback for no button and make it enabled.
     * @param fun callback
     */
    public onNo(fun: () => void) {
        this.noEnabled = true;
        this.noFun = fun;
        return this;
    }

    /**
     * Render the window
     */
    public render() {
        if (this._yesButton || this._noButton) {
            return this;
        }

        const yesNo = getUIConfig().windows.yesNo;
        this.container.addChild(getWindowSprite(yesNo.width, yesNo.height));
        this.container.x = this.x;
        this.container.y = this.y;

        this._yesButton = buttons.getButtonSprite(
            buttons.ButtonType.Yes,
            yesNo.buttonSize,
            yesNo.buttonSize,
        );
        this._noButton = buttons.getButtonSprite(
            buttons.ButtonType.No,
            yesNo.buttonSize,
            yesNo.buttonSize,
        );
        this._yesButton.setEnabled(this._yesEnabled);
        this._noButton.setEnabled(this._noEnabled);
        this.container.addChild(this._yesButton);
        this.container.addChild(this._noButton);

        // Yes
        this._yesButton.x = yesNo.inset;
        this._yesButton.y = yesNo.inset;
        this._yesButton.onClick(() => this.yesFun?.());

        // No
        this._noButton.x = yesNo.inset;
        this._noButton.y = yesNo.inset + yesNo.buttonSize + yesNo.gap;
        this._noButton.onClick(() => this.noFun?.());

        return this;
    }

    public get yesEnabled() {
        return this._yesEnabled;
    }

    public set yesEnabled(enabled: boolean) {
        if (
            this._yesEnabled !== enabled ||
            this._yesButton?.cursor !== (enabled ? "pointer" : "default")
        ) {
            this._yesButton?.setEnabled(enabled);
        }
        this._yesEnabled = enabled;
    }

    public get noEnabled() {
        return this._noEnabled;
    }

    public set noEnabled(enabled: boolean) {
        if (
            this._noEnabled !== enabled ||
            this._noButton?.cursor !== (enabled ? "pointer" : "default")
        ) {
            this._noButton?.setEnabled(enabled);
        }
        this._noEnabled = enabled;
    }

    /**
     * Destroy the window and its children
     */
    public destroy() {
        this.container.destroy({ children: true });
    }
}

/**
 * Show an error message to the user.
 * Only one error message is shown at a time.
 * @param titleMessage Title of the window
 * @param message Error message
 */
export function showErrorWindow(titleMessage: string, message: string) {
    console.error(titleMessage, message);
    const modal = getUIConfig().windows.errorModal;

    if (currentErrorWindow && !currentErrorWindow.destroyed) {
        currentErrorWindow.destroy({ children: true });
    }

    const errorWindow = getWindowSprite(modal.width, modal.height);
    errorWindow.pivot.x = modal.width / 2;
    errorWindow.pivot.y = modal.height / 2;
    errorWindow.x = canvas.getWidth() / 2;
    errorWindow.y = window.innerHeight / 2 - 20;
    canvas.app.stage.addChild(errorWindow);
    canvas.app.markDirty();
    currentErrorWindow = errorWindow;

    const title = new PIXI.Text(titleMessage, {
        fontFamily: "sans-serif",
        fontSize: modal.titleFontSize,
        fill: 0x000000,
        align: "center",
    });
    title.style.fontWeight = "bold";
    title.anchor.x = 0.5;
    title.x = modal.width / 2;
    title.y = 30;
    errorWindow.addChild(title);

    const description = new PIXI.Text(message, {
        fontFamily: "sans-serif",
        fontSize: modal.bodyFontSize,
        fill: 0x000000,
        align: "left",
        wordWrap: true,
        wordWrapWidth: modal.bodyWidth,
    });
    description.x = 20;
    description.y = 80;
    errorWindow.addChild(description);

    const cross = buttons.getButtonSprite(
        buttons.ButtonType.No,
        modal.closeButtonSize,
        modal.closeButtonSize,
    );
    cross.pivot.x = modal.closeButtonSize;
    cross.x = modal.width;
    cross.y = 0;
    cross.onClick(() => {
        errorWindow.destroy({ children: true });
        canvas.app.markDirty();
    });
    cross.setEnabled(true);
    errorWindow.addChild(cross);
}

export class TooltipHandler {
    private window?: PIXI.Sprite;
    private timer: number = 0;
    private cards: number[] = [];

    /**
     * Create a new tooltip handler
     * @param target Target container to show the tooltip on
     * @param message Text to show in the tooltip
     * @param timeout Timeout in milliseconds before the tooltip is shown
     */
    constructor(
        private target: PIXI.Container,
        public message: string,
        public timeout: number = 300,
    ) {
        target.on("mouseover", () => {
            this.timer = window.setTimeout(() => {
                this.timer = 0;
                this.makeWindow();
                canvas.app.stage.addChild(this.window!);
                canvas.app.markDirty();
            }, this.timeout);
        });

        target.on("mouseout", () => {
            this.hide();
        });

        target.on("removed", () => {
            window.clearTimeout(this.timer);
        });

        return this;
    }

    /**
     * Set the cards to build
     * @param cards List of cardtypes needed to build this
     */
    public setCards(cards: number[]) {
        this.cards = cards;
        return this;
    }

    /**
     * Hide the tooltip if shown
     */
    public hide() {
        this.window?.destroy({ children: true });
        this.window = undefined;
        canvas.app.markDirty();
        window.clearTimeout(this.timer);
        return this;
    }

    /**
     * Create the tooltip window
     */
    private makeWindow() {
        const tooltip = getUIConfig().windows.tooltip;
        const style = new PIXI.TextStyle({
            fontSize: tooltip.fontSize,
            align: "left",
            fontFamily: "sans-serif",
            wordWrap: true,
            wordWrapWidth: tooltip.wordWrapWidth,
        });
        const m = PIXI.TextMetrics.measureText(this.message, style);

        const cardWidth = tooltip.cardWidth;
        const cardHeight = (cardWidth * 3) / 2;
        const totalCardWidth =
            this.cards.length * (cardWidth + tooltip.cardGap) + tooltip.cardGap;
        const totalCardHeight =
            this.cards.length > 0 ? cardHeight + tooltip.padding * 2 : 0;

        const windowWidth = Math.max(
            Math.min(tooltip.maxWidth, m.width + tooltip.padding * 2),
            totalCardWidth,
        );
        const windowHeight = m.height + totalCardHeight + tooltip.padding * 2;
        this.window = getWindowSprite(windowWidth, windowHeight);
        this.window.pivot.y = windowHeight;
        const pos = this.target.getGlobalPosition();
        this.window.x = pos.x - tooltip.offsetX;
        this.window.y = pos.y - tooltip.offsetY;
        this.window.zIndex = 10000;

        // Prevent going out of window
        this.window.x -= Math.max(
            0,
            this.window.x + windowWidth - canvas.getWidth() + tooltip.viewportInset,
        );
        this.window.x = Math.max(tooltip.viewportInset, this.window.x);
        this.window.y = Math.max(
            this.window.pivot.y + tooltip.viewportInset,
            this.window.y,
        );

        const text = new PIXI.Text(this.message, style);
        text.x = tooltip.padding;
        text.y = tooltip.padding;
        this.window.addChild(text);

        this.cards.forEach((card, i) => {
            const cardSprite = new PIXI.Sprite();
            getCardTexture(card, cardSprite, cardWidth);
            cardSprite.x =
                tooltip.padding +
                (tooltip.cardGap + cardWidth) * i +
                (windowWidth - totalCardWidth) / 2;
            cardSprite.y = m.height + tooltip.padding * 2;
            this.window!.addChild(cardSprite);
        });

        return this;
    }
}
