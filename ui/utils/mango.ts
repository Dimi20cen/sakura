import { decode } from "@msgpack/msgpack";
import { PlayerState, StoreGameState } from "../tsg";
import type { Binary, ObjectId } from "bson";
import * as mongoDB from "mongodb";
import isUUID from "validator/lib/isUUID";

export const collections: {
    users?: mongoDB.Collection;
    servers?: mongoDB.Collection;
    games?: mongoDB.Collection;
    gameStates?: mongoDB.Collection;
    maps?: mongoDB.Collection;
} = {};

async function connectToDatabase() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(
        process.env.MONGO_URL!,
    );

    try {
        await client.connect();
    } catch {
        process.exit(1);
    }

    const db: mongoDB.Db = client.db("imperials");

    const serversCollection: mongoDB.Collection = db.collection("servers");
    const usersCollection: mongoDB.Collection = db.collection("users");
    const gamesCollection: mongoDB.Collection = db.collection("games");
    const gameStatesCollection: mongoDB.Collection =
        db.collection("game_states");
    const mapsCollection: mongoDB.Collection = db.collection("maps");

    collections.games = gamesCollection;
    collections.servers = serversCollection;
    collections.users = usersCollection;
    collections.gameStates = gameStatesCollection;
    collections.maps = mapsCollection;

    console.warn(`Successfully connected to database: ${db.databaseName}`);
}

async function getGamesCollection() {
    if (!collections.games) {
        await connectToDatabase();
    }
    return collections.games;
}

async function getUsersCollection() {
    if (!collections.users) {
        await connectToDatabase();
    }
    return collections.users;
}

async function getServersCollection() {
    if (!collections.servers) {
        await connectToDatabase();
    }
    return collections.servers;
}

async function getMapsCollection() {
    if (!collections.maps) {
        await connectToDatabase();
    }
    return collections.maps;
}

async function getGameStatesCollection() {
    if (!collections.gameStates) {
        await connectToDatabase();
    }
    return collections.gameStates;
}

export const gamesList = async (stage: string, userId?: string) => {
    const qStage =
        stage === "playing" ? 1 : stage === "open" ? 0 : undefined;
    const collection = await getGamesCollection();
    if (collection) {
        const query: Record<string, unknown> = {
            private: false,
            updatedAt: {
                $gte: new Date(Date.now() - 5 * 60 * 1000),
            },
        };
        if (typeof qStage === "number") {
            query.stage = qStage;
        }

        const games = await collection
            .find(query)
            .project({
                _id: 0,
                id: 1,
                active_players: 1,
                players: 1,
                private: 1,
                server: 1,
                stage: 1,
                settings: 1,
                host: 1,
                host_id: 1,
                participant_ids: 1,
            })
            .toArray();

        return games.map((game: any) => {
            const participantIds = Array.isArray(game.participant_ids)
                ? game.participant_ids
                : [];
            const isOpenGame = game.stage === 0;
            const reconnectable = Boolean(
                userId &&
                    ((isOpenGame && game.host_id === userId) ||
                        (!isOpenGame &&
                            (game.host_id === userId ||
                                participantIds.includes(userId)))),
            );

            return {
                ...game,
                reconnectable,
            };
        });
    }
};

export const serversList = async () => {
    const collection = await getServersCollection();
    if (collection) {
        return collection.find().toArray();
    }
};

export const mapsList = async (uId: string) => {
    const collection = await getMapsCollection();
    if (collection) {
        const userMaps = await collection
            .find({ creator: uId })
            .project({
                name: 1,
                _id: 0,
            })
            .toArray();

        userMaps.push({ name: "" });
        userMaps.push({ name: "--- Community Maps ---" });

        const communityMaps = await collection
            .find({ creator: { $ne: uId } })
            .project({
                name: 1,
                _id: 0,
            })
            .sort({ name: 1 })
            .toArray();

        userMaps.push(...communityMaps);

        return userMaps;
    }

    return [];
};

// Write async function to get a map by its name
export const getMap = async (name: string) => {
    const collection = await getMapsCollection();
    if (collection) {
        return collection.findOne({ name });
    }
};

export const setMap = async (name: string, user: string, map: any) => {
    const collection = await getMapsCollection();
    if (collection) {
        const existingMap = await collection.findOne({ name });

        if (JSON.stringify(map).length > 8000) {
            throw new Error("Map is too large");
        }

        validateMapPayload(name, map);

        const userMapCount = await collection.countDocuments({ creator: user });
        if (!existingMap && userMapCount >= 20) {
            throw new Error("You have too many maps");
        }

        await collection.updateOne(
            { name },
            {
                $set: {
                    name,
                    creator: user,
                    map,
                },
            },
            { upsert: true },
        );
    }
};

export const deleteMap = async (name: string, _user: string) => {
    const collection = await getMapsCollection();
    if (collection) {
        const existingMap = await collection.findOne({ name });
        if (!existingMap) {
            throw new Error("Map not found");
        }

        await collection.deleteOne({ name });
    }
};

const isInt = (v: unknown): v is number =>
    typeof v === "number" && Number.isInteger(v);

const isBool = (v: unknown): v is boolean => typeof v === "boolean";

const validTileType = (t: number) =>
    t === 0 || t === 1 || t === 2 || t === 3 || t === 4 || t === 5 || t === 6 || t === 8 || t === 9 || t === 21;

const validRandomTileType = (t: number) =>
    t === 0 || t === 1 || t === 2 || t === 3 || t === 4 || t === 5 || t === 21;

