import * as PIXI from "pixi.js";
import * as canvas from "./canvas";
import * as windows from "./windows";
import { ButtonType } from "./buttons";
import { sound } from "@pixi/sound";
import type { StaticImageData } from "next/image";

export type AssetImage = Pick<
    StaticImageData,
    "src" | "width" | "height" | "blurDataURL"
>;

export function getCachedTexture(s: AssetImage) {
    const cached = PIXI.utils.TextureCache[s.src];
    if (cached?.valid) {
        return cached;
    }
    return undefined;
}

export async function getTexture(s: AssetImage) {
    const cached = getCachedTexture(s);
    if (cached) {
        return cached;
    }

    return await PIXI.Texture.fromURL(s.src);
}

export function assignTexture(
    sprite: PIXI.Sprite,
    s: AssetImage,
    done?: () => void,
) {
    const spriteAlive = () => !sprite.destroyed;

    // Helper to set texture
    const setTexture = (tex: PIXI.Texture) => {
        if (!spriteAlive()) {
            return;
        }
        sprite.texture = tex;
        canvas.app.markDirty();
        let node: PIXI.Container = sprite;
        while (node) {
            if (node.cacheAsBitmap) {
                canvas.app.invalidateBitmapCache(node);
            }
            node = node.parent;
        }
        done?.();
    };

    const cached = getCachedTexture(s);
    if (cached) {
        return setTexture(cached);
    }

    // Create dummy
    const g = new PIXI.Graphics();
    g.beginFill(0xffffff, 0.1);
    g.drawRect(0, 0, s.width, s.height);
    if (!spriteAlive()) {
        g.destroy();
        return;
    }
    sprite.texture = canvas.app.generateRenderTexture(g);
    g.destroy();

    let fullLoaded = false;
    if (s.blurDataURL?.startsWith("data:")) {
        PIXI.Texture.fromURL(s.blurDataURL, {
            width: s.width,
            height: s.height,
        }).then((tex) => {
            if (!fullLoaded && spriteAlive()) {
                sprite.texture = tex;
                canvas.app.markDirty();
            }
        });
    }

    // Request texture
    getTexture(s).then((tex) => {
        fullLoaded = true;
        setTexture(tex);
    });
}

/************************* Tile Textures *******************************/
import tileTexDesert from "../assets/source/base/board/textures/tile-desert-colonist.svg";
import tileTexWood from "../assets/source/base/board/textures/tile-lumber-colonist.svg";
import tileTexBrick from "../assets/source/base/board/textures/tile-brick-colonist.svg";
import tileTexWool from "../assets/source/base/board/textures/tile-wool-colonist.svg";
import tileTexWheat from "../assets/source/base/board/textures/tile-grain-colonist.svg";
import tileTexOre from "../assets/source/base/board/textures/tile-ore-colonist.svg";
import tileTexGold from "../assets/source/base/board/textures/tile-gold-colonist.svg";
import tileTexSea from "../assets/source/base/board/textures/tile-sea-colonist.svg";
import tileTexFog from "../assets/source/base/board/textures/tile-fog-colonist.svg";

export enum TILE_TEX {
    SEA = 7,
    FOG = 114,
}
export enum TILE_RENDER_MODE {
    TEXTURE_FILL = "texture-fill",
    ILLUSTRATED_HEX = "illustrated-hex",
    TRANSPARENT = "transparent",
}
export const tileTex: { [key: number]: AssetImage } = {
    0: tileTexDesert,
    1: tileTexWood,
    2: tileTexBrick,
    3: tileTexWool,
    4: tileTexWheat,
    5: tileTexOre,
    21: tileTexGold,
};
tileTex[TILE_TEX.SEA] = tileTexSea;
tileTex[TILE_TEX.FOG] = tileTexFog;

