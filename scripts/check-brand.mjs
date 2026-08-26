#!/usr/bin/env node
// The drift guard for the vendored brand layer.
//
// WHY A DETECTOR AND NOT A PACKAGE — the same argument check-shared.mjs makes,
// and it survives this case unchanged. seysays, playsey, sayyourname and
// 333.eco each have their own CI and their own deploy cadence; no module can
// span them, so a detector does. A57 originally proposed a tag-pinned git
// dependency; that was reconsidered here because a version RANGE is drift with
// a number on it, and because of the line below.
//
// NO NETWORK, NO CREDENTIALS, NO SIBLING CHECKOUT in --check mode. That is the
// reason this works where fetching a package would not: CI is
// actions/checkout@v4 + `npm ci` with no .npmrc anywhere in the estate, so the
// guard needs nothing it does not already have and cannot be disabled by a
// missing token.
//
// THREE FILES, AND ONLY ONE OF THEM DIFFERS PER REPO:
//   brand.lock       every package file -> sha256, plus a version.
//                    BYTE-IDENTICAL in every consumer. A repo that falls
//                    behind carries an older version string, which shows up as
//                    a diff in a pull request rather than as a mystery.
//   brand.uses       which files THIS repo vendors, and where they live.
//                    The one file that must differ — the same role config.ts
//                    plays in the check-shared set.
//   check-brand.mjs  this file. Byte-identical everywhere.
//
// House rules followed: node built-ins only, assertions that name the fix and
// not just the failure, and a non-zero exit that a workflow notices.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = resolve(HERE, "..");

const LOCK = join(BASE, "brand.lock");
const USES = join(BASE, "brand.uses");

const sha = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

const die = (msg) => {
    console.error(`check-brand: ${msg}`);
    process.exit(1);
};

const args = process.argv.slice(2);
const argOf = (flag) => {
    const i = args.indexOf(flag);
    return i === -1 ? null : args[i + 1];
};

/* ------------------------------------------------------- the package itself ---
   Run inside brand.333.eco, this rewrites or verifies brand.lock against the
   real files. Detected by the presence of the package's own directories rather
   than by a flag, so it cannot be run in the wrong mode by accident. */

const isPackageRepo = existsSync(join(BASE, "css")) && existsSync(join(BASE, "data"));

const packageFiles = () => {
    const out = [];
    for (const dir of ["css", "emblem"]) {
        for (const f of readdirSync(join(BASE, dir)).sort()) out.push(`${dir}/${f}`);
    }
    return out;
};

if (isPackageRepo) {
    const version = JSON.parse(readFileSync(join(BASE, "data", "brand.json"), "utf8")).version;
    const files = Object.fromEntries(packageFiles().map((f) => [f, sha(join(BASE, f))]));
    const body = JSON.stringify({ version, files }, null, 4) + "\n";

    if (args.includes("--write")) {
        writeFileSync(LOCK, body);
        console.log(`check-brand: wrote brand.lock (v${version}, ${Object.keys(files).length} files)`);
        process.exit(0);
    }
    if (!existsSync(LOCK)) die("brand.lock is missing. Run: node scripts/check-brand.mjs --write");
    if (readFileSync(LOCK, "utf8") !== body) {
        die(
            "brand.lock does not match the files in css/ and emblem/.\n" +
                "  Run: node scripts/check-brand.mjs --write\n" +
                "  Then commit brand.lock in the SAME commit as the file it locks, or a\n" +
                "  consumer will sync bytes the lock does not describe."
        );
    }
    console.log(`check-brand: brand.lock is current (v${version})`);
    process.exit(0);
}

/* ------------------------------------------------------------- a consumer --- */

if (!existsSync(USES)) {
    die(
        "brand.uses is missing.\n" +
            "  It declares which brand files this repo vendors and where they live:\n" +
            '    { "dir": "partials", "files": ["tokens.css", "theme-3block.css", ...] }\n' +
            "  It is the one file in this set that differs per repo."
    );
}

const uses = JSON.parse(readFileSync(USES, "utf8"));
const targetDir = resolve(BASE, uses.dir);

const from = argOf("--from");
if (from) {
    // Sync from a sibling checkout. A deliberate, reviewable act — never
    // something CI does, which is why it is not the default and not --check.
    const src = resolve(from);
    if (!existsSync(join(src, "brand.lock"))) {
        die(`${src} has no brand.lock — is --from pointing at the brand.333.eco checkout?`);
    }
    for (const name of uses.files) {
        const origin = join(src, dirOf(name), name);
        if (!existsSync(origin)) die(`${origin} is missing from the brand checkout`);
        copyFileSync(origin, join(targetDir, name));
    }
    copyFileSync(join(src, "brand.lock"), LOCK);
    copyFileSync(join(src, "scripts", "check-brand.mjs"), join(HERE, "check-brand.mjs"));
    const v = JSON.parse(readFileSync(LOCK, "utf8")).version;
    console.log(
        `check-brand: synced ${uses.files.length} files + brand.lock from ${src} (v${v})`
    );
    process.exit(0);
}

function dirOf(name) {
    return name.endsWith(".css") ? "css" : "emblem";
}

if (!existsSync(LOCK)) {
    die("brand.lock is missing. Sync it: npm run brand:sync -- --from <path to brand.333.eco>");
}

const lock = JSON.parse(readFileSync(LOCK, "utf8"));
const problems = [];

for (const name of uses.files) {
    const key = `${dirOf(name)}/${name}`;
    const expected = lock.files[key];
    const local = join(targetDir, name);

    if (!expected) {
        problems.push(`${name} is listed in brand.uses but not in brand.lock (v${lock.version}) — is the name right?`);
        continue;
    }
    if (!existsSync(local)) {
        problems.push(`${name} is listed in brand.uses but missing from ${uses.dir}/`);
        continue;
    }
    const actual = sha(local);
    if (actual !== expected) {
        problems.push(
            `${uses.dir}/${name} does not match brand.lock v${lock.version}.\n` +
                `      expected ${expected.slice(0, 16)}…\n` +
                `      actual   ${actual.slice(0, 16)}…\n` +
                `      A brand file was edited HERE. Edits belong upstream in brand.333.eco;\n` +
                `      make the change there, bump the lock, and re-sync every consumer.`
        );
    }
}

if (problems.length) {
    console.error("check-brand: FAILED\n");
    for (const p of problems) console.error(`  - ${p}`);
    console.error(
        `\n  To take the current brand layer:\n` +
            `    npm run brand:sync -- --from ../../333.eco/brand.333.eco\n`
    );
    process.exit(1);
}

console.log(
    `check-brand: ${uses.files.length} files match brand.lock v${lock.version}`
);
