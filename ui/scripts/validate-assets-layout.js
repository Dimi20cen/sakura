const fs = require("fs");
const path = require("path");

const uiRoot = path.resolve(__dirname, "..");
const runtimeDir = path.join(uiRoot, "assets", "runtime");
const sourceDir = path.join(uiRoot, "assets", "source");
const publicAssetsDir = path.join(uiRoot, "public", "assets");
const codeRoots = [
    path.join(uiRoot, "src"),
    path.join(uiRoot, "components"),
    path.join(uiRoot, "pages"),
];
const codeExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const forbiddenAssetPathPattern = /(^|["'`(])(?:\.\.\/)+public\/assets\//;
const forbiddenSourceBoardTexturePattern =
    /assets\/source\/base\/board\/textures\//;
const requiredPaths = [
    path.join(uiRoot, "assets", "source", "cities-knights", "city-improvements"),
    path.join(uiRoot, "assets", "source", "cities-knights", "pieces", "knight"),
    path.join(uiRoot, "assets", "source", "cities-knights", "pieces", "merchant"),
    path.join(uiRoot, "assets", "runtime", "base", "board", "textures"),
    path.join(uiRoot, "assets", "source", "seafarers", "pieces", "ship"),
    path.join(uiRoot, "assets", "runtime", "seafarers", "pieces", "ship"),
    path.join(uiRoot, "assets", "runtime", "base", "board"),
    path.join(uiRoot, "assets", "runtime", "base", "ports"),
];
const forbiddenPaths = [
    path.join(uiRoot, "assets", "runtime", "base", "pieces"),
    path.join(uiRoot, "assets", "source", "base", "tokens", "number-tokens"),
    path.join(uiRoot, "assets", "source", "dice"),
    path.join(uiRoot, "assets", "runtime", "seafarers", "pieces", "ships"),
    path.join(uiRoot, "assets", "runtime", "seafarers", "board"),
    path.join(uiRoot, "assets", "runtime", "base", "tokens", "ports"),
    path.join(uiRoot, "assets", "source", "base", "tokens", "ports"),
    path.join(uiRoot, "assets", "source", "base", "pieces", "ship"),
    path.join(uiRoot, "assets", "runtime", "seafarers", "textures", "fog.jpg"),
    path.join(uiRoot, "assets", "runtime", "seafarers", "textures", "sea.webp"),
];

function fail(message) {
    console.error(`Asset layout validation failed: ${message}`);
    process.exitCode = 1;
}

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(fullPath));
            continue;
        }
        files.push(fullPath);
    }

    return files;
}

function validateDirExists(targetPath, label) {
    if (!fs.existsSync(targetPath)) {
        fail(`${label} is missing at ${targetPath}`);
        return;
    }

    const stat = fs.statSync(targetPath);
    if (!stat.isDirectory()) {
        fail(`${label} exists but is not a directory: ${targetPath}`);
    }
}

validateDirExists(sourceDir, "source asset directory");
validateDirExists(runtimeDir, "runtime asset directory");

for (const requiredPath of requiredPaths) {
    if (!fs.existsSync(requiredPath)) {
        fail(`required asset path is missing: ${requiredPath}`);
    }
}

for (const forbiddenPath of forbiddenPaths) {
    if (fs.existsSync(forbiddenPath)) {
        fail(`legacy asset path should not exist: ${forbiddenPath}`);
    }
}

if (!fs.existsSync(publicAssetsDir)) {
    fail(`public asset alias is missing at ${publicAssetsDir}`);
} else {
    const stat = fs.lstatSync(publicAssetsDir);
    if (!stat.isSymbolicLink()) {
        fail(`public asset alias must be a symlink: ${publicAssetsDir}`);
    } else {
        const publicRealPath = fs.realpathSync(publicAssetsDir);
        const runtimeRealPath = fs.realpathSync(runtimeDir);
        if (publicRealPath !== runtimeRealPath) {
            fail(
                `public asset alias points to ${publicRealPath}, expected ${runtimeRealPath}`,
            );
        }
    }
}

for (const root of codeRoots) {
    if (!fs.existsSync(root)) {
        continue;
    }

    for (const filePath of walk(root)) {
        if (!codeExtensions.has(path.extname(filePath))) {
            continue;
        }

        const content = fs.readFileSync(filePath, "utf8");
        if (forbiddenAssetPathPattern.test(content)) {
            fail(
                `use ui/assets/runtime instead of direct ../public/assets imports: ${path.relative(uiRoot, filePath)}`,
            );
        }
        if (forbiddenSourceBoardTexturePattern.test(content)) {
            fail(
                `use ui/assets/runtime/base/board/textures instead of source board textures: ${path.relative(uiRoot, filePath)}`,
            );
        }
    }
}

if (process.exitCode) {
    process.exit(process.exitCode);
}

console.log("Asset layout validation passed.");
