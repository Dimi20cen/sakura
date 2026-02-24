import type { NextPage } from "next";
import Header from "../../components/header";

type ResourceSwatch = {
    key: string;
    label: string;
    primaryVar: string;
    secondaryVar: string;
    textVar: string;
    scope: "tile+card" | "tile-only";
};

const resourceSwatches: ResourceSwatch[] = [
    {
        key: "wood",
        label: "Wood",
        primaryVar: "--res-wood-primary",
        secondaryVar: "--res-wood-secondary",
        textVar: "--res-wood-text",
        scope: "tile+card",
    },
    {
        key: "brick",
        label: "Brick",
        primaryVar: "--res-brick-primary",
        secondaryVar: "--res-brick-secondary",
        textVar: "--res-brick-text",
        scope: "tile+card",
    },
    {
        key: "wheat",
        label: "Wheat",
        primaryVar: "--res-wheat-primary",
        secondaryVar: "--res-wheat-secondary",
        textVar: "--res-wheat-text",
        scope: "tile+card",
    },
    {
        key: "wool",
        label: "Wool",
        primaryVar: "--res-wool-primary",
        secondaryVar: "--res-wool-secondary",
        textVar: "--res-wool-text",
        scope: "tile+card",
    },
    {
        key: "ore",
        label: "Ore",
        primaryVar: "--res-ore-primary",
        secondaryVar: "--res-ore-secondary",
        textVar: "--res-ore-text",
        scope: "tile+card",
    },
    {
        key: "gold",
        label: "Gold",
        primaryVar: "--res-gold-primary",
        secondaryVar: "--res-gold-secondary",
        textVar: "--res-gold-text",
        scope: "tile-only",
    },
    {
        key: "desert",
        label: "Desert",
        primaryVar: "--res-desert-primary",
        secondaryVar: "--res-desert-secondary",
        textVar: "--res-desert-text",
        scope: "tile-only",
    },
    {
        key: "sea",
        label: "Sea",
        primaryVar: "--res-sea-primary",
        secondaryVar: "--res-sea-secondary",
        textVar: "--res-sea-text",
        scope: "tile-only",
    },
];

const Swatches: NextPage = () => {
    return (
        <main>
            <Header />
            <div className="ui-page ui-fade-in">
                <section className="ui-panel ui-panel-pad mt-4 sm:mt-8">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="ui-title ui-title-lg">
                                Resource Palette Swatches
                            </h1>
                            <p className="ui-text-muted mt-2">
                                Locked resource colors for fast board readability.
                            </p>
                        </div>
                        <span className="ui-pill">Design QA</span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {resourceSwatches.map((swatch) => (
                            <article
                                key={swatch.key}
                                className="ui-panel rounded-xl overflow-hidden border border-[color:var(--ui-border-faint)]"
                            >
                                <div
                                    className="px-4 py-4"
                                    style={{
                                        background: `linear-gradient(155deg, var(${swatch.primaryVar}), var(${swatch.secondaryVar}))`,
                                        color: `var(${swatch.textVar})`,
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold tracking-wide">
                                            {swatch.label}
                                        </h2>
                                        <span className="text-xs uppercase opacity-90">
                                            {swatch.scope}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-2 opacity-90">
                                        Tile/Card Label Preview
                                    </p>
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 border border-black/20 bg-black/10 text-xs font-semibold">
                                        <span className="inline-block w-2 h-2 rounded-full bg-current" />
                                        {swatch.label}
                                    </div>
                                </div>
                                <div className="px-4 py-3 text-xs text-[color:var(--ui-ivory-soft)] bg-[color:var(--ui-surface-panel)]">
                                    <div>
                                        Primary:{" "}
                                        <code>{`var(${swatch.primaryVar})`}</code>
                                    </div>
                                    <div className="mt-1">
                                        Secondary:{" "}
                                        <code>{`var(${swatch.secondaryVar})`}</code>
                                    </div>
                                    <div className="mt-1">
                                        Text: <code>{`var(${swatch.textVar})`}</code>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Swatches;
