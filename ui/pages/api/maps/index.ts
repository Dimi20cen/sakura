// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserIdFromEmail, mapsList, setMap } from "../../../utils/mango";
import { getSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

type Data = {
    maps?: any;
    error?: string;
};

const getUserIdFromAuth = async (req: NextApiRequest): Promise<string> => {
    const session = await getSession({ req });
    if (session?.user?.email) {
        return (await getUserIdFromEmail(session.user.email)) || "";
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return "";
    }

    try {
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length)
            : authHeader;
        const claims = jwtDecode(token) as { id?: string };
        return claims.id || "";
    } catch {
        return "";
    }
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const uId = await getUserIdFromAuth(req);

    if (req.method === "GET") {
        try {
            const result = await mapsList(uId);
            res.status(200).json({ maps: result });
        } catch (e) {
            res.status(403).json({ error: (e as Error).message });
        }
    } else if (req.method === "POST") {
        if (!uId) {
            res.status(403).json({ error: "Missing or invalid auth token" });
            return;
        }

        try {
            await setMap(req.body.name, uId, req.body);
        } catch (err) {
            res.status(403).json({ error: (err as Error).message });
            return;
        }

        res.status(200).json({});
    } else {
        res.status(405);
    }
}

export default handler;
