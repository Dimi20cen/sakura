import * as buttons from "./buttons";
import * as canvas from "./canvas";
import * as chat from "./chat";
import * as dice from "./dice";
import * as hand from "./hand";
import * as state from "./state";

let installed = false;

export function relayoutHUD() {
    if (!canvas.app) {
        return;
    }
    state.relayout();
    buttons.relayout();
    hand.relayout();
    chat.relayout();
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
