import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

// The page lives in site/ but is STYLED BY THE PACKAGE ITSELF — src/page.css
// imports ../../css/tokens.css, the same bytes every consumer vendors. That is
// the whole design of this site: a wrong token renders as a wrong page, so the
// guidelines cannot drift from the thing they document, and the page doubles as
// a conformance test.
//
// fs.allow is what makes that legal in dev. Vite refuses to serve files above
// `root` by default; the package root is one level above site/, so it is named
// explicitly rather than disabling the protection.

// Stamps sw.js with a hash of everything else in dist, plus the list of hashed
// assets to precache. Same shape as the estate's stampServiceWorker plugins.
//
// It runs in closeBundle, AFTER publicDir has copied sw.js into dist verbatim —
// which is why sw.js can be plain unbundled script and still know the build id.
function stampServiceWorker(distDir: string): Plugin {
    return {
        name: "brand-stamp-sw",
        apply: "build",
        closeBundle() {
            const dist = resolve(distDir);
            const swPath = join(dist, "sw.js");

            const files: string[] = [];
            const walk = (dir: string, prefix = "") => {
                for (const name of readdirSync(dir).sort()) {
                    const full = join(dir, name);
                    if (statSync(full).isDirectory()) walk(full, prefix + name + "/");
                    else files.push(prefix + name);
                }
            };
            walk(dist);

            // sw.js hashes everything EXCEPT itself — including its own bytes
            // would be a fixed point that never converges.
            const hash = createHash("sha256");
            for (const rel of files) {
                if (rel === "sw.js") continue;
                hash.update(rel);
                hash.update(readFileSync(join(dist, rel)));
            }
            const build = hash.digest("hex").slice(0, 12);

            // Only content-hashed assets are precached. The document is not in
            // this list on purpose — it is fetched fresh and cached as a
            // fallback, because its name never changes.
            const assets = files
                .filter((f) => f.startsWith("assets/"))
                .map((f) => "/" + f);

            const sw = readFileSync(swPath, "utf8")
                .replace("__BUILD_ID__", build)
                .replace("__ASSET_LIST__", JSON.stringify(assets));

            if (sw.includes("__BUILD_ID__") || sw.includes("__ASSET_LIST__")) {
                // A silently unstamped service worker caches under the literal
                // string "__BUILD_ID__" forever. Fail the build instead.
                throw new Error("stamp-sw: a placeholder survived the stamp");
            }

            writeFileSync(swPath, sw);
            this.info(`stamped sw.js as brand-${build} (${assets.length} assets)`);
        }
    };
}

export default defineConfig({
    root: "src",
    publicDir: "../public",
    plugins: [
        tailwindcss(),
        stampServiceWorker(resolve(import.meta.dirname, "dist"))
    ],
    server: {
        port: 57890,
        host: true,
        fs: { allow: [resolve(import.meta.dirname, "..")] }
    },
    preview: { port: 57890, host: true },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        target: "es2021"
    }
});
