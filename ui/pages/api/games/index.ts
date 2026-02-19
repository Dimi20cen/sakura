// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { gamesList } from "../../../utils/mango";
import { jwtDecode } from "jwt-decode";

type Data = {
    games: any;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === "GET") {
        let userId = "";
        const token = req.headers.authorization;
        if (typeof token === "string" && token) {
            try {
                const decoded = jwtDecode(token) as { id?: string };
                userId = decoded?.id || "";
            } catch {
                userId = "";
            }
        }

        const result = await gamesList(
            req.query.stage ? (req.query.stage as string) : "all",
            userId,
        );
        res.status(200).json({ games: result });
    } else {
        res.status(405);
    }
}

export default handler;
