import {
    Fragment,
    FunctionComponent,
    MutableRefObject,
    useEffect,
    useState,
} from "react";
import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/legacy/image";
import Link from "next/link";
import { textBase, classNames } from "../utils/styles";
import ReconnectingWebSocket from "reconnecting-websocket";

const textClass = classNames(textBase, "text-white", "text-lg");

const profileIconByUsername: Record<string, string> = {
    jethro7194: "/assets/profile-icons/jethro.png",
    kopstiklapsa: "/assets/profile-icons/kopsetinklapsa.png",
    staxtoputa: "/assets/profile-icons/staxtoputa.png",
    giorgaros: "/assets/profile-icons/giorgaros.png",
};

const Header: FunctionComponent<{
    socket?: MutableRefObject<ReconnectingWebSocket | null>;
}> = ({ socket: _socket }) => {
    const [profileIcon, setProfileIcon] = useState(
        "/assets/profile-icons/user-icon.jpeg",
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
                "/assets/profile-icons/user-icon.jpeg",
        );
    }, []);

    return (
        <Popover className="relative bg-indigo-900">
            <div
                className="absolute inset-0 z-30 pointer-events-none"
                aria-hidden="true"
            />
            <div className="relative z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2 lg:px-8 md:justify-start md:space-x-10">
                    <div>
                        <span className="sr-only">Clash</span>
                        <div className="h-auto w-auto rounded-lg">
                            <Link href="/" passHref>
                                <Image
                                    src="/icon.png"
                                    alt="Clash"
                                    height="52"
                                    width="52"
                                    className="h-auto w-auto sm:h-12 cursor-pointer rounded-full"
                                />
                            </Link>
                        </div>
                    </div>
                    <div className="-mr-2 -my-2 md:hidden">
                        <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="sr-only">Open menu</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </Popover.Button>
                    </div>
                    <div className="hidden md:flex-1 md:flex md:items-center md:justify-between">
                        <Popover.Group as="nav" className="flex space-x-10">
                            <Link href="/lobby" className={textClass}>
                                Lobby
                            </Link>
                            <Link href="/maps" className={textClass}>
                                Map Editor
                            </Link>
                        </Popover.Group>
                        <div className="flex items-center md:ml-12">
                            <Link
                                href="/choose-profile"
                                aria-label="Choose profile"
                                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-indigo-800"
                            >
                                <Image
                                    src={profileIcon}
                                    alt="Profile"
                                    width="42"
                                    height="42"
                                    className="rounded-full"
                                />
                            </Link>
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
                    className="absolute z-30 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
                >
                    <div className="rounded-lg shadow-lg ring-black ring-opacity-5 bg-indigo-900 divide-y-2 divide-gray-50">
                        <div className="pt-3 pb-3 px-5 sm:pb-3">
                            <div className="flex items-center justify-between">
                                <div className="">
                                    <Image
                                        src="/icon.png"
                                        alt="Clash"
                                        height="52"
                                        width="52"
                                        className="rounded-full"
                                    />
                                </div>
                                <div className="-mr-2">
                                    <Popover.Button className="bg-white rounded-md p-1 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500">
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
                                <Link href="/lobby" className={textClass}>
                                    Lobby
                                </Link>
                                <Link href="/maps" className={textClass}>
                                    Map Editor
                                </Link>
                                <Link
                                    href="/choose-profile"
                                    className={classNames(
                                        textClass,
                                        "inline-flex items-center gap-2",
                                    )}
                                >
                                    <Image
                                        src={profileIcon}
                                        alt="Profile"
                                        width="34"
                                        height="34"
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