export const tileRenderMode: { [key: number]: TILE_RENDER_MODE } = {
    0: TILE_RENDER_MODE.ILLUSTRATED_HEX,
    1: TILE_RENDER_MODE.ILLUSTRATED_HEX,
    2: TILE_RENDER_MODE.ILLUSTRATED_HEX,
    3: TILE_RENDER_MODE.ILLUSTRATED_HEX,
    4: TILE_RENDER_MODE.ILLUSTRATED_HEX,
    5: TILE_RENDER_MODE.ILLUSTRATED_HEX,
    21: TILE_RENDER_MODE.ILLUSTRATED_HEX,
};
tileRenderMode[TILE_TEX.SEA] = TILE_RENDER_MODE.TRANSPARENT;
tileRenderMode[TILE_TEX.FOG] = TILE_RENDER_MODE.ILLUSTRATED_HEX;

export const ILLUSTRATED_TILE_REFERENCE = {
    width: 347,
    height: 401,
} as const;

export function getIllustratedTileNormalization(tile: AssetImage) {
    return Math.max(
        ILLUSTRATED_TILE_REFERENCE.width / tile.width,
        ILLUSTRATED_TILE_REFERENCE.height / tile.height,
    );
}

/************************* Roads *******************************/
import roadBeach from "../public/assets/seafarers/textures/beach.png";
import roadRoad from "../public/assets/base/pieces/road/road.png";
import roadIslandR from "../public/assets/seafarers/textures/island-r.png";
import roadIslandL from "../public/assets/seafarers/textures/island-l.png";
import roadRed from "../assets/source/base/pieces/road/road-red.svg";
import roadBlue from "../assets/source/base/pieces/road/road-blue.svg";
import roadGreen from "../assets/source/base/pieces/road/road-green.svg";
import roadOrange from "../assets/source/base/pieces/road/road-orange.svg";
import roadPlum from "../assets/source/base/pieces/road/road-plum.svg";
import roadCyan from "../assets/source/base/pieces/road/road-cyan.svg";
import shipBlack from "../assets/source/base/pieces/ship/ship-black.svg";
import shipRed from "../assets/source/base/pieces/ship/ship-red.svg";
import shipBlue from "../assets/source/base/pieces/ship/ship-blue.svg";
import shipGreen from "../assets/source/base/pieces/ship/ship-green.svg";
import shipOrange from "../assets/source/base/pieces/ship/ship-orange.svg";
import shipPlum from "../assets/source/base/pieces/ship/ship-plum.svg";
import shipCyan from "../assets/source/base/pieces/ship/ship-cyan.svg";

export enum ROAD {
    ROAD = "road",
    ISLAND_R = "island_r",
    ISLAND_L = "island_l",
    BEACH = "beach",
}
export const road: { [key: string | ROAD]: AssetImage } = {
    red: roadRed,
    blue: roadBlue,
    green: roadGreen,
    yellow: roadOrange,
    orange: roadOrange,
    white: roadCyan,
    plum: roadPlum,
    cyan: roadCyan,
};
road[ROAD.BEACH] = roadBeach;
road[ROAD.ROAD] = roadRoad;
road[ROAD.ISLAND_R] = roadIslandR;
road[ROAD.ISLAND_L] = roadIslandL;
export const ship: { [key: string]: AssetImage } = {
    black: shipBlack,
    red: shipRed,
    blue: shipBlue,
    green: shipGreen,
    yellow: shipOrange,
    orange: shipOrange,
    white: shipCyan,
    plum: shipPlum,
    cyan: shipCyan,
};

/******************** House *******************************************/
import houseRed from "../assets/source/base/pieces/settlement/settlement-red.svg";
import houseBlue from "../assets/source/base/pieces/settlement/settlement-blue.svg";
import houseGreen from "../assets/source/base/pieces/settlement/settlement-green.svg";
import houseOrange from "../assets/source/base/pieces/settlement/settlement-orange.svg";
import housePlum from "../assets/source/base/pieces/settlement/settlement-plum.svg";
import houseCyan from "../assets/source/base/pieces/settlement/settlement-cyan.svg";

