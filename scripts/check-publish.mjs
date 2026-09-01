#!/usr/bin/env node
// The release gate for the npm mirror.
//
//   npm run check:publish
//
// WHY A GATE AND NOT JUST `npm publish`. This package is a MIRROR, and the
// failure mode of a mirror is not that it breaks — it is that it quietly stops
// being a mirror. A stale @333eco/brand is worse than no @333eco/brand: it
// misrepresents the institution's brand to everyone who takes it, and it does so
// silently, looking exactly like a current one.
//
// That is not a hypothetical here. On 2026-09-01 all four INTERNAL consumers of
// this layer were found three minor versions behind, every guard green, because
// currency had been left to somebody noticing a version string. An npm mirror is
// a fifth consumer with the same failure mode and a worse audience, so it does
// not get to depend on anybody noticing either.
//
// THREE VERSIONS HAVE TO AGREE, and they are three because each is load-bearing
// somewhere else:
//
//   data/brand.json   the source of truth. What the generator reads.
//   brand.lock        what every vendoring consumer compares against.
//   package.json      what npm actually publishes under.
//
// A bump that moves one and not the others is the bug this file exists to catch,
// and it is a bug that only shows up at the moment of publishing — which is
// exactly when nobody is looking at the other two files.
//
// ⚠️ THIS IS NOT check-brand.mjs AND MUST NOT BE MERGED INTO IT. That file is
// byte-identical across five repositories; this one is the package's alone. A
// consumer has no package.json version to check and would fail a check it cannot
// satisfy.
//
// House rules followed: node built-ins only, assertions that name the fix, and a
// non-zero exit that a workflow notices.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = resolve(HERE, "..");

const die = (msg) => {
    console.error(`check-publish: ${msg}`);
    process.exit(1);
};

const read = (rel) => {
    const p = join(BASE, rel);
    if (!existsSync(p)) die(`${rel} is missing`);
    try {
        return JSON.parse(readFileSync(p, "utf8"));
    } catch (e) {
        die(`${rel} is not valid JSON: ${e.message}`);
    }
};

const brand = read("data/brand.json").version;
const lock = read("brand.lock").version;
const pkg = read("package.json");

if (brand !== lock) {
    die(
        `data/brand.json is v${brand} but brand.lock is v${lock}.\n` +
            "  Run: node scripts/check-brand.mjs --write\n" +
            "  Then commit the lock in the SAME commit as the version bump."
    );
}

if (pkg.version !== brand) {
    die(
        `package.json is v${pkg.version} but the brand layer is v${brand}.\n` +
            `  Fix: set "version": "${brand}" in package.json.\n` +
            "  The npm mirror publishes under package.json's version; a mismatch ships\n" +
            "  the current bytes under a version number that means something else."
    );
}

/* --------------------------------------------------------- what npm ships ---
   Derived from the filesystem, not from a list of expected names. A hand-written
   expectation would pass forever after somebody adds a directory and forgets to
   ship it — which is the mirror going stale by omission rather than by version,
   and it is the harder one to notice because the version number stays right.

   So the question is inverted: every top-level directory that is not explicitly
   DEV-ONLY has to be in `files`. Adding a new content directory then fails here
   by default, and the fix is either to ship it or to say why it is dev-only. */

const DEV_ONLY = new Set([
    "scripts", // the guards themselves; a consumer gets check-brand.mjs by sync
    "site", //    the guidelines page, deployed to Pages rather than published
    "test",
    "node_modules",
    ".git",
    ".github"
]);

const topLevel = readdirSync(BASE, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !DEV_ONLY.has(e.name))
    .map((e) => e.name);

const shipped = new Set(pkg.files ?? []);
const unshipped = topLevel.filter((d) => !shipped.has(d));
if (unshipped.length) {
    die(
        `these directories exist but npm would not ship them: ${unshipped.join(", ")}\n` +
            `  fix: add them to "files" in package.json, or add them to DEV_ONLY here\n` +
            "  with a comment saying why they are not part of the mirror."
    );
}

// The lock's own files, checked separately: those are the bytes every vendoring
// consumer compares against, so a mirror that omits them is not a mirror at all.
const missing = Object.keys(read("brand.lock").files).filter(
    (f) => !shipped.has(f.split("/")[0])
);
if (missing.length) {
    die(
        `brand.lock describes files npm would not ship: ${missing.join(", ")}\n` +
            `  fix: add the directory to "files" in package.json`
    );
}

/* ----------------------------------------------------------- the trademark ---
   Apache-2.0 §6 grants no trademark rights and NOTICE says so at length. npm
   includes LICENSE and README automatically but NOT NOTICE, so a package whose
   only trademark reservation lives in NOTICE would ship without one. The README
   carries it too; this asserts that it still does. */

const readme = readFileSync(join(BASE, "README.md"), "utf8");
if (!/trademark/i.test(readme)) {
    die(
        "README.md does not mention trademarks.\n" +
            "  npm ships LICENSE and README but NOT NOTICE, so the reservation has to\n" +
            "  survive in the README or the mirror ships the B-Emblem with no notice\n" +
            "  attached. Restore the Trademarks section."
    );
}
if (!/vendor/i.test(readme) || !/npm/i.test(readme)) {
    die(
        "README.md must state that institution repos VENDOR this layer and do not\n" +
            "  npm-install it. Without that line the mirror invites exactly the\n" +
            "  version-range drift the vendoring mechanism exists to prevent."
    );
}

console.log(
    `check-publish: v${brand} — brand.json, brand.lock and package.json agree; ` +
        `${topLevel.length} content directories shipped; trademark and vendor notes present`
);
