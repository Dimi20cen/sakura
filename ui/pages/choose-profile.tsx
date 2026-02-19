import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Header from "../components/header";
import { getServers } from "../utils/game";

type ProfileOption = {
    username: string;
    colorLabel: string;
    colorClass: string;
};

const profiles: ProfileOption[] = [
    { username: "Jethro7194", colorLabel: "Blue", colorClass: "bg-blue-500" },
    {
        username: "KopsTiKlapsa",
        colorLabel: "Yellow",
        colorClass: "bg-yellow-400",
    },
    { username: "staxtoPUTA", colorLabel: "Plum", colorClass: "bg-fuchsia-500" },
    { username: "Giorgaros", colorLabel: "Red", colorClass: "bg-red-500" },
];

const ChooseProfile: NextPage = () => {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const returnTo = useMemo(() => {
        const q = router.query.returnTo;
        if (!q || typeof q !== "string") {
            return "/lobby";
        }
        return q.startsWith("/") ? q : "/lobby";
    }, [router.query.returnTo]);

    const chooseProfile = async (username: string) => {
        setBusy(true);
        setError("");

        try {
            const servers = await getServers();
            if (!servers.length) {
                setError("No servers are available.");
                setBusy(false);
                return;
            }

            const res = await fetch(`${servers[0]}/anon`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            });

            const data = await res.json();
            if (!res.ok || !data?.token) {
                setError(data?.error || "Could not create profile token.");
                setBusy(false);
                return;
            }

            localStorage.setItem("profileUsername", username);
            localStorage.setItem("auth", data.token);
            router.replace(returnTo);
        } catch {
            setError("Something went wrong while selecting profile.");
            setBusy(false);
        }
    };

    return (
        <main>
            <Header />
            <div className="mx-auto mt-4 sm:mt-10 max-w-xl rounded-xl bg-black/60 p-4 sm:p-6 text-white backdrop-blur w-[94%] sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-semibold">
                    Choose Profile
                </h1>
                <p className="mt-2 text-sm text-gray-200">
                    Pick your default profile before joining games.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3">
                    {profiles.map((profile) => (
                        <button
                            key={profile.username}
                            disabled={busy}
                            className="flex items-center justify-between rounded-lg border border-white/20 bg-indigo-900/70 px-3 sm:px-4 py-3 text-left hover:bg-indigo-800 disabled:opacity-60"
                            onClick={() => chooseProfile(profile.username)}
                        >
                            <span className="text-base sm:text-lg font-medium break-all pr-2">
                                {profile.username}
                            </span>
                            <span className="inline-flex items-center gap-2 text-xs sm:text-sm shrink-0">
                                <span
                                    className={`inline-block h-3 w-3 rounded-full ${profile.colorClass}`}
                                />
                                {profile.colorLabel}
                            </span>
                        </button>
                    ))}
                </div>

                {error ? (
                    <div className="mt-4 rounded-md bg-red-700/50 px-3 py-2 text-sm">
                        {error}
                    </div>
                ) : null}
            </div>
        </main>
    );
};

export default ChooseProfile;
