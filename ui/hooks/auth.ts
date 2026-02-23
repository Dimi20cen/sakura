import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { anonymousAuth } from "../utils";
import { isBrowser } from "../utils";

export const useAnonymousAuth = (): [
    string | null,
    Dispatch<SetStateAction<string | null>>,
] => {
    const [token, setToken] = useState<string | null>(null);
    const [attempted, setAttempted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const establishToken = async () => {
            if (token || attempted) {
                return;
            }

            const authResult = await anonymousAuth();
            setAttempted(true);

            if (authResult.redirectToProfile) {
                router.replace(authResult.redirectToProfile);
                return;
            }
            if (authResult.error) {
                console.error(authResult.error);
                return;
            }

            const auth = localStorage.getItem("auth");
            setToken(auth || authResult.token);
        };

        if (isBrowser) {
            establishToken();
        }
    }, [attempted, router, token]);

    return [token, setToken];
};