export const house: { [key: string]: AssetImage } = {
    red: houseRed,
    blue: houseBlue,
    green: houseGreen,
    yellow: houseOrange,
    orange: houseOrange,
    white: houseCyan,
    plum: housePlum,
    cyan: houseCyan,
};

/******************** City *******************************************/
import cityRed from "../assets/source/base/pieces/city/city-red.svg";
import cityBlue from "../assets/source/base/pieces/city/city-blue.svg";
import cityGreen from "../assets/source/base/pieces/city/city-green.svg";
import cityOrange from "../assets/source/base/pieces/city/city-orange.svg";
import cityPlum from "../assets/source/base/pieces/city/city-plum.svg";
import cityCyan from "../assets/source/base/pieces/city/city-cyan.svg";

export const city: { [key: string]: AssetImage } = {
    red: cityRed,
    blue: cityBlue,
    green: cityGreen,
    yellow: cityOrange,
    orange: cityOrange,
    white: cityCyan,
    plum: cityPlum,
    cyan: cityCyan,
};

/******************** Knight *******************************************/

import knight1Red from "../public/assets/cities-knights/pieces/knight/1-red.png";
import knight1Blue from "../public/assets/cities-knights/pieces/knight/1-blue.png";
import knight1Green from "../public/assets/cities-knights/pieces/knight/1-green.png";
import knight1Yellow from "../public/assets/cities-knights/pieces/knight/1-yellow.png";
import knight1Plum from "../public/assets/cities-knights/pieces/knight/1-plum.png";
import knight1Cyan from "../public/assets/cities-knights/pieces/knight/1-cyan.png";
import knight2Red from "../public/assets/cities-knights/pieces/knight/2-red.png";
import knight2Blue from "../public/assets/cities-knights/pieces/knight/2-blue.png";
import knight2Green from "../public/assets/cities-knights/pieces/knight/2-green.png";
import knight2Yellow from "../public/assets/cities-knights/pieces/knight/2-yellow.png";
import knight2Plum from "../public/assets/cities-knights/pieces/knight/2-plum.png";
import knight2Cyan from "../public/assets/cities-knights/pieces/knight/2-cyan.png";
import knight3Red from "../public/assets/cities-knights/pieces/knight/3-red.png";
import knight3Blue from "../public/assets/cities-knights/pieces/knight/3-blue.png";
import knight3Green from "../public/assets/cities-knights/pieces/knight/3-green.png";
import knight3Yellow from "../public/assets/cities-knights/pieces/knight/3-yellow.png";
import knight3Plum from "../public/assets/cities-knights/pieces/knight/3-plum.png";
import knight3Cyan from "../public/assets/cities-knights/pieces/knight/3-cyan.png";

import knightDisabledS from "../public/assets/cities-knights/pieces/knight/disabled.png";
export const knightDisabled = knightDisabledS;

export const knight: { [level: number]: { [color: string]: AssetImage } } =
    {
        1: {
            red: knight1Red,
            blue: knight1Blue,
            green: knight1Green,
            yellow: knight1Yellow,
            orange: knight1Yellow,
            white: knight1Cyan,
            plum: knight1Plum,
            cyan: knight1Cyan,
        },
        2: {
            red: knight2Red,
            blue: knight2Blue,
            green: knight2Green,
            yellow: knight2Yellow,
            orange: knight2Yellow,
            white: knight2Cyan,
            plum: knight2Plum,
            cyan: knight2Cyan,
        },
        3: {
            red: knight3Red,
            blue: knight3Blue,
            green: knight3Green,
            yellow: knight3Yellow,
            orange: knight3Yellow,
            white: knight3Cyan,
            plum: knight3Plum,
            cyan: knight3Cyan,
        },
    };

/******************************* Merchant *****************************/

