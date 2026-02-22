import type { NextPage } from "next";
import styles from "../styles/maps.module.css";
import Header from "../components/header";
import useSWR from "swr";
import { ICoordinate } from "../tsg";
import { classNames } from "../utils/styles";
import { PortType, TileType } from "../src/entities";
import { Fragment, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { useAnonymousAuth } from "../hooks/auth";
import { basicFetcher } from "../utils";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

type IEdgeCoordinate = { C1: ICoordinate; C2: ICoordinate };

type Map = {
    name: string;
    order: boolean[];
    ports: number[];
    port_coordinates: IEdgeCoordinate[];
    numbers: number[];
    tiles: number[];
    map: number[][];
};

const cloneMap = (map: Map): Map => JSON.parse(JSON.stringify(map));

let initMap: Map = {
    name: "My Amazing Map",
    order: [],
    ports: [],
    port_coordinates: [],
    numbers: [],
    tiles: [],
    map: [
        [1, 2, 3, 4, 5],
        [6, 6, 8, 9, 6],
        [6, 1, 1, 21, 6],
        [6, 0, 1, 8, 6],
        [6, 6, 1, 8, 6],
    ],
};

initMap = JSON.parse(
    `{"name":"Base","order":[false,true,false,true,false],
      "ports":[6,6,6,6,1,2,3,4,5],
      "port_coordinates":[{"C1":{"X":2,"Y":8},"C2":{"X":2,"Y":6}},{"C1":{"X":4,"Y":2},"C2":{"X":6,"Y":0}},{"C1":{"X":10,"Y":0},"C2":{"X":12,"Y":2}},{"C1":{"X":16,"Y":4},"C2":{"X":18,"Y":6}},{"C1":{"X":20,"Y":10},"C2":{"X":20,"Y":12}},{"C1":{"X":18,"Y":16},"C2":{"X":16,"Y":18}},{"C1":{"X":12,"Y":20},"C2":{"X":10,"Y":22}},{"C1":{"X":6,"Y":22},"C2":{"X":4,"Y":20}},{"C1":{"X":2,"Y":16},"C2":{"X":2,"Y":14}}],
      "numbers":[2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12],
      "tiles":[0,1,1,1,1,2,2,2,3,3,3,3,4,4,4,4,5,5,5],
      "map":[[8,9,9,9,8],[9,9,9,9,8],[9,9,9,9,9],[9,9,9,9,8],[8,9,9,9,8]]
     }`,
);

const TileTypeToClass = {
    [TileType.Desert]: [
        "bg-amber-100",
        "border-b-amber-100",
        "border-t-amber-100",
    ],
    [TileType.Wood]: [
        "bg-emerald-800",
        "border-b-emerald-800",
        "border-t-emerald-800",
    ],
    [TileType.Ore]: ["bg-zinc-600", "border-b-zinc-600", "border-t-zinc-600"],
    // [TileType.Sea]: ["bg-blue-600", "border-b-blue-600", "border-t-blue-600"],
    [TileType.Brick]: [
        "bg-red-800",
        "border-b-red-800",
        "border-t-red-800",
    ],
    [TileType.Wheat]: [
        "bg-yellow-600",
        "border-b-yellow-600",
        "border-t-yellow-600",
    ],
    [TileType.Wool]: [
        "bg-lime-600",
        "border-b-lime-600",
        "border-t-lime-600",
    ],
    [TileType.Fog]: ["bg-stone-400", "border-b-stone-400", "border-t-stone-400"],
    [TileType.None]: ["bg-slate-600", "border-b-slate-600", "border-t-slate-600"],
    [TileType.Gold]: [
        "bg-amber-500",
        "border-b-amber-500",
        "border-t-amber-500",
    ],
    [TileType.Random]: [
        "bg-rose-400",
        "border-b-rose-400",
        "border-t-rose-400",
    ],
};

const Index: NextPage = () => {
    const [map, setMap] = useState(initMap);
    const [token] = useAnonymousAuth();
    const { data } = useSWR([`/api/maps`, token ?? null], basicFetcher);
    const [selectedMap, setSelectedMap] = useState(initMap);
    const [resetSnapshot, setResetSnapshot] = useState<Map>(cloneMap(initMap));

    if (global.window !== undefined) {
        (window as any).setMap = setMap;
    }

    // Fetch map on change of selected map
    useEffect(() => {
        if (token) {
            (async () => {
                const res = await basicFetcher([
                    `/api/maps/${selectedMap.name}`,
                    token,
                ]);
                if (res?.map?.map) {
                    const loadedMap = cloneMap(res.map.map);
                    setMap(loadedMap);
                    setResetSnapshot(loadedMap);
                    setNumbers(getInitNum(loadedMap));
                    setTiles(getInitTiles(loadedMap));
                    setPorts(getInitPorts(loadedMap));
                }
            })();
        }
    }, [selectedMap, token]);

    const resetMap = () => {
        const nextMap = cloneMap(resetSnapshot);
        setMap(nextMap);
        setNumbers(getInitNum(nextMap));
        setTiles(getInitTiles(nextMap));
        setPorts(getInitPorts(nextMap));
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT" ||
                    target.isContentEditable)
            ) {
                return;
            }

            if (event.key.toLowerCase() === "r") {
                event.preventDefault();
                resetMap();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [resetSnapshot]);

    const [mapQuery, setMapQuery] = useState("");
    const filteredMaps =
        (mapQuery === ""
            ? data?.maps
            : data?.maps?.filter((n: Map) =>
                  n.name
                      .toLowerCase()
                      .replace(/\s+/g, "")
                      .includes(mapQuery.toLowerCase().replace(/\s+/g, "")),
              )) || [];

    const cycleTileType = (y: number, x: number, force?: TileType) => {
        if (force) {
            map.map[y][x] = force;
        } else {
            const tileType = map.map[y][x];
            const tileTypes = Object.keys(TileTypeToClass).map((x) =>
                Number(x),
            );
            const newTileType: number =
                (tileTypes.findIndex((x) => Number(x) === tileType) + 1) %
                tileTypes.length;
            map.map[y][x] = tileTypes[newTileType] as TileType;
        }
        setMap({ ...map });
    };

    const getInitNum = (map: Map) => {
        const nums = {
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
        };
        map.numbers.forEach((num) => {
            (nums as any)[num] += 1;
        });
        return nums;
    };
    const [numbers, setNumbers] = useState(getInitNum(map));

    const changeNumber = (e: any, number: number) => {
        (numbers as any)[number] = Number(e.target.value);
        setNumbers({ ...numbers });
    };

    const numTilesThatNeedNumber = () => {
        let res = 0;
        map.map.forEach((row) =>
            row.forEach((tile) => {
                if (
                    (tile >= TileType.Wood && tile <= TileType.Ore) ||
                    tile == TileType.Random ||
                    tile == TileType.Gold ||
                    tile == TileType.Fog
                ) {
                    res++;
                }
            }),
        );
        res -= tiles[TileType.Desert];
        return res;
    };

    const numNumbers = () => {
        return Object.values(numbers).reduce((a, b) => a + b, 0);
    };

    const getInitTiles = (map: Map) => {
        const tiles = {
            [TileType.Desert]: 0,
            [TileType.Wood]: 0,
            [TileType.Brick]: 0,
            [TileType.Wool]: 0,
            [TileType.Wheat]: 0,
            [TileType.Ore]: 0,
            [TileType.Gold]: 0,
        };
        map.tiles.forEach((tile) => {
            (tiles as any)[tile] += 1;
        });
        return tiles;
    };
    const [tiles, setTiles] = useState(getInitTiles(map));

    const changeTile = (e: any, tile: number) => {
        (tiles as any)[tile] = Number(e.target.value);
        setTiles({ ...tiles });
    };

    const numRandomTiles = () => {
        let res = 0;
        map.map.forEach((row) =>
            row.forEach((tile) => {
                if (tile == TileType.Random || tile == TileType.Fog) {
                    res++;
                }
            }),
        );
        return res;
    };

    const numRandomTilesSelected = () => {
        return Object.values(tiles).reduce((a, b) => a + b, 0);
    };

    const getInitPorts = (map: Map) => {
        const ports = {
            [PortType.Wood]: 0,
            [PortType.Brick]: 0,
            [PortType.Wool]: 0,
            [PortType.Wheat]: 0,
            [PortType.Ore]: 0,
            [PortType.Any]: 0,
        };
        map.ports.forEach((port) => {
            (ports as any)[port] += 1;
        });
        return ports;
    };
    const [ports, setPorts] = useState(getInitPorts(map));

    const changePort = (e: any, port: number) => {
        (ports as any)[port] = Number(e.target.value);
        setPorts({ ...ports });
    };

    const numPortsSelected = () => {
        return Object.values(ports).reduce((a, b) => a + b, 0);
    };

    const addRow = () => {
        map.map.push(new Array(map.map[0].length).fill(TileType.None));
        setMap({ ...map });
    };

    const addCol = () => {
        map.map.forEach((row) => row.push(TileType.None));
        setMap({ ...map });
    };

    const delRow = () => {
        map.map.pop();
        setMap({ ...map });
    };

    const delCol = () => {
        map.map.forEach((row) => row.pop());
        setMap({ ...map });
    };

    const generateJSON = () => {
        // validate
        if (numNumbers() != numTilesThatNeedNumber()) {
            alert("Incorrect number distribution");
            return;
        }

        if (numRandomTilesSelected() != numRandomTiles()) {
            alert("Incorrect random tiles distribution");
            return;
        }

        if (numPortsSelected() > 15) {
            alert("Too many ports");
            return;
        }

        if (map.map.flat().length <= 5) {
            alert("Too few hex tiles");
            return;
        }

        map.numbers = [];
        map.tiles = [];
        map.ports = [];

        // Iterate over numbers and append each value as many times to map.numbers
        Object.keys(numbers).forEach((key) => {
            for (let i = 0; i < (numbers as any)[Number(key)]; i++) {
                map.numbers.push(Number(key));
            }
        });

        // Iterate over tiles and append each value as many times to map.tiles
        Object.keys(tiles).forEach((key) => {
            for (let i = 0; i < (tiles as any)[Number(key)]; i++) {
                map.tiles.push(Number(key));
            }
        });

        // Iterate over ports and append each value as many times to map.ports
        Object.keys(ports).forEach((key) => {
            for (let i = 0; i < (ports as any)[Number(key)]; i++) {
                map.ports.push(Number(key));
            }
        });

        // assign false/true alternatively to map.order for map.map.length times
        map.order = [];
        for (let i = 0; i < map.map.length; i++) {
            map.order.push(i % 2 === 1);
        }

        console.log(JSON.stringify(map));

        const authToken =
            token || (typeof window !== "undefined"
                ? localStorage.getItem("auth")
                : null);
        if (!authToken) {
            alert("Auth token is still loading. Please try again in a second.");
            return;
        }

        fetch("/api/maps", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authToken,
            },
            body: JSON.stringify(map),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert("Successfully saved map");
                }
            });
    };

    const autoNumbers = () => {
        // Auto distribute numbers
        const numToDistribute = numTilesThatNeedNumber();
        numbers[2] = Math.floor((1 / 18) * numToDistribute);
        numbers[3] = Math.floor((2 / 18) * numToDistribute);
        numbers[4] = Math.floor((2 / 18) * numToDistribute);
        numbers[5] = Math.floor((2 / 18) * numToDistribute);
        numbers[6] = Math.floor((2 / 18) * numToDistribute);
        numbers[8] = Math.floor((2 / 18) * numToDistribute);
        numbers[9] = Math.floor((2 / 18) * numToDistribute);
        numbers[10] = Math.floor((2 / 18) * numToDistribute);
        numbers[11] = Math.floor((2 / 18) * numToDistribute);
        numbers[12] = Math.floor((1 / 18) * numToDistribute);

        while (numNumbers() < numToDistribute) {
            if (numbers[4] < numbers[5]) {
                numbers[4] += 1;
                numbers[10] += 1;
                continue;
            }

            if (numbers[5] < numbers[6]) {
                numbers[5] += 1;
                numbers[9] += 1;
                continue;
            }

            numbers[6] += 1;
            numbers[8] += 1;
        }

        setNumbers({ ...numbers });
    };

    const autoTiles = () => {
        // auto distribute tiles
        const numToDistribute = numRandomTiles();
        tiles[TileType.Desert] = Math.floor((1 / 19) * numToDistribute);
        tiles[TileType.Wood] = Math.floor((4 / 19) * numToDistribute);
        tiles[TileType.Brick] = Math.floor((3 / 19) * numToDistribute);
        tiles[TileType.Wool] = Math.floor((4 / 19) * numToDistribute);
        tiles[TileType.Wheat] = Math.floor((4 / 19) * numToDistribute);
        tiles[TileType.Ore] = Math.floor((3 / 19) * numToDistribute);

        while (numRandomTilesSelected() < numToDistribute) {
            if (tiles[TileType.Desert] < tiles[TileType.Wood] / 2) {
                tiles[TileType.Desert] += 1;
            }

            if (tiles[TileType.Brick] < tiles[TileType.Wood]) {
                tiles[TileType.Brick]++;
                tiles[TileType.Ore]++;
                continue;
            }

            tiles[TileType.Wood]++;
            tiles[TileType.Wool]++;
            tiles[TileType.Wheat]++;
        }

        setTiles({ ...tiles });
    };

    const getTileCoordinate = (y: number, x: number) => {
        return {
            X: 2 + 4 * x + (y % 2 === 0 ? 0 : 2),
            Y: 3 + 4 * y,
        };
    };

    const getVertexCoordinates = (c: ICoordinate) => {
        const coords = new Array<ICoordinate>(6);
        coords[0] = { X: c.X, Y: c.Y - 3 };
        coords[1] = { X: c.X + 2, Y: c.Y - 1 };
        coords[2] = { X: c.X + 2, Y: c.Y + 1 };
        coords[3] = { X: c.X, Y: c.Y + 3 };
        coords[4] = { X: c.X - 2, Y: c.Y + 1 };
        coords[5] = { X: c.X - 2, Y: c.Y - 1 };
        return coords;
    };

    const getEdgeCoordinates = (c: ICoordinate) => {
        const vertices = getVertexCoordinates(c);
        const coords = new Array<IEdgeCoordinate>(6);
        coords[0] = { C1: vertices[0], C2: vertices[1] };
        coords[1] = { C1: vertices[1], C2: vertices[2] };
        coords[2] = { C1: vertices[2], C2: vertices[3] };
        coords[3] = { C1: vertices[3], C2: vertices[4] };
        coords[4] = { C1: vertices[4], C2: vertices[5] };
        coords[5] = { C1: vertices[5], C2: vertices[0] };
        return coords;
    };

    const gec = (y: number, x: number) => {
        return getEdgeCoordinates(getTileCoordinate(y, x));
    };

    const addPort = (e: any, ec: IEdgeCoordinate) => {
        e.stopPropagation();

        if (hasPort(ec)) {
            map.port_coordinates = map.port_coordinates.filter(
                (p) =>
                    !(
                        (p.C1.X === ec.C1.X &&
                            p.C1.Y === ec.C1.Y &&
                            p.C2.X === ec.C2.X &&
                            p.C2.Y === ec.C2.Y) ||
                        (p.C1.X === ec.C2.X &&
                            p.C1.Y === ec.C2.Y &&
                            p.C2.X === ec.C1.X &&
                            p.C2.Y === ec.C1.Y)
                    ),
            );
            setMap({ ...map });
            return;
        }

        map.port_coordinates.push(ec);
        setMap({ ...map });
    };

    const hasPort = (ec: IEdgeCoordinate) => {
        return map.port_coordinates.some((p) => {
            return (
                (p.C1.X === ec.C1.X &&
                    p.C1.Y === ec.C1.Y &&
                    p.C2.X === ec.C2.X &&
                    p.C2.Y === ec.C2.Y) ||
                (p.C1.X === ec.C2.X &&
                    p.C1.Y === ec.C2.Y &&
                    p.C2.X === ec.C1.X &&
                    p.C2.Y === ec.C1.Y)
            );
        });
    };

    const hpc = (y: number, x: number, loc: number) => {
        return hasPort(gec(y, x)[loc]) ? styles.hasport : "";
    };

    return (
        <main>
            <Header />
            <div className="ui-page ui-fade-in">
                <div className="ui-grid gap-4 mt-4 sm:mt-6 xl:grid-cols-[minmax(0,2fr),minmax(300px,1fr)]">
                    <section className="ui-panel ui-panel-pad h-[78vh] overflow-auto">
                        <h1 className="ui-title ui-title-lg small-caps mb-3">
                            Clash Map Editor
                        </h1>
                        <div className="ui-text-muted mb-5">
                            Click on a hex to cycle through tile options. Right
                            click to reset to random or fog.
                            <br />
                            Click on edge dots to assign port locations.
                            <br />
                            Press R to reset the map to the last loaded version.
                        </div>
                        {map.map.map((row, y) => (
                            <div
                                key={y}
                                className={classNames(
                                    styles.hexrow,
                                    y % 2 == 1 ? styles.even : "",
                                    "whitespace-nowrap",
                                )}
                            >
                                {row.map((tile, x) => (
                                    <button
                                        key={x}
                                        className={classNames(styles.hex)}
                                        onClick={() => cycleTileType(y, x)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            cycleTileType(
                                                y,
                                                x,
                                                tile == TileType.None
                                                    ? TileType.Random
                                                    : tile == TileType.Fog
                                                    ? TileType.None
                                                    : TileType.Fog,
                                            );
                                        }}
                                    >
                                        <div
                                            className={classNames(
                                                styles.top,
                                                TileTypeToClass[
                                                    tile as TileType
                                                ][1],
                                            )}
                                        ></div>
                                        <div
                                            className={classNames(
                                                styles.middle,
                                                TileTypeToClass[
                                                    tile as TileType
                                                ][0],
                                            )}
                                        >
                                            <div className="text-xl pt-3">
                                                {tile !== TileType.None
                                                    ? TileType[tile]
                                                    : "-"}
                                            </div>

                                            <div
                                                className={`${styles.port} ${
                                                    styles.tr
                                                } ${hpc(y, x, 0)}`}
                                                onClick={(e) =>
                                                    addPort(e, gec(y, x)[0])
                                                }
                                            ></div>
                                            <div
                                                className={`${styles.port} ${
                                                    styles.r
                                                } ${hpc(y, x, 1)}`}
                                                onClick={(e) =>
                                                    addPort(e, gec(y, x)[1])
                                                }
                                            ></div>
                                            <div
                                                className={`${styles.port} ${
                                                    styles.br
                                                } ${hpc(y, x, 2)}`}
                                                onClick={(e) =>
                                                    addPort(e, gec(y, x)[2])
                                                }
                                            ></div>
                                            <div
                                                className={`${styles.port} ${
                                                    styles.bl
                                                } ${hpc(y, x, 3)}`}
                                                onClick={(e) =>
                                                    addPort(e, gec(y, x)[3])
                                                }
                                            ></div>
                                            <div
                                                className={`${styles.port} ${
                                                    styles.l
                                                } ${hpc(y, x, 4)}`}
                                                onClick={(e) =>
                                                    addPort(e, gec(y, x)[4])
                                                }
                                            ></div>
                                            <div
                                                className={`${styles.port} ${
                                                    styles.tl
                                                } ${hpc(y, x, 5)}`}
                                                onClick={(e) =>
                                                    addPort(e, gec(y, x)[5])
                                                }
                                            ></div>
                                        </div>
                                        <div
                                            className={classNames(
                                                styles.bottom,
                                                TileTypeToClass[
                                                    tile as TileType
                                                ][2],
                                            )}
                                        ></div>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </section>
                    <aside className="ui-panel ui-panel-pad h-[78vh] overflow-auto text-[color:var(--ui-ivory)]">
                    <div className="mb-6">
                        <h2 className="ui-title ui-title-md mb-2">
                            Choose Map to Edit
                        </h2>
                        <Combobox
                            value={selectedMap.name}
                            onChange={(value) => setSelectedMap(value as any)}
                        >
                            <div className="relative mt-1">
                                <div className="relative w-full text-left rounded-md shadow-md cursor-default overflow-hidden border border-[rgba(231,222,206,0.2)] bg-[rgba(24,20,18,0.92)]">
                                    <Combobox.Input
                                        className="ui-input !rounded-none !border-none !bg-transparent py-2 pl-3 pr-10 text-base leading-5 text-[color:var(--ui-ivory)]"
                                        autoComplete="off"
                                        onChange={(event: any) =>
                                            setMapQuery(event.target.value)
                                        }
                                    />
                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="w-5 h-5 text-[rgba(244,239,228,0.7)]"
                                            aria-hidden="true"
                                        />
                                    </Combobox.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                    afterLeave={() => setMapQuery("")}
                                >
                                    <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-[rgba(24,20,18,0.98)] rounded-md shadow-lg max-h-60 border border-[rgba(231,222,206,0.2)] focus:outline-none sm:text-sm">
                                        {filteredMaps.length === 0 &&
                                        mapQuery !== "" ? (
                                            <div className="cursor-default select-none relative py-2 px-4 text-[color:var(--ui-ivory-soft)]">
                                                Nothing found.
                                            </div>
                                        ) : (
                                            filteredMaps.map((map: Map) => (
                                                <Combobox.Option
                                                    key={map.name}
                                                    className={(obj: any) =>
                                                        `select-none relative py-1 pl-10 pr-4 cursor-pointer ${
                                                            obj.active
                                                                ? "text-[color:var(--ui-ivory)] bg-[rgba(122,31,36,0.72)]"
                                                                : "text-[color:var(--ui-ivory-soft)]"
                                                        }`
                                                    }
                                                    value={map}
                                                >
                                                    {(obj: any) => (
                                                        <>
                                                            <span
                                                                className={`block truncate text-left ${
                                                                    obj.selected
                                                                        ? "font-medium"
                                                                        : "font-normal"
                                                                }`}
                                                            >
                                                                {map.name}
                                                            </span>
                                                            {obj.selected ? (
                                                                <span
                                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                        obj.active
                                                                            ? "text-[color:var(--ui-gold-soft)]"
                                                                            : "text-[color:var(--ui-gold-soft)]"
                                                                    }`}
                                                                >
                                                                    <CheckIcon
                                                                        className="w-5 h-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Combobox.Option>
                                            ))
                                        )}
                                    </Combobox.Options>
                                </Transition>
                            </div>
                        </Combobox>
                    </div>
                    <div>
                            <h2 className="ui-title ui-title-md">
                                Map Attributes
                            </h2>

                            <div className="mt-3">
                                <div className="text-sm mb-1">Name</div>
                                <input
                                    className="ui-input mb-3"
                                    type="text"
                                    value={map.name}
                                    onChange={(e) =>
                                        setMap({ ...map, name: e.target.value })
                                    }
                                />
                                <button
                                    className="ui-button ui-button-primary max-w-[180px] mb-4"
                                    onClick={generateJSON}
                                >
                                    Save
                                </button>
                                <br />

                                <div className="text-sm mb-2">
                                    Map Size
                                </div>
                                <button
                                    className="ui-button ui-button-secondary max-w-[180px] mr-2 mb-2"
                                    onClick={addRow}
                                >
                                    Add Row
                                </button>
                                <button
                                    className="ui-button ui-button-ghost max-w-[180px] mr-2 mb-2"
                                    onClick={delRow}
                                >
                                    Delete Row
                                </button>
                                <br />
                                <button
                                    className="ui-button ui-button-secondary max-w-[180px] mr-2 mb-2"
                                    onClick={addCol}
                                >
                                    Add Column
                                </button>
                                <button
                                    className="ui-button ui-button-ghost max-w-[180px] mr-2 mb-2"
                                    onClick={delCol}
                                >
                                    Delete Column
                                </button>
                            </div>

                            <h2 className="ui-title ui-title-md mt-5">
                                Number Distribution
                                <span
                                    className={classNames(
                                        numNumbers() !==
                                            numTilesThatNeedNumber()
                                            ? "ui-pill warn"
                                            : "ui-pill ok",
                                        "mx-2",
                                    )}
                                >
                                    {numNumbers()} / {numTilesThatNeedNumber()}
                                </span>
                                <div className="ui-text-muted mt-1 mb-2 font-normal">
                                    Select the number distribution for all hexes
                                    except desert and sea.
                                </div>
                            </h2>

                            <button
                                className="ui-button ui-button-secondary max-w-[180px] my-2"
                                onClick={autoNumbers}
                            >
                                Auto Distribute
                            </button>

                            <ul className="ml-1">
                                {Object.keys(numbers).map((x) => (
                                    <li key={x} className="my-3 flex items-center gap-3">
                                        <span className="inline-block w-[56px] text-right text-sm">
                                            {x}
                                        </span>
                                        <input
                                            type="range"
                                            className="flex-1 accent-[color:var(--ui-gold)]"
                                            min="0"
                                            max={numTilesThatNeedNumber()}
                                            step="1"
                                            value={(numbers as any)[x]}
                                            onInput={(e) =>
                                                changeNumber(e, Number(x))
                                            }
                                        />
                                        <span className="text-sm min-w-[24px]">
                                            {(numbers as any)[x]}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <h2 className="ui-title ui-title-md mt-6">
                                Random Tile Distribution
                                <span
                                    className={classNames(
                                        numRandomTilesSelected() !==
                                            numRandomTiles()
                                            ? "ui-pill warn"
                                            : "ui-pill ok",
                                        "mx-2",
                                    )}
                                >
                                    {numRandomTilesSelected()} /{" "}
                                    {numRandomTiles()}
                                </span>
                                <div className="ui-text-muted mt-1 mb-2 font-normal">
                                    Select the tile distribution for all random
                                    and fog tiles.
                                </div>
                            </h2>

                            <button
                                className="ui-button ui-button-secondary max-w-[180px] my-2"
                                onClick={autoTiles}
                            >
                                Auto Distribute
                            </button>

                            <ul className="ml-1">
                                {Object.keys(TileTypeToClass)
                                    .filter(
                                        (x) =>
                                            Number(x) !== TileType.Random &&
                                            Number(x) !== TileType.None &&
                                            Number(x) !== TileType.Fog,
                                        // Number(x) !== TileType.Sea, // No seafarers for now
                                    )
                                    .map((x) => (
                                        <li key={x} className="my-3 flex items-center gap-3">
                                            <span className="inline-block w-[56px] text-right text-sm">
                                                {
                                                    TileType[
                                                        Number(x) as TileType
                                                    ]
                                                }
                                            </span>
                                            <input
                                                type="range"
                                                className="flex-1 accent-[color:var(--ui-gold)]"
                                                min="0"
                                                max={numTilesThatNeedNumber()}
                                                step="1"
                                                value={(tiles as any)[x]}
                                                onInput={(e) =>
                                                    changeTile(e, Number(x))
                                                }
                                            />
                                            <span className="text-sm min-w-[24px]">
                                                {(tiles as any)[x]}
                                            </span>
                                        </li>
                                    ))}
                            </ul>

                            <h2 className="ui-title ui-title-md mt-6">
                                Port Distribution
                                <span
                                    className={classNames(
                                        numPortsSelected() > 15
                                            ? "ui-pill warn"
                                            : "ui-pill ok",
                                        "mx-2",
                                    )}
                                >
                                    {numPortsSelected()} / 15
                                </span>
                                <div className="ui-text-muted mt-1 mb-2 font-normal">
                                    Select the port distribution for all ports.
                                </div>
                            </h2>

                            <ul className="ml-1">
                                {Object.keys(ports).map((x) => (
                                    <li key={x} className="my-3 flex items-center gap-3">
                                        <span className="inline-block w-[56px] text-right text-sm">
                                            {PortType[Number(x) as PortType]}
                                        </span>
                                        <input
                                            type="range"
                                            className="flex-1 accent-[color:var(--ui-gold)]"
                                            min="0"
                                            max={15}
                                            step="1"
                                            value={(ports as any)[x]}
                                            onInput={(e) =>
                                                changePort(e, Number(x))
                                            }
                                        />
                                        <span className="text-sm min-w-[24px]">
                                            {(ports as any)[x]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                    </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default Index;
