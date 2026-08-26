#!/usr/bin/env node
// Emits dist/ from css/tokens.css + data/*.json.
//
// WHY A GENERATOR HERE, WHEN THE ESTATE PREFERS DETECTORS. Everywhere else in
// this family the house move is "detect drift and fail the build" rather than
// "generate and commit" — check-shared, check-copy, check-rules, check-username.
// That preference holds where two hand-written things must agree. It does not
// hold here, because Swift and Kotlin cannot evaluate color-mix(in oklab, ...)
// and CSS cannot express a Swift enum: there is no pair of files a detector
// could compare. So this generates, and it ships a --check mode so the
// committed output cannot go stale — the same shape as 333.eco's
// gen:reserved / check:reserved pair.
//
// CSS IS CANONICAL. Every value is parsed out of css/tokens.css. The JSON in
// data/ holds only what a stylesheet cannot say. Nothing is typed twice; a hex
// exists in exactly one place in this repo.
//
// Node built-ins only, per house rules.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const DIST = join(ROOT, "dist");

const check = process.argv.includes("--check");

/* ------------------------------------------------------------------ oklab ---
   Björn Ottosson's OKLab, implemented here because the browser's color-mix()
   has to be reproduced on platforms that have no CSS engine. This is the main
   cost of the native leg and there is no shortcut: the derived accent family
   (--accent-soft and its six relatives) is computed at paint time on the web,
   and a native app needs the resolved numbers.

   ⚠️ Mixing with `transparent` is NOT an oklab mix. Per css-color-5, a mix
   against transparent in a rectangular space is premultiplied, so the result is
   the other colour carried at that alpha. Treating it as a hue interpolation
   toward black is the classic wrong implementation and produces muddy edges. */

const srgbToLinear = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const linearToSrgb = (c) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

const hexToRgb = (hex) => {
    const h = hex.trim().replace(/^#/, "");
    const full =
        h.length === 3
            ? h
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : h;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
};

const rgbToHex = (rgb) =>
    "#" +
    rgb
        .map((c) =>
            Math.round(Math.min(1, Math.max(0, c)) * 255)
                .toString(16)
                .padStart(2, "0")
        )
        .join("");

const linearToOklab = ([r, g, b]) => {
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
    return [
        0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
    ];
};

const oklabToLinear = ([L, a, b]) => {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    ];
};

// mix(A, pct, B) in oklab, both opaque hex. pct is A's share.
const mixOklab = (aHex, pct, bHex) => {
    const t = pct / 100;
    const A = linearToOklab(hexToRgb(aHex).map(srgbToLinear));
    const B = linearToOklab(hexToRgb(bHex).map(srgbToLinear));
    const M = A.map((v, i) => v * t + B[i] * (1 - t));
    return rgbToHex(oklabToLinear(M).map(linearToSrgb));
};

// mix(A, pct, transparent) -> A carried at that alpha.
const alphaOf = (aHex, pct) => {
    const [r, g, b] = hexToRgb(aHex).map((c) => Math.round(c * 255));
    return `rgba(${r}, ${g}, ${b}, ${+(pct / 100).toFixed(4)})`;
};

/* ------------------------------------------------------------------ parse ---
   Custom properties out of tokens.css. Comments are stripped first, then the
   text is split on `;` — values here never contain one. Last declaration wins,
   which matches the cascade for the single-file case this parses. */

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");

const parseTokens = (css) => {
    const out = new Map();
    for (const chunk of stripComments(css).split(";")) {
        const m = chunk.match(/(--[a-z0-9-]+)\s*:\s*([\s\S]+)$/i);
        if (m) out.set(m[1], m[2].replace(/\s+/g, " ").trim());
    }
    return out;
};

const tokensCss = readFileSync(join(ROOT, "css", "tokens.css"), "utf8");
const T = parseTokens(tokensCss);
const brand = JSON.parse(readFileSync(join(ROOT, "data", "brand.json"), "utf8"));
const gemData = JSON.parse(readFileSync(join(ROOT, "data", "gems.json"), "utf8"));
const auraData = JSON.parse(readFileSync(join(ROOT, "data", "auras.json"), "utf8"));
const tldData = JSON.parse(readFileSync(join(ROOT, "data", "tlds.json"), "utf8"));

