import type { NextPage } from "next";
import styles from "../styles/maps.module.css";
import Header from "../components/header";
import useSWR from "swr";
import { ICoordinate } from "../tsg";
import { classNames } from "../utils/styles";
import { PortType, TileType } from "../src/entities";
import { Fragment, PointerEvent, WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { useAnonymousAuth } from "../hooks/auth";
import { basicFetcher } from "../utils";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon, QuestionMarkCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

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

const edgeKey = (ec: IEdgeCoordinate) => {
    const a = `${ec.C1.X},${ec.C1.Y}`;
    const b = `${ec.C2.X},${ec.C2.Y}`;
    return a < b ? `${a}|${b}` : `${b}|${a}`;
};

const ADD_NEW_MAP_KEY = "__add_new_map__";

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
    const { data, mutate } = useSWR(token ? [`/api/maps`, token] : null, basicFetcher);
    const [selectedMap, setSelectedMap] = useState(initMap);
    const [resetSnapshot, setResetSnapshot] = useState<Map>(cloneMap(initMap));
    const [statusMessage, setStatusMessage] = useState<{
        tone: "ok" | "warn";
        text: string;
    } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 24, y: 24 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef<{
        x: number;
        y: number;
        originX: number;
        originY: number;
    } | null>(null);
    const suppressClickUntilRef = useRef(0);

    useEffect(() => {
        if (
            process.env.NODE_ENV !== "production" &&
            typeof window !== "undefined"
        ) {
            (window as any).setMap = setMap;
        }
    }, []);

    // Fetch map on change of selected map
    useEffect(() => {
        if (!token) {
            return;
        }
        let isStale = false;

        (async () => {
            const res = await basicFetcher([
                `/api/maps/${selectedMap.name}`,
                token,
            ]);
            if (isStale) {
                return;
            }
            if (res?.map?.map) {
                const loadedMap = cloneMap(res.map.map);
                setMap(loadedMap);
                setResetSnapshot(cloneMap(loadedMap));
                setNumbers(getInitNum(loadedMap));
                setTiles(getInitTiles(loadedMap));
                setPorts(getInitPorts(loadedMap));
            }
        })();

        return () => {
            isStale = true;
        };
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
    const [distributionMenu, setDistributionMenu] = useState<
        "numbers" | "tiles" | "ports"
    >("numbers");
    const [showEditorHelp, setShowEditorHelp] = useState(false);
    const selectableMaps =
        (data?.maps?.filter(
            (n: Map) =>
                n?.name &&
                n.name !== "--- Community Maps ---" &&
                n.name !== "",
        ) as Map[]) || [];
    const filteredMaps =
        (mapQuery === ""
            ? selectableMaps
            : selectableMaps.filter((n: Map) =>
                  n.name
                      .toLowerCase()
                      .replace(/\s+/g, "")
                      .includes(mapQuery.toLowerCase().replace(/\s+/g, "")),
              )) || [];
    const mapOptions = [
        ...filteredMaps,
        {
            name: ADD_NEW_MAP_KEY,
        } as Map,
    ];

    const handleSelectMap = (value: Map) => {
        if (!value) {
            return;
        }

        if (value.name === ADD_NEW_MAP_KEY) {
            const nextName = window
                .prompt("Name your new map")
                ?.trim();
            if (!nextName) {
                return;
            }

            const exists = selectableMaps.some(
                (m) => m.name.toLowerCase() === nextName.toLowerCase(),
            );
            if (exists) {
                setStatusMessage({
                    tone: "warn",
                    text: "A map with that name already exists.",
                });
                return;
            }

            const nextMap = cloneMap(initMap);
            nextMap.name = nextName;
            setSelectedMap(nextMap);
            setMap(nextMap);
            setResetSnapshot(cloneMap(nextMap));
            setNumbers(getInitNum(nextMap));
            setTiles(getInitTiles(nextMap));
            setPorts(getInitPorts(nextMap));
            setMapQuery("");
            return;
        }

        setSelectedMap(value);
    };

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

    const autoPorts = () => {
        const target = map.port_coordinates.length;
        const next = {
            [PortType.Wood]: 0,
            [PortType.Brick]: 0,
            [PortType.Wool]: 0,
            [PortType.Wheat]: 0,
            [PortType.Ore]: 0,
            [PortType.Any]: 0,
        };

        if (target <= 0) {
            setPorts(next);
            return;
        }

        const weightedOrder: PortType[] = [
            PortType.Any,
            PortType.Any,
            PortType.Any,
            PortType.Any,
            PortType.Wood,
            PortType.Brick,
            PortType.Wool,
            PortType.Wheat,
            PortType.Ore,
        ];

        // Seed with the classic 4x Any + one of each resource distribution.
        for (let i = 0; i < target; i++) {
            const port = weightedOrder[i % weightedOrder.length];
            next[port] += 1;
        }

        setPorts(next);
    };

    const numPortsSelected = () => {
        return Object.values(ports).reduce((a, b) => a + b, 0);
    };
    const numPortSlots = map.port_coordinates.length;

    const addRow = () => {
        const colCount =
            map.map.length > 0 && map.map[0].length > 0 ? map.map[0].length : 1;
        map.map.push(new Array(colCount).fill(TileType.None));
        setMap({ ...map });
    };

    const addCol = () => {
        if (map.map.length === 0) {
            map.map.push([TileType.None]);
            setMap({ ...map });
            return;
        }
        map.map.forEach((row) => row.push(TileType.None));
        setMap({ ...map });
    };

    const delRow = () => {
        if (map.map.length <= 1) {
            return;
        }
        map.map.pop();
        setMap({ ...map });
    };

    const delCol = () => {
        if (map.map.every((row) => row.length <= 1)) {
            return;
        }
        map.map.forEach((row) => row.pop());
        setMap({ ...map });
    };

    const generateJSON = () => {
        // validate
        if (numNumbers() != numTilesThatNeedNumber()) {
            setStatusMessage({
                tone: "warn",
                text: "Incorrect number distribution.",
            });
            return;
        }

        if (numRandomTilesSelected() != numRandomTiles()) {
            setStatusMessage({
                tone: "warn",
                text: "Incorrect random tiles distribution.",
            });
            return;
        }

        if (numPortsSelected() > numPortSlots) {
            setStatusMessage({ tone: "warn", text: "Too many ports." });
            return;
        }

        if (map.map.flat().length <= 5) {
            setStatusMessage({ tone: "warn", text: "Too few hex tiles." });
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
            setStatusMessage({
                tone: "warn",
                text: "Auth token is still loading. Please try again in a second.",
            });
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
                    setStatusMessage({ tone: "warn", text: data.error });
                } else {
                    setResetSnapshot(cloneMap(map));
                    mutate();
                    setStatusMessage({
                        tone: "ok",
                        text: "Successfully saved map.",
                    });
                }
            });
    };

    const deleteCurrentMap = async () => {
        if (!map?.name) {
            return;
        }

        const confirmed = window.confirm(
            `Delete map "${map.name}"? This cannot be undone.`,
        );
        if (!confirmed) {
            return;
        }

        const authToken =
            token || (typeof window !== "undefined"
                ? localStorage.getItem("auth")
                : null);
        if (!authToken) {
            setStatusMessage({
                tone: "warn",
                text: "Auth token is still loading. Please try again in a second.",
            });
            return;
        }

        const res = await fetch(`/api/maps/${encodeURIComponent(map.name)}`, {
            method: "DELETE",
            headers: {
                Authorization: authToken,
            },
        });

        const body = await res.json().catch(() => ({}));
        if (!res.ok || body?.error) {
            setStatusMessage({
                tone: "warn",
                text: body?.error || "Failed to delete map.",
            });
            return;
        }

        await mutate();
        const fallback = cloneMap(initMap);
        setSelectedMap(fallback);
        setMap(fallback);
        setResetSnapshot(cloneMap(fallback));
        setNumbers(getInitNum(fallback));
        setTiles(getInitTiles(fallback));
        setPorts(getInitPorts(fallback));
        setStatusMessage({ tone: "ok", text: "Map deleted." });
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

    const beachEdgeKeys = useMemo(() => {
        const counts = new Map<string, number>();

        for (let y = 0; y < map.map.length; y++) {
            for (let x = 0; x < map.map[y].length; x++) {
                if (map.map[y][x] === TileType.None) {
                    continue;
                }
                const edges = gec(y, x);
                for (const ec of edges) {
                    const key = edgeKey(ec);
                    counts.set(key, (counts.get(key) || 0) + 1);
                }
            }
        }

        const beach = new Set<string>();
        counts.forEach((count, key) => {
            if (count === 1) {
                beach.add(key);
            }
        });

        return beach;
    }, [map]);

    const isBeachEdge = (ec: IEdgeCoordinate) => beachEdgeKeys.has(edgeKey(ec));

    const addPort = (e: any, ec: IEdgeCoordinate) => {
        e.stopPropagation();
        if (Date.now() < suppressClickUntilRef.current) {
            return;
        }
        if (!isBeachEdge(ec)) {
            return;
        }

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
        const ec = gec(y, x)[loc];
        if (!isBeachEdge(ec)) {
            return styles.portdisabled;
        }
        return hasPort(ec) ? styles.hasport : "";
    };

    const minZoom = 0.6;
    const maxZoom = 2;
    const zoomStep = 0.1;

    const increaseZoom = () => {
        setZoom((prev) => Math.min(maxZoom, Number((prev + zoomStep).toFixed(2))));
    };

    const decreaseZoom = () => {
        setZoom((prev) => Math.max(minZoom, Number((prev - zoomStep).toFixed(2))));
    };

    const onWheelZoom = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault();

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const nextZoom = Math.min(
            maxZoom,
            Math.max(minZoom, Number((zoom * zoomFactor).toFixed(3))),
        );

        if (nextZoom === zoom) {
            return;
        }

        const worldX = (mouseX - pan.x) / zoom;
        const worldY = (mouseY - pan.y) / zoom;
        const nextPanX = mouseX - worldX * nextZoom;
        const nextPanY = mouseY - worldY * nextZoom;

        setZoom(nextZoom);
        setPan({ x: nextPanX, y: nextPanY });
    };

    const shouldSuppressClick = () => Date.now() < suppressClickUntilRef.current;

    const startPan = (e: PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) {
            return;
        }
        const target = e.target as HTMLElement | null;
        if (
            target?.closest(`.${styles.hex}`) ||
            target?.closest(`.${styles.port}`)
        ) {
            return;
        }
        panStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            originX: pan.x,
            originY: pan.y,
        };
        setIsPanning(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const movePan = (e: PointerEvent<HTMLDivElement>) => {
        if (!panStartRef.current) {
            return;
        }
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) {
            suppressClickUntilRef.current = Date.now() + 120;
        }
        setPan({
            x: panStartRef.current.originX + dx,
            y: panStartRef.current.originY + dy,
        });
    };

    const endPan = (e: PointerEvent<HTMLDivElement>) => {
        if (panStartRef.current) {
            panStartRef.current = null;
            setIsPanning(false);
        }
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    return (
        <main>
            <Header />
            <div className="ui-page ui-fade-in">
                <div className="ui-grid gap-4 mt-4 sm:mt-6 xl:grid-cols-[minmax(0,2fr),minmax(300px,1fr)]">
                    <section className="ui-panel ui-panel-pad h-[78vh] overflow-hidden flex flex-col">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="relative">
                                <div className="flex items-center gap-2">
                                    <h1 className="ui-title ui-title-lg small-caps">
                                        Map Editor
                                    </h1>
                                    <button
                                        type="button"
                                        className="ui-button ui-button-ghost !w-8 !h-8 !min-h-0 !p-0"
                                        onClick={() =>
                                            setShowEditorHelp((v) => !v)
                                        }
                                        aria-label="Show editor help"
                                        title="Show editor help"
                                    >
                                        <QuestionMarkCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                {showEditorHelp && (
                                    <div className="absolute left-0 top-11 z-20 w-[320px] rounded-lg border border-[rgba(231,222,206,0.2)] bg-[rgba(20,16,14,0.96)] px-3 py-2 text-sm text-[color:var(--ui-ivory-soft)] shadow-[var(--ui-shadow-soft)]">
                                        <div>Left click changes tile resource.</div>
                                        <div>Right click resets to Random or Fog.</div>
                                        <div>Left click edge dots assigns port locations.</div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="ui-button ui-button-ghost !w-10 !h-10 !min-h-0 !p-0 text-xl"
                                    onClick={decreaseZoom}
                                    disabled={zoom <= minZoom}
                                    aria-label="Zoom out"
                                    title="Zoom out"
                                >
                                    -
                                </button>
                                <span className="text-sm min-w-[56px] text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    type="button"
                                    className="ui-button ui-button-ghost !w-10 !h-10 !min-h-0 !p-0 text-xl"
                                    onClick={increaseZoom}
                                    disabled={zoom >= maxZoom}
                                    aria-label="Zoom in"
                                    title="Zoom in"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div
                            className={classNames(
                                "relative flex-1 min-h-0 rounded-xl border border-[rgba(231,222,206,0.14)] bg-[rgba(16,12,10,0.45)] overflow-hidden",
                                isPanning ? "cursor-grabbing" : "cursor-grab",
                            )}
                            style={{ touchAction: "none" }}
                            onPointerDown={startPan}
                            onPointerMove={movePan}
                            onPointerUp={endPan}
                            onPointerCancel={endPan}
                            onWheel={onWheelZoom}
                        >
                            <div
                                className="absolute left-0 top-0 origin-top-left transition-transform duration-75"
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                }}
                            >
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
                                                onClick={() => {
                                                    if (shouldSuppressClick()) {
                                                        return;
                                                    }
                                                    cycleTileType(y, x);
                                                }}
                                                onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    if (shouldSuppressClick()) {
                                                        return;
                                                    }
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
                                                            addPort(
                                                                e,
                                                                gec(y, x)[0],
                                                            )
                                                        }
                                                    ></div>
                                                    <div
                                                        className={`${styles.port} ${
                                                            styles.r
                                                        } ${hpc(y, x, 1)}`}
                                                        onClick={(e) =>
                                                            addPort(
                                                                e,
                                                                gec(y, x)[1],
                                                            )
                                                        }
                                                    ></div>
                                                    <div
                                                        className={`${styles.port} ${
                                                            styles.br
                                                        } ${hpc(y, x, 2)}`}
                                                        onClick={(e) =>
                                                            addPort(
                                                                e,
                                                                gec(y, x)[2],
                                                            )
                                                        }
                                                    ></div>
                                                    <div
                                                        className={`${styles.port} ${
                                                            styles.bl
                                                        } ${hpc(y, x, 3)}`}
                                                        onClick={(e) =>
                                                            addPort(
                                                                e,
                                                                gec(y, x)[3],
                                                            )
                                                        }
                                                    ></div>
                                                    <div
                                                        className={`${styles.port} ${
                                                            styles.l
                                                        } ${hpc(y, x, 4)}`}
                                                        onClick={(e) =>
                                                            addPort(
                                                                e,
                                                                gec(y, x)[4],
                                                            )
                                                        }
                                                    ></div>
                                                    <div
                                                        className={`${styles.port} ${
                                                            styles.tl
                                                        } ${hpc(y, x, 5)}`}
                                                        onClick={(e) =>
                                                            addPort(
                                                                e,
                                                                gec(y, x)[5],
                                                            )
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
                            </div>
                        </div>
                    </section>
                    <aside className="ui-panel ui-panel-pad h-[78vh] overflow-auto text-[color:var(--ui-ivory)]">
                    <div className="space-y-4">
                            {statusMessage ? (
                                <div
                                    className={classNames(
                                        "rounded-md border px-3 py-2 text-sm",
                                        statusMessage.tone === "ok"
                                            ? "border-[rgba(183,221,184,0.4)] bg-[rgba(33,94,49,0.35)] text-[#b7ddb8]"
                                            : "border-[rgba(242,180,185,0.4)] bg-[rgba(122,31,36,0.4)] text-[#f2b4b9]",
                                    )}
                                >
                                    {statusMessage.text}
                                </div>
                            ) : null}
                            <div className="rounded-xl border border-[rgba(231,222,206,0.14)] bg-[rgba(24,20,18,0.52)] px-2.5 py-2.5">
                                <div>
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <div className="text-xs uppercase tracking-[0.06em] text-[color:var(--ui-ivory-soft)]">
                                                Select Map
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="ui-button ui-button-ghost !w-8 !h-8 !min-h-0 !p-0"
                                                    onClick={resetMap}
                                                    aria-label="Reset map"
                                                    title="Reset map"
                                                >
                                                    <ArrowPathIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="ui-button ui-button-ghost !w-8 !h-8 !min-h-0 !p-0"
                                                    onClick={deleteCurrentMap}
                                                    aria-label="Delete map"
                                                    title="Delete map"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="ui-button ui-button-primary !w-auto !h-8 !min-h-0 px-3"
                                                    onClick={generateJSON}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                        <Combobox
                                            value={selectedMap}
                                            onChange={(value) =>
                                                handleSelectMap(value as Map)
                                            }
                                        >
                                            <div className="relative mt-1">
                                                <div className="relative w-full text-left rounded-md shadow-md cursor-default overflow-hidden border border-[rgba(231,222,206,0.2)] bg-[rgba(24,20,18,0.92)]">
                                                    <Combobox.Input
                                                        className="ui-input !rounded-none !border-none !bg-transparent !h-10 py-1.5 pl-3 pr-10 text-base leading-5 text-[color:var(--ui-ivory)]"
                                                        autoComplete="off"
                                                        displayValue={(selected: Map) =>
                                                            selected?.name || ""
                                                        }
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
                                                            mapOptions.map((map: Map) => (
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
                                                                                {map.name ===
                                                                                ADD_NEW_MAP_KEY
                                                                                    ? "+ Add New Map"
                                                                                    : map.name}
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
                                </div>

                                <div className="grid gap-2.5 sm:grid-cols-2 mt-3">
                                    <div className="rounded-lg border border-[rgba(231,222,206,0.16)] bg-[rgba(18,14,12,0.5)] px-2.5 py-2">
                                        <div className="text-xs uppercase tracking-[0.06em] text-[color:var(--ui-ivory-soft)] mb-2">
                                            Rows
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                className="ui-button ui-button-ghost !w-8 !h-8 !min-h-0 !p-0 text-lg"
                                                onClick={delRow}
                                                disabled={map.map.length <= 1}
                                                aria-label="Decrease rows"
                                            >
                                                -
                                            </button>
                                            <span className="text-lg font-semibold min-w-[28px] text-center">
                                                {map.map.length}
                                            </span>
                                            <button
                                                type="button"
                                                className="ui-button ui-button-secondary !w-8 !h-8 !min-h-0 !p-0 text-lg"
                                                onClick={addRow}
                                                aria-label="Increase rows"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-[rgba(231,222,206,0.16)] bg-[rgba(18,14,12,0.5)] px-2.5 py-2">
                                        <div className="text-xs uppercase tracking-[0.06em] text-[color:var(--ui-ivory-soft)] mb-2">
                                            Columns
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                className="ui-button ui-button-ghost !w-8 !h-8 !min-h-0 !p-0 text-lg"
                                                onClick={delCol}
                                                disabled={map.map.every((row) => row.length <= 1)}
                                                aria-label="Decrease columns"
                                            >
                                                -
                                            </button>
                                            <span className="text-lg font-semibold min-w-[28px] text-center">
                                                {map.map[0]?.length || 0}
                                            </span>
                                            <button
                                                type="button"
                                                className="ui-button ui-button-secondary !w-8 !h-8 !min-h-0 !p-0 text-lg"
                                                onClick={addCol}
                                                aria-label="Increase columns"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[rgba(231,222,206,0.14)] bg-[rgba(24,20,18,0.52)] px-3 py-3">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <h2 className="ui-title ui-title-md !mb-0">
                                        Distribution
                                    </h2>
                                    <span
                                        className={classNames(
                                            distributionMenu === "numbers"
                                                ? numNumbers() !== numTilesThatNeedNumber()
                                                    ? "ui-pill warn"
                                                    : "ui-pill ok"
                                                : distributionMenu === "tiles"
                                              ? numRandomTilesSelected() !==
                                                numRandomTiles()
                                                  ? "ui-pill warn"
                                                  : "ui-pill ok"
                                                  : numPortsSelected() > numPortSlots
                                                    ? "ui-pill warn"
                                                    : "ui-pill ok",
                                        "mx-2",
                                    )}
                                >
                                        {distributionMenu === "numbers"
                                            ? `${numNumbers()} / ${numTilesThatNeedNumber()}`
                                            : distributionMenu === "tiles"
                                              ? `${numRandomTilesSelected()} / ${numRandomTiles()}`
                                              : `${numPortsSelected()} / ${numPortSlots}`}
                                    </span>
                                </div>

                                <div className="rounded-xl border border-[rgba(231,222,206,0.16)] bg-[rgba(18,14,12,0.5)] p-1 grid grid-cols-3 gap-1 mb-3">
                                    <button
                                        className={classNames(
                                            "ui-button !h-8 !min-h-0 !text-sm",
                                            distributionMenu === "numbers"
                                                ? "ui-button-secondary"
                                                : "ui-button-ghost !border-transparent",
                                        )}
                                        onClick={() => setDistributionMenu("numbers")}
                                    >
                                        Numbers
                                    </button>
                                    <button
                                        className={classNames(
                                            "ui-button !h-8 !min-h-0 !text-sm",
                                            distributionMenu === "tiles"
                                                ? "ui-button-secondary"
                                                : "ui-button-ghost !border-transparent",
                                        )}
                                        onClick={() => setDistributionMenu("tiles")}
                                    >
                                        Tiles
                                    </button>
                                    <button
                                        className={classNames(
                                            "ui-button !h-8 !min-h-0 !text-sm",
                                            distributionMenu === "ports"
                                                ? "ui-button-secondary"
                                                : "ui-button-ghost !border-transparent",
                                        )}
                                        onClick={() => setDistributionMenu("ports")}
                                    >
                                        Ports
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <button
                                        className="ui-button ui-button-secondary !h-9 min-w-[168px]"
                                        onClick={
                                            distributionMenu === "numbers"
                                                ? autoNumbers
                                                : distributionMenu === "tiles"
                                                  ? autoTiles
                                                  : autoPorts
                                        }
                                    >
                                        Auto Fill
                                    </button>
                                </div>

                            {distributionMenu === "numbers" && (
                                <ul className="ml-0 space-y-2">
                                    {Object.keys(numbers).map((x) => (
                                        <li
                                            key={x}
                                            className="rounded-lg border border-[rgba(231,222,206,0.14)] bg-[rgba(18,14,12,0.42)] px-2.5 py-2"
                                        >
                                            <div className="flex items-center gap-2.5">
                                            <span className="inline-block w-[30px] text-right text-sm">
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
                                            <input
                                                type="number"
                                                className="ui-input !h-8 !px-2 !py-1 !text-sm !w-[56px]"
                                                min={0}
                                                max={numTilesThatNeedNumber()}
                                                value={(numbers as any)[x]}
                                                onChange={(e) =>
                                                    changeNumber(e, Number(x))
                                                }
                                            />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {distributionMenu === "tiles" && (
                                <ul className="ml-0 space-y-2">
                                    {Object.keys(TileTypeToClass)
                                        .filter(
                                            (x) =>
                                                Number(x) !== TileType.Random &&
                                                Number(x) !== TileType.None &&
                                                Number(x) !== TileType.Fog,
                                        )
                                        .map((x) => (
                                            <li
                                                key={x}
                                                className="rounded-lg border border-[rgba(231,222,206,0.14)] bg-[rgba(18,14,12,0.42)] px-2.5 py-2"
                                            >
                                                <div className="flex items-center gap-2.5">
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
                                                <input
                                                    type="number"
                                                    className="ui-input !h-8 !px-2 !py-1 !text-sm !w-[56px]"
                                                    min={0}
                                                    max={numTilesThatNeedNumber()}
                                                    value={(tiles as any)[x]}
                                                    onChange={(e) =>
                                                        changeTile(e, Number(x))
                                                    }
                                                />
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            )}

                            {distributionMenu === "ports" && (
                                <ul className="ml-0 space-y-2">
                                    {Object.keys(ports).map((x) => (
                                        <li
                                            key={x}
                                            className="rounded-lg border border-[rgba(231,222,206,0.14)] bg-[rgba(18,14,12,0.42)] px-2.5 py-2"
                                        >
                                            <div className="flex items-center gap-2.5">
                                            <span className="inline-block w-[56px] text-right text-sm">
                                                {PortType[Number(x) as PortType]}
                                            </span>
                                            <input
                                                type="range"
                                                className="flex-1 accent-[color:var(--ui-gold)]"
                                                min="0"
                                                max={numPortSlots}
                                                step="1"
                                                value={(ports as any)[x]}
                                                onInput={(e) =>
                                                    changePort(e, Number(x))
                                                }
                                            />
                                            <input
                                                type="number"
                                                className="ui-input !h-8 !px-2 !py-1 !text-sm !w-[56px]"
                                                min={0}
                                                max={numPortSlots}
                                                value={(ports as any)[x]}
                                                onChange={(e) =>
                                                    changePort(e, Number(x))
                                                }
                                            />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            </div>
                    </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default Index;
