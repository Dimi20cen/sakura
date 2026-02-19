import { FunctionComponent, useCallback } from "react";
import * as canvas from "../src/canvas";
import { isBrowser } from "../utils";
import { SOCKET_STATE } from "../src/sock";
import { useGameSession } from "../hooks/gameSession";

const Pixi: FunctionComponent<{ gameId: string; order: number }> = ({
    gameId,
    order,
}) => {
    let allowRender = true;
    const { socketState, setInit, gameExists } = useGameSession(gameId, order);

    const divRef = useCallback((node: any) => {
        if (isBrowser && node !== null && allowRender) {
            setInit(false);
            allowRender = false;

            canvas.cleanup(() => {
                canvas.initialize(node, () => {
                    setInit(true);
                    allowRender = true;
                });
            });
        }
    }, []);

    if (socketState == SOCKET_STATE.ERROR) return <div />;

    return (
        <div
            ref={divRef}
            className="relative m-auto pixi flex content-center justify-center"
        />
    );
};

export default Pixi;
