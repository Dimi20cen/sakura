import {
    Fragment,
    FunctionComponent,
    MutableRefObject,
    useEffect,
    useState,
} from "react";
import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { classNames } from "../utils/styles";
import ReconnectingWebSocket from "reconnecting-websocket";

const linkClass =
    "text-sm md:text-base font-semibold tracking-wide text-[color:var(--ui-ivory)] opacity-90 hover:opacity-100 hover:text-[color:var(--ui-gold-soft)] transition-colors duration-200";

const profileIconByUsername: Record<string, string> = {
    jethro7194: "/assets/shared/profile-icons/jethro.png",
    kopstiklapsa: "/assets/shared/profile-icons/kopsetinklapsa.png",
    staxtoputa: "/assets/shared/profile-icons/staxtoputa.png",
    giorgaros: "/assets/shared/profile-icons/giorgaros.png",
};

const Header: FunctionComponent<{
    socket?: MutableRefObject<ReconnectingWebSocket | null>;
}> = ({ socket: _socket }) => {
    const [profileIcon, setProfileIcon] = useState(
        "/assets/shared/profile-icons/user-icon.jpeg",
    );

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const profileUsername = (
            localStorage.getItem("profileUsername") || ""
        ).toLowerCase();
        setProfileIcon(
            profileIconByUsername[profileUsername] ||
                "/assets/shared/profile-icons/user-icon.jpeg",
        );
    }, []);

    return (
        <Popover className="relative z-[1200] ui-header-shell backdrop-blur">
            <div
                className="absolute inset-0 z-30 pointer-events-none"
                aria-hidden="true"
            />
            <div className="relative z-20">
                <div className="ui-page !w-[min(1200px,100%-24px)] !py-0">
                    <div className="flex justify-between items-center py-3 md:py-4 md:justify-start md:space-x-10">
                    <div>
                        <span className="sr-only">SAKURA</span>
                        <div className="h-auto w-auto rounded-tl-[38%] rounded-tr-[62%] rounded-br-[43%] rounded-bl-[57%] ui-header-logo-frame -rotate-3 p-2">
                            <Link href="/" passHref>
                                <Image
                                    src="/icon.png"
                                    alt="SAKURA"
                                    height={64}
                                    width={64}
                                    className="h-[38px] w-[38px] sm:h-[43px] sm:w-[43px] cursor-pointer rotate-3"
                                />
                            </Link>
                        </div>
                    </div>
                    <div className="-mr-2 -my-2 md:hidden">
                        <Popover.Button className="ui-button ui-button-ghost !w-auto !min-h-0 rounded-lg !px-2 !py-2 inline-flex text-[color:var(--ui-ivory)]">
                            <span className="sr-only">Open menu</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </Popover.Button>
                    </div>
                    <div className="hidden md:flex-1 md:flex md:items-center md:justify-between">
                        <Popover.Group as="nav" className="flex items-center gap-8">
                            <Link href="/lobby" className={linkClass}>
                                Lobby
                            </Link>
                            <Link href="/maps" className={linkClass}>
                                Map Editor
                            </Link>
                        </Popover.Group>
                        <div className="flex items-center md:ml-12">
                            <Link
                                href="/choose-profile"
                                aria-label="Choose profile"
                                className="inline-flex items-center justify-center rounded-full p-1 ui-avatar-button transition-colors duration-200"
                            >
                                <Image
                                    src={profileIcon}
                                    alt="Profile"
                                    width={42}
                                    height={42}
                                    className="rounded-full"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <Transition
                as={Fragment}
                enter="duration-200 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-100 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <Popover.Panel
                    focus
                    className="fixed z-[1300] top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
                >
                    <div
                        className="fixed inset-0 ui-menu-backdrop backdrop-blur-[2px]"
                        aria-hidden="true"
                    />
                    <div className="relative rounded-2xl shadow-[var(--ui-shadow)] ui-menu-panel divide-y divide-[color:var(--ui-border-faint)]">
                        <div className="pt-3 pb-3 px-5 sm:pb-3">
                            <div className="flex items-center justify-between">
                                <div className="">
                                    <Image
                                        src="/icon.png"
                                        alt="SAKURA"
                                        height={64}
                                        width={64}
                                        className="h-11 w-11"
                                    />
                                </div>
                                <div className="-mr-2">
                                    <Popover.Button className="ui-button ui-button-ghost !w-auto !min-h-0 rounded-lg !px-2 !py-2 inline-flex text-[color:var(--ui-ivory)]">
                                        <span className="sr-only">
                                            Close menu
                                        </span>
                                        <XMarkIcon
                                            className="h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    </Popover.Button>
                                </div>
                            </div>
                        </div>
                        <div className="py-4 px-5">
                            <div className="grid grid-cols-1 gap-3">
                                <Link href="/lobby" className={linkClass}>
                                    Lobby
                                </Link>
                                <Link href="/maps" className={linkClass}>
                                    Map Editor
                                </Link>
                                <Link
                                    href="/choose-profile"
                                    className={classNames(
                                        linkClass,
                                        "inline-flex items-center gap-2",
                                    )}
                                >
                                    <Image
                                        src={profileIcon}
                                        alt="Profile"
                                        width={34}
                                        height={34}
                                        className="rounded-full"
                                    />
                                    Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

export default Header;