import merchantRed from "../public/assets/cities-knights/pieces/merchant/red.png";
import merchantBlue from "../public/assets/cities-knights/pieces/merchant/blue.png";
import merchantGreen from "../public/assets/cities-knights/pieces/merchant/green.png";
import merchantYellow from "../public/assets/cities-knights/pieces/merchant/yellow.png";
import merchantPlum from "../public/assets/cities-knights/pieces/merchant/plum.png";
import merchantCyan from "../public/assets/cities-knights/pieces/merchant/cyan.png";

export const merchant: { [key: string]: AssetImage } = {
    red: merchantRed,
    blue: merchantBlue,
    green: merchantGreen,
    yellow: merchantYellow,
    orange: merchantYellow,
    white: merchantCyan,
    plum: merchantPlum,
    cyan: merchantCyan,
};

/******************************* Metropolis ***************************/

import metro6 from "../public/assets/cities-knights/city-improvements/m-6.png";
import metro7 from "../public/assets/cities-knights/city-improvements/m-7.png";
import metro8 from "../public/assets/cities-knights/city-improvements/m-8.png";

export const metropolis: { [key: number]: AssetImage } = {
    6: metro6,
    7: metro7,
    8: metro8,
};

/******************************* Other ********************************/

import wallS from "../public/assets/cities-knights/city-improvements/w.png";
export const wall = wallS;

import robberS from "../public/assets/shared/ui/robber.png";
export const robber = robberS;
import pirateS from "../public/assets/seafarers/pieces/pirate.png";
export const pirate = pirateS;

import bankS from "../public/assets/shared/ui/bank.png";
export const bank = bankS;

import settingsS from "../public/assets/shared/ui/settings.png";
export const settings = settingsS;

import botS from "../public/assets/shared/ui/bot.png";
export const bot = botS;

import spectateS from "../public/assets/shared/ui/spectate.png";
export const spectate = spectateS;

import seaS from "../public/assets/seafarers/board/sea.jpg";
export const sea = seaS;

import barbarianTrackS from "../public/assets/cities-knights/board/barbarian/track.png";
export const barbarianTrack = barbarianTrackS;
import barbarianShipS from "../public/assets/cities-knights/board/barbarian/ship.png";
export const barbarianShip = barbarianShipS;

/*************************** Number Tokens ****************************/

import num0 from "../public/assets/base/tokens/number-tokens/0.png";
import num1 from "../public/assets/base/tokens/number-tokens/1.png";
import num2 from "../public/assets/base/tokens/number-tokens/2.png";
import num3 from "../public/assets/base/tokens/number-tokens/3.png";
import num4 from "../public/assets/base/tokens/number-tokens/4.png";
import num5 from "../public/assets/base/tokens/number-tokens/5.png";
import num6 from "../public/assets/base/tokens/number-tokens/6.png";
import num8 from "../public/assets/base/tokens/number-tokens/8.png";
import num9 from "../public/assets/base/tokens/number-tokens/9.png";
import num10 from "../public/assets/base/tokens/number-tokens/10.png";
import num11 from "../public/assets/base/tokens/number-tokens/11.png";
import num12 from "../public/assets/base/tokens/number-tokens/12.png";

export const numberTokens: { [key: number]: AssetImage } = {
    0: num0,
    1: num1,
    2: num2,
    3: num3,
    4: num4,
    5: num5,
    6: num6,
    8: num8,
    9: num9,
    10: num10,
    11: num11,
    12: num12,
};

/************************* Icons **************************************/

import iconCards from "../public/assets/shared/icons/cards.png";
import iconDcard from "../public/assets/shared/icons/dcard.png";
import iconKnight from "../public/assets/cities-knights/icons/knight.png";
import iconRoad from "../public/assets/shared/icons/road.png";
import iconVp from "../public/assets/shared/icons/vp.png";

export enum ICON {
    CARDS = "cards",
    DCARD = "dcard",
    KNIGHT = "knight",
    ROAD = "road",
    VP = "vp",
}

