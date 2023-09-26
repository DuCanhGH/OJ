// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import esbuild from "esbuild";
import fastGlob from "fast-glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, "..");

const tsconfigRaw = await readFile(path.join(repoRoot, "tsconfig.json"), "utf-8");

await esbuild.build({
    entryPoints: await fastGlob("js/**/*.js", {
        cwd: repoRoot,
    }),
    outdir: "resources/bundled",
    outbase: "js",
    absWorkingDir: repoRoot,
    bundle: true,
    minify: true,
    tsconfigRaw,
});

console.log(`Compiled JS files successfully!`);
