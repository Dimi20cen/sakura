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
                        <Link
                            href="/sp"
                            className="ui-button ui-button-secondary"
                        >
                            Start Solo
                        </Link>
                        <Link
                            href="/lobby"
                            className="ui-button ui-button-primary"
                        >
                            Multiplayer
                        </Link>
                        <Link
                            href="/design/swatches"
                            className="ui-button ui-button-ghost"
                        >
                            Palette Swatches
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Index;
