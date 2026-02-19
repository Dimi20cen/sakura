import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Image from "next/legacy/image";
import Header from "../components/header";
import { getServers } from "../utils/game";

type ProfileOption = {
    username: string;
    icon: string;
};

const profiles: ProfileOption[] = [
    { username: "Jethro7194", icon: "/assets/profile-icons/jethro.png" },
    {
        username: "KopsTiKlapsa",
        icon: "/assets/profile-icons/kopsetinklapsa.png",
    },
    { username: "staxtoPUTA", icon: "/assets/profile-icons/staxtoputa.png" },
    { username: "Giorgaros", icon: "/assets/profile-icons/giorgaros.png" },
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

                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    {profiles.map((profile) => (
                        <button
                            key={profile.username}
                            disabled={busy}
                            className="rounded-lg border border-white/20 bg-indigo-900/70 p-3 sm:p-4 hover:bg-indigo-800 disabled:opacity-60"
                            onClick={() => chooseProfile(profile.username)}
                        >
                            <span className="flex flex-col items-center gap-2">
                                <span className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border border-white/20">
                                    <Image
                                        src={profile.icon}
                                        alt={profile.username}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </span>
                                <span className="text-sm sm:text-base font-medium text-center break-all">
                                    {profile.username}
                                </span>
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
