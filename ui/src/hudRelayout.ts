import * as buttons from "./buttons";
import * as canvas from "./canvas";
import * as chat from "./chat";
import * as dice from "./dice";
import * as gameLog from "./gameLog";
import * as hand from "./hand";
import * as resourceBank from "./resourceBank";
import * as state from "./state";
import * as trade from "./trade";

let installed = false;

export function relayoutHUD() {
    if (!canvas.app) {
        return;
    }
    state.relayout();
    buttons.relayout();
    hand.relayout();
    resourceBank.relayout();
    trade.relayout();
    chat.relayout();
    gameLog.relayout();
    dice.relayout();
}

export function ensureHUDRelayoutHooks() {
    if (installed || typeof window === "undefined") {
        return;
    }

    const onResize = () => {
        window.requestAnimationFrame(() => relayoutHUD());
    };

    window.addEventListener("resize", onResize);
    installed = true;
}
