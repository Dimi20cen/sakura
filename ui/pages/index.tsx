import type { NextPage } from "next";
import Link from "next/link";
import Header from "../components/header";

const Index: NextPage = () => {
    return (
        <main>
            <Header />
            <div className="ui-page ui-fade-in">
                <section className="ui-panel ui-panel-pad mt-8 sm:mt-12 max-w-2xl mx-auto">
                    <div className="ui-grid gap-3">
                        <Link href="/sp">
                            <button className="ui-button ui-button-secondary">
                                Start Solo
                            </button>
                        </Link>
                        <Link href="/lobby">
                            <button className="ui-button ui-button-primary">
                                Multiplayer
                            </button>
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Index;