export const icons: { [key in ICON]: AssetImage } = {
    cards: iconCards,
    dcard: iconDcard,
    knight: iconKnight,
    road: iconRoad,
    vp: iconVp,
};

/************************* Icons **************************************/

import port1 from "../public/assets/base/tokens/ports/1.png";
import port2 from "../public/assets/base/tokens/ports/2.png";
import port3 from "../public/assets/base/tokens/ports/3.png";
import port4 from "../public/assets/base/tokens/ports/4.png";
import port5 from "../public/assets/base/tokens/ports/5.png";
import port6 from "../public/assets/base/tokens/ports/6.png";

export const ports: { [key: number]: AssetImage } = {
    1: port1,
    2: port2,
    3: port3,
    4: port4,
    5: port5,
    6: port6,
};

/************************* Buttons ************************************/

import btnYes from "../public/assets/shared/buttons/yes.png";
import btnNo from "../public/assets/shared/buttons/no.png";
import btnSettlement from "../assets/source/base/pieces/settlement/settlement-black.svg";
import btnCity from "../assets/source/base/pieces/city/city-black.svg";
import btnRoad from "../assets/source/base/pieces/road/road-black.svg";
import btnShip from "../assets/source/base/pieces/ship/ship-black.svg";
import btnDevelopmentCard from "../public/assets/shared/buttons/dcard.png";
import btnKnightBox from "../public/assets/cities-knights/buttons/knight.png";
import btnKnightBuild from "../public/assets/cities-knights/buttons/knight_build.png";
import btnKnightActivate from "../public/assets/cities-knights/buttons/knight_activate.png";
import btnKnightRobber from "../public/assets/cities-knights/buttons/knight_robber.png";
import btnKnightMove from "../public/assets/cities-knights/buttons/knight_move.png";
import btnMoveShip from "../public/assets/shared/buttons/move_ship.png";
import btnCityImprove from "../public/assets/cities-knights/buttons/improve.png";
import btnCityImprovePaper from "../public/assets/cities-knights/buttons/improve_paper.jpg";
import btnCityImproveCloth from "../public/assets/cities-knights/buttons/improve_cloth.jpg";
import btnCityImproveCoin from "../public/assets/cities-knights/buttons/improve_coin.jpg";
import btnWall from "../public/assets/cities-knights/buttons/w.png";
import btnEndTurn from "../public/assets/shared/buttons/endturn.png";
import btnSpecialBuild from "../public/assets/shared/buttons/specialbuild.png";
import btnEdit from "../public/assets/shared/buttons/edit.png";
import btnFullscreen from "../public/assets/shared/buttons/fullscreen.png";
import btnChat from "../public/assets/shared/buttons/chat.png";

export const buttons: { [key in ButtonType]: AssetImage } = {
    yes: btnYes,
    no: btnNo,
    settlement: btnSettlement,
    city: btnCity,
    road: btnRoad,
    ship: btnShip,
    move_ship: btnMoveShip,
    dcard: btnDevelopmentCard,
    knight: btnKnightBox,
    knight_build: btnKnightBuild,
    knight_activate: btnKnightActivate,
    knight_robber: btnKnightRobber,
    knight_move: btnKnightMove,
    improve: btnCityImprove,
    improve_paper: btnCityImprovePaper,
    improve_cloth: btnCityImproveCloth,
    improve_coin: btnCityImproveCoin,
    w: btnWall,
    endturn: btnEndTurn,
    specialbuild: btnSpecialBuild,
    edit: btnEdit,
    fullscreen: btnFullscreen,
    chat: btnChat,
};

