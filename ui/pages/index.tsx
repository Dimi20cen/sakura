import type { NextPage } from "next";
import Link from "next/link";
import Header from "../components/header";

const Index: NextPage = () => {
    return (
        <main>
            <Header />

            <div className="text-4xl">
                <div className="flex max-h-[90vh] overflow-auto">
                    <div className="w-full flex flex-col md:h-[60vh]">
                        <div className="basis-full"></div>
                        <div className="basis-auto w-11/12 sm:w-3/4 md:w-[380px] m-auto md:mr-24">
                            <Link href="/sp">
                                <button className="w-full p-4 text-3xl my-1 text-white bg-black bg-opacity-70 hover:bg-green-700 backdrop-blur rounded-lg small-caps">
                                    Single Player
                                </button>
                            </Link>
                            <Link href="/lobby">
                                <button className="w-full p-4 text-3xl my-1 text-white bg-black bg-opacity-70 hover:bg-red-700 backdrop-blur rounded-lg small-caps">
                                    Multiplayer
                                </button>
                            </Link>

                            <div className="h-12"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Index;