const need = (name) => {
    const v = T.get(name);
    if (v === undefined) {
        console.error(
            `generate: ${name} is missing from css/tokens.css.\n` +
                `  Either it was renamed there and not here, or the parse broke.\n` +
                `  This script is the only consumer that will notice, so fix it now.`
        );
        process.exit(1);
    }
    return v;
};

/* ---------------------------------------------------------------- assemble --- */

// Gems: semantics from gems.json, hex from tokens.css. The join is the point.
const gems = gemData.gems.map((g) => ({ ...g, hex: need(g.token) }));
const siteValues = gemData.siteValues.map((s) => ({ ...s, hex: need(s.token) }));

// The aura ramp joins the same way, for the same reason. Its thresholds are NOT
// joined: COLOR_BUCKETS in the app's compute.ts is canonical for those, and
// copying them here would create the second typing this repo exists to prevent.
// What is emitted is the boundary as data/auras.json states it, labelled as a
// mirror of that file and not as a source.
const auras = auraData.buckets.map((b) => ({ ...b, hex: need(b.token) }));

// ⚠️ THE SIX-TLD RAINBOW IS EMITTED WITHOUT VALUES, ON PURPOSE. There is no
// need() call in this block and there must not be one: the corpus fixes six
// colour WORDS and no file in the estate fixes a value, so the honest emission
// is the word plus `pinned: false`. A generator that invented six hexes here
// would be manufacturing canon, which is the one thing it is not for.
const tlds = tldData.tlds.map((t) => ({ ...t, hex: null }));

// THE METTA RAMP, SAMPLED. The web mixes in OKLab; a native lerp between two
// stops in sRGB is a DIFFERENT COLOUR through the middle of every segment, so
// emitting only the seven stops would hand the native targets a ramp that
// quietly disagrees with the web one. This generator already speaks OKLab, so
// it resolves the curve here and ships the samples. Native code then lerps
// between adjacent samples in sRGB, where the residual error across 1/24 of the
// ramp is far below a perceptible step.
//
// 25 samples = 4 per gem segment. Raise it if a segment ever visibly banded;
// nothing downstream hard-codes the count.
const METTA_SAMPLES = 25;
const mettaRamp = Array.from({ length: METTA_SAMPLES }, (_, i) => {
    const p = (i / (METTA_SAMPLES - 1)) * (gems.length - 1);
    const lo = Math.min(Math.floor(p), gems.length - 2);
    const f = p - lo;
    // mixOklab(A, pct, B) takes A's share, so the far stop carries f.
    return mixOklab(gems[lo + 1].hex, f * 100, gems[lo].hex);
});

// ⚠️ clamp() does not port. Emit the rungs a native platform can actually use
// and keep the fluid middle term visible as prose rather than silently dropping
// it — a consumer that sees only `min` and `max` should know a third term
// existed and why it was not translated.
const splitClamp = (v) => {
    const m = v.match(/^clamp\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/);
    return m
        ? { min: m[1].trim(), fluid: m[2].trim(), max: m[3].trim(), fluidPortsToNative: false }
        : { fixed: v };
};

const typeScale = Object.fromEntries(
    ["hero", "title", "lede", "sub", "body", "small", "micro"].map((k) => [
        k,
        splitClamp(need(`--text-${k}`))
    ])
);

const ROLES = [
    "bg", "bg-tint", "surface", "surface-2", "line", "line-strong",
    "ink", "ink-dim", "ink-faint", "scrim"
];

const palette = (p) => Object.fromEntries(ROLES.map((r) => [r, need(`--${p}-${r}`)]));

const softOf = (p) => ({
    mix: need(`--${p}-soft-mix`),
    with: need(`--${p}-soft-with`)
});