// Button backgrounds
import buttonsBgRed from "../public/assets/shared/buttons/bg/red.jpg";
import buttonsBgBlue from "../public/assets/shared/buttons/bg/blue.jpg";
import buttonsBgGreen from "../public/assets/shared/buttons/bg/green.jpg";
import buttonsBgYellow from "../public/assets/shared/buttons/bg/yellow.jpg";
import buttonsBgPlum from "../public/assets/shared/buttons/bg/plum.jpg";
import buttonsBgCyan from "../public/assets/shared/buttons/bg/cyan.jpg";

export const buttonsBg: { [key: string]: AssetImage } = {
    red: buttonsBgRed,
    blue: buttonsBgBlue,
    green: buttonsBgGreen,
    yellow: buttonsBgYellow,
    orange: buttonsBgYellow,
    white: buttonsBgCyan,
    plum: buttonsBgPlum,
    cyan: buttonsBgCyan,
};

/************************* Dice ************************************/
import diceW1 from "../public/assets/shared/dice/dice-1.png";
import diceW2 from "../public/assets/shared/dice/dice-2.png";
import diceW3 from "../public/assets/shared/dice/dice-3.png";
import diceW4 from "../public/assets/shared/dice/dice-4.png";
import diceW5 from "../public/assets/shared/dice/dice-5.png";
import diceW6 from "../public/assets/shared/dice/dice-6.png";
import diceR1 from "../public/assets/shared/dice/dice-1-r.png";
import diceR2 from "../public/assets/shared/dice/dice-2-r.png";
import diceR3 from "../public/assets/shared/dice/dice-3-r.png";
import diceR4 from "../public/assets/shared/dice/dice-4-r.png";
import diceR5 from "../public/assets/shared/dice/dice-5-r.png";
import diceR6 from "../public/assets/shared/dice/dice-6-r.png";
import diceE1 from "../public/assets/cities-knights/dice/event-1.png";
import diceE2 from "../public/assets/cities-knights/dice/event-2.png";
import diceE3 from "../public/assets/cities-knights/dice/event-3.png";
import diceE4 from "../public/assets/cities-knights/dice/event-4.png";

export const diceWhite: { [key: number]: AssetImage } = {
    1: diceW1,
    2: diceW2,
    3: diceW3,
    4: diceW4,
    5: diceW5,
    6: diceW6,
};

export const diceRed: { [key: number]: AssetImage } = {
    1: diceR1,
    2: diceR2,
    3: diceR3,
    4: diceR4,
    5: diceR5,
    6: diceR6,
};

export const diceEvent: { [key: number]: AssetImage } = {
    1: diceE1,
    2: diceE2,
    3: diceE3,
    4: diceE4,
};

/****************** Cards *********************************************/

