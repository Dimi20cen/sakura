import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Image from "next/image";
import Header from "../components/header";
import { getServers } from "../utils/game";

type ProfileOption = {
    username: string;
    icon: string;
};

const profiles: ProfileOption[] = [
    { username: "Jethro7194", icon: "/assets/shared/profile-icons/jethro.webp" },
    {
        username: "KopsTiKlapsa",
        icon: "/assets/shared/profile-icons/kopsetinklapsa.webp",
    },
    { username: "staxtoPUTA", icon: "/assets/shared/profile-icons/staxtoputa.webp?v=5" },
    { username: "Giorgaros", icon: "/assets/shared/profile-icons/giorgaros.webp" },
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
            <div className="ui-page ui-fade-in">
                <section className="ui-panel ui-panel-pad mt-4 sm:mt-8 max-w-3xl mx-auto">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="ui-title ui-title-lg">
                                Choose Profile
                            </h1>
                            <p className="ui-text-muted mt-2">
                                Pick your default identity before joining
                                games.
                            </p>
                        </div>
                        <span className="ui-pill">Profile Setup</span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {profiles.map((profile) => (
                            <button
                                key={profile.username}
                                disabled={busy}
                                className="ui-panel ui-profile-card rounded-xl p-4 disabled:opacity-60 transition-colors duration-200"
                                onClick={() => chooseProfile(profile.username)}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border ui-profile-avatar-ring">
                                        <Image
                                            src={profile.icon}
                                            alt={profile.username}
                                            fill
                                            sizes="(max-width: 640px) 64px, 80px"
                                            quality={100}
                                            style={{
                                                objectFit: "cover",
                                                objectPosition: "center",
                                            }}
                                        />
                                    </span>
                                    <span className="text-sm sm:text-base font-semibold text-left text-[color:var(--ui-ivory)] break-all">
                                        {profile.username}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>

                    {error ? (
                        <div className="mt-4 rounded-md border ui-alert-error px-3 py-2 text-sm">
                            {error}
                        </div>
                    ) : null}
                </section>
            </div>
        </main>
    );
};

export default ChooseProfile;
