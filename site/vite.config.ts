import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
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

// ---------------------------------------------------------------- the pages ---
//
// ONE definition of the site's shape. rollupOptions.input is built from this
// array and so is the menu, which is the property that matters: a page that is
// not an input cannot appear in the menu, and a page in the menu cannot 404.
// A hand-kept <nav> beside a hand-kept input map is two lists that drift, and
// this repository exists because two copies of one definition always do.
//
// `dir` is the directory under src/ — "" is the home page. The URL is derived,
// never written twice.
const NAV = [
    { dir: "", label: "overview" },
    { dir: "wordmark", label: "wordmark" },
    { dir: "mark", label: "mark" },
    { dir: "color", label: "colour" },
    { dir: "tokens", label: "tokens" },
    { dir: "vendor", label: "vendoring" }
];

const urlOf = (dir: string) => (dir === "" ? "/" : `/${dir}/`);

// Shared chrome, resolved at BUILD time rather than by the client.
//
// The alternative was a copy of the header in each of six documents. That is
// the exact failure this package is built to prevent one layer down — six
// copies of one definition, byte-identical on the day they are written and
// never again — so the chrome gets the same treatment the tokens get: one
// source, mechanically distributed.
//
// transformIndexHtml runs in dev AND build, so what a reader sees on :57890 is
// what ships. An unresolved include throws rather than shipping the comment as
// visible text.
function htmlPartials(srcDir: string): Plugin {
    const read = (name: string) =>
        readFileSync(join(resolve(srcDir), "partials", `${name}.html`), "utf8");

    return {
        name: "brand-html-partials",
        enforce: "pre",
        transformIndexHtml: {
            order: "pre",
            handler(html, ctx) {
                // ctx.path is "/index.html" or "/mark/index.html" in both dev
                // and build, which is what the active item is keyed on.
                const here = ctx.path.replace(/index\.html$/, "");

                const nav = NAV.map(({ dir, label }) => {
                    const url = urlOf(dir);
                    // aria-current is the accessible signal AND the styling
                    // hook — no separate .active class to keep in sync.
                    const current = url === here ? ' aria-current="page"' : "";
                    return `<a href="${url}"${current}>${label}</a>`;
                }).join("\n                ");

                const out = html.replace(
                    /<!--#include ([a-z]+)-->/g,
                    (_m, name: string) =>
                        read(name).replace("<!--#nav-->", nav)
                );

                if (/<!--#(include|nav)/.test(out)) {
                    // A surviving include ships as an HTML comment: invisible,
                    // and the page silently loses its header. Fail the build.
                    throw new Error(
                        `html-partials: an unresolved include survived in ${ctx.path}`
                    );
                }
                return out;
            }
        }
    };
}

// A sitemap and a robots.txt, both derived from NAV — the third and fourth
// consumers of that one array, after rollupOptions.input and the menu.
//
// It matters more than it looks: this site was ONE document until the pages
// were split out, so nothing ever had to list them. Five of the six are now
// reachable only through the menu, and a hand-written sitemap would be a fifth
// copy of the site's shape to forget.
//
// ⚠️ site/public/sw.js is the ONE place the shape is still written by hand —
// publicDir copies it verbatim, so it cannot import from here. Its SHELL array
// carries the warning.
function sitemap(distDir: string): Plugin {
    return {
        name: "brand-sitemap",
        apply: "build",
        closeBundle() {
            const origin = "https://brand.333.eco";
            const day = new Date().toISOString().slice(0, 10);

            const urls = NAV.map(
                ({ dir }) =>
                    `    <url>\n` +
                    `        <loc>${origin}${urlOf(dir)}</loc>\n` +
                    `        <lastmod>${day}</lastmod>\n` +
                    `    </url>`
            ).join("\n");

            writeFileSync(
                join(resolve(distDir), "sitemap.xml"),
                `<?xml version="1.0" encoding="UTF-8"?>\n` +
                    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
                    `${urls}\n</urlset>\n`
            );

            writeFileSync(
                join(resolve(distDir), "robots.txt"),
                `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
            );

            // ---------------------------------------------------------------
            // The two lists that CANNOT import NAV, asserted against it here.
            //
            // sw.js is copied into dist verbatim by publicDir, and
            // snapshot-urls.txt is read by a GitHub workflow that never runs a
            // build — so neither can be generated from NAV, and both are
            // hand-written copies of the site's shape. That is two places to
            // forget a page, and both fail in ways nobody notices: a missing
            // SHELL entry works online and breaks only offline, and a missing
            // manifest line means the page is simply never archived on push.
            //
            // Checking them here is not as good as generating them, but it is
            // the strongest thing available: they are compared against the array
            // they both describe, not against each other, so agreeing with each
            // other while both being wrong is caught too.
            const want = NAV.map(({ dir }) => urlOf(dir));
            const root = resolve(import.meta.dirname, "..");

            const sw = readFileSync(join(import.meta.dirname, "public", "sw.js"), "utf8");
            const shell = (sw.match(/const SHELL = \[([\s\S]*?)\]/) ?? [, ""])[1];
            const missingShell = want.filter((u) => !shell.includes(`"${u}"`));
            if (missingShell.length)
                throw new Error(
                    `sw.js SHELL is missing ${missingShell.join(", ")} — ` +
                        `a page in NAV that is not precached fails only offline`
                );

            const manifestPath = join(root, "snapshot-urls.txt");
            if (existsSync(manifestPath)) {
                const manifest = readFileSync(manifestPath, "utf8");
                const missingUrls = want.filter(
                    (u) => !manifest.includes(`https://brand.333.eco${u}`)
                );
                if (missingUrls.length)
                    throw new Error(
                        `snapshot-urls.txt is missing ${missingUrls.join(", ")} — ` +
                            `a page in NAV that is never archived on push`
                    );
            }

            this.info(
                `wrote sitemap.xml (${NAV.length} urls) and robots.txt; ` +
                    `sw.js SHELL and snapshot-urls.txt agree with NAV`
            );
        }
    };
}

export default defineConfig({
    root: "src",
    publicDir: "../public",
    plugins: [
        htmlPartials("src"),
        tailwindcss(),
        sitemap(resolve(import.meta.dirname, "dist")),
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
        target: "es2021",
        rollupOptions: {
            // Derived from NAV, so the menu and the build cannot disagree.
            input: Object.fromEntries(
                NAV.map(({ dir }) => [
                    dir === "" ? "index" : dir,
                    resolve(import.meta.dirname, "src", dir, "index.html")
                ])
            )
        }
    }
});