import cards0 from "../public/assets/base/cards/decks/unknown-card-back.jpg";
import cards1 from "../public/assets/base/cards/decks/wood.webp";
import cards2 from "../public/assets/base/cards/decks/brick.webp";
import cards3 from "../public/assets/base/cards/decks/wool.webp";
import cards4 from "../public/assets/base/cards/decks/wheat.webp";
import cards5 from "../public/assets/base/cards/decks/ore.webp";
import cards6 from "../public/assets/cities-knights/cards/decks/commodity-paper.jpg";
import cards7 from "../public/assets/cities-knights/cards/decks/commodity-cloth.jpg";
import cards8 from "../public/assets/cities-knights/cards/decks/commodity-coin.jpg";
import cards101 from "../public/assets/base/cards/decks/knight.jpg";
import cards102 from "../public/assets/base/cards/decks/victory-point-card.jpg";
import cards103 from "../public/assets/base/cards/decks/road-building.jpg";
import cards104 from "../public/assets/base/cards/decks/year-of-plenty.jpg";
import cards105 from "../public/assets/base/cards/decks/monopoly.jpg";
import cards106 from "../public/assets/cities-knights/cards/decks/progress-science-alchemist.jpg";
import cards107 from "../public/assets/cities-knights/cards/decks/progress-science-crane.jpg";
import cards108 from "../public/assets/cities-knights/cards/decks/progress-science-engineer.jpg";
import cards109 from "../public/assets/cities-knights/cards/decks/progress-science-inventor.jpg";
import cards110 from "../public/assets/cities-knights/cards/decks/progress-science-irrigation.jpg";
import cards111 from "../public/assets/cities-knights/cards/decks/progress-science-medicine.jpg";
import cards112 from "../public/assets/cities-knights/cards/decks/progress-science-mining.jpg";
import cards113 from "../public/assets/cities-knights/cards/decks/progress-science-printer.jpg";
import cards114 from "../public/assets/cities-knights/cards/decks/progress-science-road-building.jpg";
import cards115 from "../public/assets/cities-knights/cards/decks/progress-science-smith.jpg";
import cards116 from "../public/assets/cities-knights/cards/decks/progress-trade-commercial-harbor.jpg";
import cards117 from "../public/assets/cities-knights/cards/decks/progress-trade-master-merchant.jpg";
import cards118 from "../public/assets/cities-knights/cards/decks/progress-trade-merchant.jpg";
import cards119 from "../public/assets/cities-knights/cards/decks/progress-trade-merchant-fleet.jpg";
import cards120 from "../public/assets/cities-knights/cards/decks/progress-trade-resource-monopoly.jpg";
import cards121 from "../public/assets/cities-knights/cards/decks/progress-trade-trade-monopoly.jpg";
import cards122 from "../public/assets/cities-knights/cards/decks/progress-politics-bishop.jpg";
import cards123 from "../public/assets/cities-knights/cards/decks/progress-politics-constitution.jpg";
import cards124 from "../public/assets/cities-knights/cards/decks/progress-politics-deserter.jpg";
import cards125 from "../public/assets/cities-knights/cards/decks/progress-politics-diplomat.jpg";
import cards126 from "../public/assets/cities-knights/cards/decks/progress-politics-intrigue.jpg";
import cards127 from "../public/assets/cities-knights/cards/decks/progress-politics-saboteur.jpg";
import cards128 from "../public/assets/cities-knights/cards/decks/progress-politics-spy.jpg";
import cards129 from "../public/assets/cities-knights/cards/decks/progress-politics-warlord.jpg";
import cards130 from "../public/assets/cities-knights/cards/decks/progress-politics-wedding.jpg";
import cards200 from "../public/assets/base/cards/decks/development-card-back.jpg";
import cards201 from "../public/assets/cities-knights/cards/decks/progress-science-back-hidden.jpg";
import cards202 from "../public/assets/cities-knights/cards/decks/progress-trade-back-hidden.jpg";
import cards203 from "../public/assets/cities-knights/cards/decks/progress-politics-back-hidden.jpg";
import cards204 from "../public/assets/cities-knights/cards/decks/defender-of-catan-hidden.jpg";
import cards205 from "../public/assets/base/cards/decks/longest-road-hidden.jpg";
import cards206 from "../public/assets/base/cards/decks/largest-army-hidden.jpg";
import cards207 from "../public/assets/cities-knights/cards/decks/science-improvement-level-3-hidden.jpg";
import cards208 from "../public/assets/cities-knights/cards/decks/science-improvement-level-4-hidden.jpg";
import cards209 from "../public/assets/cities-knights/cards/decks/science-improvement-level-5-hidden.jpg";
import cards210 from "../public/assets/cities-knights/cards/decks/trade-improvement-level-3-hidden.jpg";
import cards211 from "../public/assets/cities-knights/cards/decks/trade-improvement-level-4-hidden.jpg";
import cards212 from "../public/assets/cities-knights/cards/decks/trade-improvement-level-5-hidden.jpg";
import cards213 from "../public/assets/cities-knights/cards/decks/politics-improvement-level-3-hidden.jpg";
import cards214 from "../public/assets/cities-knights/cards/decks/politics-improvement-level-4-hidden.jpg";
import cards215 from "../public/assets/cities-knights/cards/decks/politics-improvement-level-5-hidden.jpg";