// Per-site: --accent-soft IS derivable and is computed here for both themes.
// --accent-ink and --accent-lift are NOT, and are declared in each site's own
// brand.css — they are named as absent rather than guessed.
const accentFor = (siteAccentToken) =>
    siteAccentToken.startsWith("--color-")
        ? need(siteAccentToken)
        : siteAccentToken;

const sites = brand.sites.map((s) => {
    const accent = accentFor(s.accent);
    const derive = (p) => {
        const { mix, with: w } = softOf(p);
        return mixOklab(accent, parseFloat(mix), w);
    };
    return {
        host: s.host,
        because: s.because,
        accentToken: s.accent,
        accent,
        accentSoft: { dark: derive("d"), light: derive("l") },
        notDerivable: {
            "--accent-ink": "site-declared; contrast decides and no formula picks correctly",
            "--accent-lift": "site-declared",
            "--accent-soft(light)": "often re-pinned per site when the generic mix misses 4.5:1 — the value above is the FORMULA's answer, not necessarily the shipped one"
        }
    };
});

const alphaFamily = (accent, p) => {
    const { mix, with: w } = softOf(p);
    const soft = mixOklab(accent, parseFloat(mix), w);
    return {
        "accent-wash": alphaOf(soft, 10),
        "accent-edge": alphaOf(soft, 25),
        "accent-edge-strong": alphaOf(soft, 45),
        "accent-halo": alphaOf(accent, 16),
        "accent-glow": alphaOf(accent, 85),
        "accent-bar": alphaOf(accent, 45)
    };
};

const tokensJson = {
    $comment:
        "GENERATED by scripts/generate.mjs. Do not edit. Values are parsed from " +
        "css/tokens.css, which is canonical; semantics come from data/. Run " +
        "`node scripts/generate.mjs --check` to prove this file is current.",
    version: brand.version,
    gems,
    reserved: gemData.reserved,
    siteValues,
    auras: {
        $comment: auraData.$comment,
        meaning: auraData.meaning,
        source: auraData.source,
        twoRings: auraData.twoRings,
        buckets: auras,
        reserved: auraData.reserved,
        collisions: auraData.collisions
    },
    tlds: {
        $comment: tldData.$comment,
        order: tldData.order,
        scope: tldData.scope,
        pinned: tldData.pinned,
        tlds,
        reserved: tldData.reserved
    },
    typeScale,
    tracking: Object.fromEntries(
        ["hero", "title", "spelt"].map((k) => [k, need(`--track-${k}`)])
    ),
    leading: Object.fromEntries(
        ["hero", "title", "body", "khmer"].map((k) => [k, need(`--leading-${k}`)])
    ),
    measure: { prose: need("--measure-prose"), column: need("--measure-column") },
    radius: Object.fromEntries(
        ["control", "card", "input", "pill"].map((k) => [k, need(`--r-${k}`)])
    ),
    control: { h: need("--control-h"), hSm: need("--control-h-sm") },
    motion: {
        ...brand.motion,
        beatDuration: need("--beat-duration"),
        beatDelay: need("--beat-delay"),
        durFast: need("--dur-fast"),
        durBase: need("--dur-base"),
        keyframes: [
            { at: "0%", scale: 1 }, { at: "14%", scale: 1.3 },
            { at: "28%", scale: 1 }, { at: "42%", scale: 1.3 },
            { at: "70%", scale: 1 }, { at: "100%", scale: 1 }
        ]
    },
    palettes: {
        dark: { ...palette("d"), soft: softOf("d") },
        light: { ...palette("l"), soft: softOf("l") }
    },
    danger: {
        base: need("--danger"),
        soft: mixOklab(need("--danger"), 80, "#ffffff"),
        edge: alphaOf(need("--danger"), 45)
    },
    // The Metta Light is CONTRACT ONLY here, and deliberately carries no values:
    // its seven stops ARE the gems above, so emitting them again would be the
    // second typing this repo exists to prevent. A native port reads `gems` in
    // order and interpolates at t.
    mettaLight: {
        ...brand.mettaLight,
        samples: METTA_SAMPLES,
        ramp: mettaRamp
    },
    accentRule: brand.accentRule,
    sites: sites.map((s) => ({
        ...s,
        alphaFamily: { dark: alphaFamily(s.accent, "d"), light: alphaFamily(s.accent, "l") }
    })),
    mark: brand.mark,
    // The path itself, so a consumer can BUILD a mark rather than re-type one.
    // viewBox 0 0 24 24; the 45-degree rotation is baked into the coordinates,
    // so never re-apply a rotation transform.
    emblemPath: readFileSync(join(ROOT, "emblem", "emblem.path.txt"), "utf8").trim(),
    wordmark: brand.wordmark
};