const validPortType = (p: number) => p >= 1 && p <= 6;

const validateMapPayload = (name: string, map: any) => {
    if (!map || typeof map !== "object") {
        throw new Error("Invalid map payload");
    }

    if (typeof name !== "string" || name.trim().length === 0) {
        throw new Error("Map name cannot be empty");
    }

    if (!Array.isArray(map.map) || map.map.length === 0) {
        throw new Error("Map must include at least one row");
    }

    const totalTiles = map.map.reduce((acc: number, row: unknown) => {
        if (!Array.isArray(row) || row.length === 0) {
            throw new Error("Map rows must be non-empty arrays");
        }

        row.forEach((tile) => {
            if (!isInt(tile) || !validTileType(tile)) {
                throw new Error("Map contains invalid tile type");
            }
        });

        return acc + row.length;
    }, 0);

    if (totalTiles < 5) {
        throw new Error("Map must include at least 5 tiles");
    }

    if (!Array.isArray(map.order) || map.order.length !== map.map.length) {
        throw new Error("Map row offsets are invalid");
    }
    if (!map.order.every((v: unknown) => isBool(v))) {
        throw new Error("Map row offsets are invalid");
    }

    if (!Array.isArray(map.numbers)) {
        throw new Error("Map numbers are invalid");
    }
    map.numbers.forEach((n: unknown) => {
        if (!isInt(n) || n < 2 || n > 12 || n === 7) {
            throw new Error("Map numbers are invalid");
        }
    });

    if (!Array.isArray(map.tiles)) {
        throw new Error("Map random tiles are invalid");
    }
    map.tiles.forEach((t: unknown) => {
        if (!isInt(t) || !validRandomTileType(t)) {
            throw new Error("Map random tiles are invalid");
        }
    });

    if (!Array.isArray(map.ports)) {
        throw new Error("Map ports are invalid");
    }
    map.ports.forEach((p: unknown) => {
        if (!isInt(p) || !validPortType(p)) {
            throw new Error("Map ports are invalid");
        }
    });

    if (!Array.isArray(map.port_coordinates)) {
        throw new Error("Map port coordinates are invalid");
    }

    map.port_coordinates.forEach((edge: any) => {
        if (
            !edge ||
            !edge.C1 ||
            !edge.C2 ||
            !isInt(edge.C1.X) ||
            !isInt(edge.C1.Y) ||
            !isInt(edge.C2.X) ||
            !isInt(edge.C2.Y)
        ) {
            throw new Error("Map port coordinates are invalid");
        }
    });
};

export const getGame = async (gameId: string) => {
    const collection = await getGamesCollection();
    if (collection) {
        return collection.findOne({ id: gameId });
    }
};

const getGameStates = async (_ids: ObjectId[]) => {
    const collection = await getGameStatesCollection();
    if (collection) {
        return collection.find({ _id: { $in: _ids } });
    }
};

const getUsers = async (ids: string[]) => {
    const collection = await getUsersCollection();
    if (collection) {
        return collection.find({ id: { $in: ids } }).project({
            _id: 0,
            id: 1,
            username: 1,
        });
    }
};

export const getGameStatesForUserGames = async (games: ObjectId[]) => {
    const collection = await getUsersCollection();
    if (collection) {
        const result: StoreGameState[] = [];
        const gameStates = await getGameStates(games);
        await gameStates?.forEach((gameState) => {
            const bin: Binary = gameState.state;
            const gameResult = new StoreGameState(decode(bin.buffer));
            result.push(gameResult);
        });

        const allUserIds = result.reduce(
            (acc: string[], cur: StoreGameState) => {
                const currUserIds = cur.PlayerStates.reduce(
                    (userIds: string[], curState: PlayerState) => {
                        if (!curState.IsBot) {
                            userIds.push(curState.Id);
                        }
                        return userIds;
                    },
                    [],
                );
                acc.push(...currUserIds);
                return acc;
            },
            [],
        );

        const users = await getUsers(allUserIds);
        const userMap: { [key: string]: string } = {};
        await users?.forEach((user) => {
            userMap[user.id] = user.username;
        });

        for (const game of result) {
            for (const player of game.PlayerStates) {
                if (!player.IsBot) {
                    player.Username = userMap[player.Id];
                }
            }
        }

        return result;
    }
};

export const getUserByUsername = async (username: string) => {
    const collection = await getUsersCollection();
    if (collection) {
        const user = await collection.findOne(
            { username: username },
            { projection: { _id: 1, email: 0 } },
        );

        if (user) {
            const gameStates = await getGameStatesForUserGames(
                user.games ? user.games : [],
            );
            return { ...user, games: gameStates };
        }
    }
};

export const getUserIdFromEmail = async (email: string) => {
    const collection = await getUsersCollection();
    if (collection) {
        const user = await collection.findOne(
            { email: email },
            { projection: { _id: 0, id: 1 } },
        );
        return user?.id;
    }
};

export const getUserById = async (id: string) => {
    const collection = await getUsersCollection();
    if (collection) {
        const user = await collection.findOne(
            { id: id },
            { projection: { _id: 1, email: 0 } },
        );

        if (user) {
            const gameStates = await getGameStatesForUserGames(
                user.games ? user.games : [],
            );
            return { ...user, games: gameStates };
        }
    }
};

export const getUserByIdOrUsername = (idOrUsername: string) => {
    if (isUUID(idOrUsername)) {
        return getUserById(idOrUsername);
    } else {
        return getUserByUsername(idOrUsername);
    }
};