export const cards: { [key: number]: AssetImage } = {
    0: cards0,
    1: cards1,
    2: cards2,
    3: cards3,
    4: cards4,
    5: cards5,
    6: cards6,
    7: cards7,
    8: cards8,
    101: cards101,
    102: cards102,
    103: cards103,
    104: cards104,
    105: cards105,
    106: cards106,
    107: cards107,
    108: cards108,
    109: cards109,
    110: cards110,
    111: cards111,
    112: cards112,
    113: cards113,
    114: cards114,
    115: cards115,
    116: cards116,
    117: cards117,
    118: cards118,
    119: cards119,
    120: cards120,
    121: cards121,
    122: cards122,
    123: cards123,
    124: cards124,
    125: cards125,
    126: cards126,
    127: cards127,
    128: cards128,
    129: cards129,
    130: cards130,
    200: cards200,
    201: cards201,
    202: cards202,
    203: cards203,
    204: cards204,
    205: cards205,
    206: cards206,
    207: cards207,
    208: cards208,
    209: cards209,
    210: cards210,
    211: cards211,
    212: cards212,
    213: cards213,
    214: cards214,
    215: cards215,
};

/**********************************************************************/

let progressContainer: PIXI.Container;
let progressBg: PIXI.Graphics;
let progress: PIXI.Graphics;
const w = 500;

export async function loadAssets() {
    PIXI.utils.clearTextureCache();

    // Progress bar
    addProgressBar();

    const addSound = (name: string, src: string) => {
        if (!sound.exists(name)) sound.add(name, src);
    };

    // Sounds
    await Promise.all([
        addSound("soundRing", "/assets/shared/sound/ring.wav"),
        addSound("soundTrade", "/assets/shared/sound/trade.wav"),
        addSound("soundDice", "/assets/shared/sound/dice.wav"),
        addSound("soundChat", "/assets/shared/sound/chat.wav"),
        addSound("soundPlayCard", "/assets/shared/sound/playcard.wav"),
    ]);

    // Progress by number of assets
    const numAssets = Object.keys(tileTex).length;
    let loadedAssets = 0;
    const progress = () => {
        loadedAssets++;
        updateProgressBar((loadedAssets / numAssets) * 100);
    };

    // Textures
    await Promise.all(
        Object.values(tileTex).map((s) =>
            (async () => {
                try {
                    await getTexture(s);
                } catch (err) {
                    console.error("Failed to preload tile texture", s.src, err);
                } finally {
                    progress();
                }
            })(),
        ),
    );

    // Done
    progressContainer?.destroy({ children: true });
}

function addProgressBar() {
    progressContainer = new PIXI.Container();
    canvas.app.stage.addChild(progressContainer);
    progressContainer.addChild(windows.getWindowSprite(w + 40, 140));
    progressContainer.x = (canvas.getWidth() - w) / 2;
    progressContainer.y = 200;
    progressContainer.zIndex = 10000;

    progressBg = new PIXI.Graphics();
    progressBg.beginFill(0xdddddd, 0.8);
    progressBg.drawRect(20, 90, w, 30);
    progressBg.endFill();
    progressContainer.addChild(progressBg);

    const title = new PIXI.Text("Loading Assets ...", {
        fill: 0x000000,
        fontWeight: "bold",
        fontFamily: "serif",
        fontSize: 36,
    });
    title.anchor.x = 0.5;
    title.x = w / 2 + 20;
    title.y = 25;
    progressContainer.addChild(title);
}

function updateProgressBar(percent: number) {
    if (progress && !progress.destroyed) {
        progress?.destroy({ children: true });
    }
    progress = new PIXI.Graphics();
    progress.beginFill(0x00aa00, 0.8);
    progress.drawRect(20, 90, (w * percent) / 100, 30);
    progress.endFill();
    progressContainer.addChild(progress);
    canvas.app.markDirty();
}