/* ------------------------------------------------------------------ emit --- */

const banner = (comment) => `${comment} GENERATED by scripts/generate.mjs from css/tokens.css.
${comment} Do not edit. Re-run the generator; \`--check\` proves this file current.
${comment}
${comment} ⚠️ THE FLUID TYPE SCALE DOES NOT PORT. On the web the display rungs are
${comment} clamp(min, Nvw, max) — a viewport-relative middle term with no native
${comment} equivalent. Only min and max are emitted. Pick with the platform's own
${comment} accessibility scale (Dynamic Type / sp); do not hard-code the max and
${comment} call it done.
${comment}
${comment} ⚠️ ACCENT VALUES ARE PER SITE and only --accent-soft derives. A native
${comment} app supplies --accent-ink and --accent-lift itself, exactly as each
${comment} site's brand.css does. See accentRule in dist/tokens.json.`;

const swiftColor = (hex) => {
    const [r, g, b] = hexToRgb(hex);
    return `Color(red: ${r.toFixed(4)}, green: ${g.toFixed(4)}, blue: ${b.toFixed(4)})`;
};

const swift = `${banner("//")}

import SwiftUI

public enum Brand {
    public static let version = "${brand.version}"

    /// The B-Gem media-type palette. A colour here MEANS a medium.
    /// ⚠️ Not a site palette, and not the six-TLD rainbow. Using a gem as an
    /// accent is only correct where the gem IS that product's medium.
    public enum Gem: String, CaseIterable {
${gems.map((g) => `        case ${g.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())} = "${g.name}"`).join("\n")}

        public var hex: String {
            switch self {
${gems.map((g) => `            case .${g.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}: return "${g.hex}"`).join("\n")}
            }
        }

        public var media: String {
            switch self {
${gems.map((g) => `            case .${g.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}: return "${g.media}"`).join("\n")}
            }
        }

        public var color: Color {
            switch self {
${gems.map((g) => `            case .${g.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}: return ${swiftColor(g.hex)}`).join("\n")}
            }
        }
    }

    /// Pink is ABSENT BY CONSTRUCTION — reserved for B-Dating. Not an oversight.

    /// TWO OTHER PALETTES ARE DELIBERATELY NOT EMITTED HERE, and are named as
    /// absent rather than forgotten. The AURA RAMP (seven ROYGBIV stops meaning
    /// circulation rate) has one consumer and it is a web app; it lives in
    /// dist/tokens.json and comes here when a native surface renders an aura.
    /// The SIX-TLD RAINBOW has no pinned values anywhere in the estate — six
    /// colour words and nothing else — so there is nothing to emit. See
    /// the auras and tlds blocks in dist/tokens.json.

    public struct Palette {
${ROLES.map((r) => `        public let ${r.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())}: Color`).join("\n")}
    }

    public static let dark = Palette(
${ROLES.map((r) => `        ${r.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())}: ${swiftColor(tokensJson.palettes.dark[r].startsWith("#") ? tokensJson.palettes.dark[r] : "#000000")}`).join(",\n")}
    )

    public static let light = Palette(
${ROLES.map((r) => `        ${r.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())}: ${swiftColor(tokensJson.palettes.light[r].startsWith("#") ? tokensJson.palettes.light[r] : "#ffffff")}`).join(",\n")}
    )

    public enum Radius {
        public static let control: CGFloat = 16
        public static let card: CGFloat = 20
        public static let input: CGFloat = 16
        public static let pill: CGFloat = 999
    }

    public enum Control {
        public static let height: CGFloat = 56
        public static let heightSmall: CGFloat = 36
    }

    /// The heartbeat. Two UNEQUAL beats then a long rest — systole, a weaker
    /// diastole, then most of the period at rest. THAT MORPHOLOGY is the
    /// signature, not the cadence: a 72 BPM variant was built and rejected.
    public enum Beat {
        public static let duration: Double = ${parseFloat(need("--beat-duration"))}
        public static let delay: Double = ${parseFloat(need("--beat-delay"))}
        /// (keyTime, scale) — drive a keyframe animation from these.
        public static let steps: [(Double, Double)] = [
${tokensJson.motion.keyframes.map((k) => `            (${parseFloat(k.at) / 100}, ${k.scale})`).join(",\n")}
        ]
    }

    /// THE METTA LIGHT — the session descent. One scalar in, one colour out:
    /// t is 0 at session start and 1 at session end, passing through the seven
    /// gems in order. Guards travel with it — no numerals, no totals, no
    /// streaks, no ranks; the light is the whole signal. The breath is NOT the
    /// heartbeat and carries no claim.
    ///
    /// ⚠️ Samples of an OKLAB curve, not the seven stops. Lerping two gems in
    /// sRGB gives a different colour through the middle of every segment than
    /// the web does; these are pre-resolved so both agree.
    public static let mettaRamp: [(r: Double, g: Double, b: Double)] = [
${mettaRamp.map((h) => { const [r, g, b] = hexToRgb(h); return `        (${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`; }).join(",\n")}
    ]

    public static func metta(_ t: Double) -> Color {
        let p = min(max(t, 0), 1) * Double(mettaRamp.count - 1)
        let i = min(Int(p), mettaRamp.count - 2)
        let f = p - Double(i)
        let a = mettaRamp[i], b = mettaRamp[i + 1]
        return Color(
            red: a.r + (b.r - a.r) * f,
            green: a.g + (b.g - a.g) * f,
            blue: a.b + (b.b - a.b) * f
        )
    }

    /// ⚠️ PLACEMENT RULE. \`beating\` goes on CHROME — a wordmark, an
    /// attribution line — and NEVER on a mark drawn beside a person's name,
    /// where an unverified pulse would be claiming something about them.
    /// Under Reduce Motion: stop, and substitute nothing. The static mark is
    /// Proof of Coordinate, a meaningful state rather than a degradation.

    /// The B-Emblem path, viewBox 0 0 24 24. The 45° rotation is BAKED INTO
    /// THE COORDINATES — never re-apply a rotation transform.
    public static let emblemPath = "${readFileSync(join(ROOT, "emblem", "emblem.path.txt"), "utf8").trim()}"
}
`;

const kotlinName = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const kotlinColor = (hex) => `Color(0xFF${hex.replace("#", "").toUpperCase()})`;

const kotlin = `${banner("//")}

package eco.three33.brand

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.unit.dp

object Brand {
    const val VERSION = "${brand.version}"

    /** The B-Gem media-type palette. A colour here MEANS a medium.
     *  Not a site palette, and not the six-TLD rainbow. */
    enum class Gem(val hex: String, val media: String, val color: Color) {
${gems.map((g) => `        ${g.name.toUpperCase().replace(/-/g, "_")}("${g.hex}", "${g.media}", ${kotlinColor(g.hex)})`).join(",\n")};
    }

    // Pink is ABSENT BY CONSTRUCTION — reserved for B-Dating. Not an oversight.

    // The AURA RAMP and the SIX-TLD RAINBOW are deliberately not emitted here:
    // the first has only a web consumer so far, the second has no pinned values
    // anywhere. Named as absent rather than forgotten. See the auras and
    // tlds blocks in dist/tokens.json.

    data class Palette(
${ROLES.map((r) => `        val ${kotlinName(r)}: Color`).join(",\n")}
    )

    val dark = Palette(
${ROLES.map((r) => `        ${kotlinName(r)} = ${kotlinColor(tokensJson.palettes.dark[r].startsWith("#") ? tokensJson.palettes.dark[r] : "#000000")}`).join(",\n")}
    )

    val light = Palette(
${ROLES.map((r) => `        ${kotlinName(r)} = ${kotlinColor(tokensJson.palettes.light[r].startsWith("#") ? tokensJson.palettes.light[r] : "#ffffff")}`).join(",\n")}
    )

    object Radius {
        val control = 16.dp
        val card = 20.dp
        val input = 16.dp
        val pill = 999.dp
    }

    object Control {
        val height = 56.dp
        val heightSmall = 36.dp
    }

    /** The heartbeat. Two UNEQUAL beats then a long rest. THAT MORPHOLOGY is
     *  the signature, not the cadence — a 72 BPM variant was built and
     *  rejected. Under reduced motion: stop, and substitute nothing. */
    object Beat {
        const val DURATION_MS = ${Math.round(parseFloat(need("--beat-duration")) * 1000)}
        const val DELAY_MS = ${Math.round(parseFloat(need("--beat-delay")) * 1000)}
        val STEPS = listOf(
${tokensJson.motion.keyframes.map((k) => `            ${parseFloat(k.at) / 100}f to ${k.scale}f`).join(",\n")}
        )
    }

    /** THE METTA LIGHT — the session descent. One scalar in, one colour out:
     *  t is 0 at session start and 1 at session end, passing through the seven
     *  gems in order. Guards travel with it: no numerals, no totals, no
     *  streaks, no ranks. The breath is NOT the heartbeat, and carries no
     *  claim. */
    /** ⚠️ Samples of an OKLAB curve, not the seven stops — lerping two gems in
     *  sRGB differs from the web through the middle of every segment. */
    val METTA_RAMP = listOf(
${mettaRamp.map((h) => `        ${kotlinColor(h)}`).join(",\n")}
    )

    fun metta(t: Float): Color {
        val p = t.coerceIn(0f, 1f) * (METTA_RAMP.size - 1)
        val i = p.toInt().coerceAtMost(METTA_RAMP.size - 2)
        return lerp(METTA_RAMP[i], METTA_RAMP[i + 1], p - i)
    }

    /** ⚠️ PLACEMENT RULE: a beating mark goes on CHROME and never beside a
     *  person's name. */

    /** The B-Emblem path, viewBox 0 0 24 24. The 45° rotation is BAKED INTO
     *  THE COORDINATES — never re-apply a rotation transform. */
    const val EMBLEM_PATH = "${readFileSync(join(ROOT, "emblem", "emblem.path.txt"), "utf8").trim()}"
}
`;

const outputs = {
    "tokens.json": JSON.stringify(tokensJson, null, 4) + "\n",
    "Brand.swift": swift,
    "Brand.kt": kotlin
};

if (check) {
    let stale = [];
    for (const [name, body] of Object.entries(outputs)) {
        let current = null;
        try {
            current = readFileSync(join(DIST, name), "utf8");
        } catch {
            /* missing counts as stale */
        }
        if (current !== body) stale.push(name);
    }
    if (stale.length) {
        console.error(
            `generate --check: dist/ is stale — ${stale.join(", ")}\n` +
                `  Run: node scripts/generate.mjs\n` +
                `  Then commit dist/ in the same commit as the css/ or data/ change.`
        );
        process.exit(1);
    }
    console.log(`generate --check: dist/ is current (v${brand.version})`);
    process.exit(0);
}

mkdirSync(DIST, { recursive: true });
for (const [name, body] of Object.entries(outputs)) {
    writeFileSync(join(DIST, name), body);
}
console.log(
    `generate: wrote ${Object.keys(outputs).length} files to dist/ (v${brand.version})`
);
