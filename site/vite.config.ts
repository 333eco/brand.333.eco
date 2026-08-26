import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// The page lives in site/ but is STYLED BY THE PACKAGE ITSELF — src/page.css
// imports ../../css/tokens.css, the same bytes every consumer vendors. That is
// the whole design of this site: a wrong token renders as a wrong page, so the
// guidelines cannot drift from the thing they document, and the page doubles as
// a conformance test.
//
// fs.allow is what makes that legal in dev. Vite refuses to serve files above
// `root` by default; the package root is one level above site/, so it is named
// explicitly rather than disabling the protection.
export default defineConfig({
    root: "src",
    publicDir: "../public",
    plugins: [tailwindcss()],
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
