/**
 * ⭐ MOVED HERE 2026-10-04 (A295) from `thank.heartbank.ceo/scripts/bqr.test.mjs`, with the recipe it tests (`qr/bqr.ts`, `qr/bqr-card.ts`)
 *   — so every consumer that vendors the recipe vendors bytes this file has decoded. ⛔ The pre-registrations below are VERBATIM and
 *   dated; a path they name (`src/bqr.ts`, `src/qr-card.ts`) is where the recipe lived WHEN they were written. Never edit them; add.
 *   Added on the move, before it ran here: P0 — `EMBLEM_D` is byte-for-byte `emblem/emblem.path.txt` (CONTROL: one digit off is caught).
 *
 * ⭐ B-QR — THE DECODE MATRIX (`npm run bqr:test`). `src/bqr.ts` draws every code that is OURS inside the B-Emblem™; this file
 *   proves the code still scans, with three decoders that share no code, and proves it can SEE a failure (a checker that has only
 *   ever passed is an untested claim).
 *
 * Tools (deliberately NOT in package.json — a native canvas and a wasm decoder are test-only weight):
 *   BQR_TOOLS=<dir>  holding node_modules/@napi-rs/canvas + node_modules/zxing-wasm, and optionally venv/ with OpenCV:
 *     npm i --prefix "$BQR_TOOLS" @napi-rs/canvas zxing-wasm
 *     python3 -m venv "$BQR_TOOLS/venv" && "$BQR_TOOLS/venv/bin/pip" install opencv-python-headless numpy
 *   BQR_PYTHON=<python with cv2>  overrides the venv. Without one, the OpenCV column reads NOT RUN — never "pass".
 *   BQR_OUT=<dir>  where the sample PNGs land (default: a temp dir, printed).
 *
 * ⛔ PRE-REGISTERED, written before the first matrix ran (2026-10-03). The run FAILS (exit 1) on any of:
 *   P1 geometry — the painted bbox re-measures to brand.json's within 0.02; the body square lies wholly inside the silhouette
 *      eroded by the outline's inner half; and it is within 0.05 of the largest such square. Each check has a CONTROL that must fail.
 *   P2 layout — for every payload × ECC: no decorative cell inside the 4-module ring, none outside the silhouette, no three in a
 *      row or column. Controls: quiet 0 must break the ring check; a planted run of three must break the run check.
 *   P3 pixels — read back from a 1200 px render, every code module is the matrix's colour and every quiet-ring cell is white.
 *      Control: the quiet-0 render must fail the ring read.
 *   P4 determinism — the same text draws the same bytes twice; another text draws different bytes.
 *   P5 decode — every CLEAN B-QR at card 1200, card 300 and preview 300 decodes in jsQR AND ZXing, all payloads × both accents.
 *   P6 the broken control (decoration let into the quiet zone, up to the finder patterns) FAILS at least once somewhere —
 *      if it never fails, the matrix is too easy to mean anything.
 *   Everything else is REPORTED, beside the old plain card as the baseline, and gates nothing — including the ECC sweep
 *   (L/M/Q/H on the bare card), which was added AFTER the first run to justify `BQR_ECC`, and so is evidence, never a gate.
 *   BQR_JSON=<file>  also writes every case (family · size · distortion · payload · accent · one boolean per decoder).
 *
 * ⛔ §4Z — PRE-REGISTERED 2026-10-03, written before the §4Z matrix ran. The person now chooses between TWO versions (`style`):
 *   `pixels` (Version 1 — the decoration fills the padding up to ONE clear module) and `outline` (Version 2 — a white heart, the
 *   outline 3 × 0.16). The §4Y single drawing is gone, so P1–P6 now read, per version:
 *   P1 + `outline`'s body lies wholly inside the silhouette eroded by ITS outline's inner half (0.24) and is within 0.05 of the
 *      largest such square; CONTROL: a body 0.1 larger is caught.
 *   P2 `pixels`: no decorative cell inside the 1-module ring (the ring width is written HERE, not read from `src/bqr.ts`), none
 *      outside the silhouette, no three in a run; CONTROL: ring 0 is caught inside the 1-ring. `outline`: ZERO decorative cells.
 *   P3 every code module reads back as the matrix's colour in both; every cell of `pixels`' 1-ring and of `outline`'s 4-ring is
 *      white; and in `outline` the two lobes' centres are white (no decoration drew). CONTROL: the ring-0 render is caught dirty.
 *   P4 unchanged, per version; and the two versions of one text draw different bytes.
 *   P5 every CLEAN card at 1200 and 300 and preview at 300, in BOTH versions, both accents, all payloads, decodes in jsQR AND ZXing.
 *   P6 unchanged: the broken control (`pixels` with ring 0 — decoration touching the finders) fails at least once somewhere.
 *   Reported, gating nothing: each version's matrix beside the old plain card, the naked code, and the ECC sweep (on `pixels`).
 *
 * ⛔ §4AA — PRE-REGISTERED 2026-10-04, written before the §4AA matrix ran (founder: *"White heart version: keep square QR size the
 *   same but double the heart outline"* · *"make the square QR code green too; choose the shade of green that makes the B-QR both
 *   printable and scannable"*).
 *   INK — the code's modules are ONE fixed green, `BQR_INK`, chosen by THIS rule, written before the sweep: among the candidates
 *     #15803d (the accent) · #106430 (the accent-soft) · #14532d · #052e16, the LIGHTEST (highest relative luminance) that
 *     (a) PRINTS — symbol contrast SC = Rpaper − Rink, Rpaper 0.85 (uncoated office paper), Rink ≈ the ink's relative luminance,
 *         reaches ISO/IEC 15415 grade A (SC ≥ 0.70) — a margin for an office printer that lays the green down lighter than the screen;
 *     (b) SCANS — the `pixels` card in that ink at 300/200/150 px × the six distortions × the five payloads (90 cases) decodes no
 *         worse than the same card in the old near-black #16141c by more than 2 cases, in jsQR AND in ZXing.
 *     Predicted: #106430 (SC 0.756); #15803d fails (a) at SC 0.695. The ink gate: `BQR_INK` IS the rule's pick; CONTROL: #15803d is
 *     caught by (a). The sweep's numbers are printed, per ink, beside the near-black baseline.
 *     ⚠️ RESULT (first run, 2026-10-04): the prediction was WRONG — #106430 printed at A but decoded jsQR 76/90 against the old ink's
 *     79 (one past the margin); the rule picked #14532d (jsQR 77 · ZXing 83, old 79 · 83). `BQR_INK` was set to the pick AFTER the
 *     run, never the rule to the prediction. Every green sat within 3 cases of near-black (#052e16 also 76): the margin decided.
 *   ⛔ §4AA AMENDMENT — PRE-REGISTERED 2026-10-04, after the first run and BEFORE the second (founder, the same hour: *"The same
 *     green color should apply to the entire B-QR"*). The decoration and the outline now default to `BQR_INK`, so the drawing is ONE
 *     colour. The ink sweep is RE-DRAWN with the decoration in the candidate ink too (one colour per card); the baseline stays the old
 *     drawing (near-black code, #15803d decoration); the RULE IS UNCHANGED. Predicted: the pick holds at #14532d. If it moves,
 *     `BQR_INK` follows the rule. The matrix's first accent is now `BQR_INK` (the default drawing), the second the control purple;
 *     P5 must still read 60/60. Added check: a render with NO accent is byte-identical to one with accent `BQR_INK`.
 *     ✅ RESULT (second run): the pick HELD — #14532d (jsQR 77 · ZXing 83, SC 0.785); #052e16 also passed in one colour (78 · 83) but
 *     is darker, and the rule takes the lightest. P5 60/60; 85 checks. The version totals moved by at most one case (pixels card
 *     jsQR 212/240 · ZXing 226/240 in both runs). P6's broken control failed MORE (jsQR 69 of 120, was 63): a darker green touching
 *     the finders is worse — the 1-module ring is what keeps it out.
 *   P1′ `outline` strokes 6 × 0.16 = 0.96, and its body is §4Z's UNCHANGED (11.085 at (4.2112, 8.7062) — the founder's *same size*),
 *     lying inside the silhouette eroded by §4Z's half-stroke (0.24). Written here, so a body that shrank would be caught.
 *   P3′ `outline`: every cell of a 2-module ring around the code reads white (the doubled stroke reaches ≤ 0.24 units into the body's
 *     margin — about one module on the longest payload); CONTROL: the old 4-ring is caught non-white for at least one payload (the
 *     read SEES the doubled stroke). Every code module reads dark (< 128) in the green ink, in both versions.
 *   P5 unchanged — 60 clean cases, both versions, both accents, all payloads, jsQR AND ZXing — now in the green ink.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(join(ROOT, "package.json"));
// ⭐ §4Y — the two JS decoders are pinned devDependencies of this repo, so the test runs from a fresh clone (the scratch dir it was
//   built in dies with its session — a test that needs a vanished folder is a rule, not a property). `BQR_TOOLS` still overrides.
const TOOLS = process.env.BQR_TOOLS ?? ROOT;
if (!TOOLS || !existsSync(join(TOOLS, "node_modules/@napi-rs/canvas")) || !existsSync(join(TOOLS, "node_modules/zxing-wasm"))) {
    console.error(`bqr:test needs BQR_TOOLS — see the header of scripts/bqr.test.mjs:
  export BQR_TOOLS=<dir>; npm i --prefix "$BQR_TOOLS" @napi-rs/canvas zxing-wasm
  python3 -m venv "$BQR_TOOLS/venv" && "$BQR_TOOLS/venv/bin/pip" install opencv-python-headless numpy   (optional, the 3rd decoder)`);
    process.exit(2);
}
const treq = createRequire(join(TOOLS, "noop.js"));
const { createCanvas, loadImage, Path2D } = treq("@napi-rs/canvas");
const zx = treq("zxing-wasm/reader");
zx.prepareZXingModule({ overrides: { wasmBinary: readFileSync(join(TOOLS, "node_modules/zxing-wasm/dist/reader/zxing_reader.wasm")) } });
const jsQR = req("jsqr");
const QRCode = req("qrcode");
const ts = req("typescript");
globalThis.Path2D = Path2D;

const PY = process.env.BQR_PYTHON || (existsSync(join(TOOLS, "venv/bin/python")) ? join(TOOLS, "venv/bin/python") : "");
const HAVE_CV = !!PY && spawnSync(PY, ["-c", "import cv2"]).status === 0;

const OUT = process.env.BQR_OUT || mkdtempSync(join(tmpdir(), "bqr-out-"));
mkdirSync(OUT, { recursive: true });
const WORK = mkdtempSync(join(tmpdir(), "bqr-test-"));

// ---- the app's own code, transpiled — ⛔ never a copy of the drawing ------------------------------------------------------------
function transpile(file, fixes) {
    let js = ts.transpileModule(readFileSync(join(ROOT, "qr", file), "utf8"),
        { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
    for (const [from, to] of fixes) {
        if (!js.includes(from)) { console.error(`✗ transpile ${file}: expected "${from}" — the loader is stale`); process.exit(1); }
        js = js.split(from).join(to);
    }
    writeFileSync(join(WORK, file.replace(/\.ts$/, ".mjs")), js);
}
transpile("bqr.ts", [['import("qrcode")', `import(${JSON.stringify(pathToFileURL(req.resolve("qrcode")).href)})`]]);
transpile("bqr-card.ts", [['from "./bqr"', 'from "./bqr.mjs"']]);
const B = await import(pathToFileURL(join(WORK, "bqr.mjs")).href);
const C = await import(pathToFileURL(join(WORK, "bqr-card.mjs")).href);

let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? "✓" : "✗"} ${msg}`); if (!cond) failed++; };

// ---- P0 the path is the brand's (added 2026-10-04, on the move) ------------------------------------------------------------------
console.log("\n— P0 the emblem path");
{
    const brandPath = readFileSync(join(ROOT, "emblem", "emblem.path.txt"), "utf8").trim();
    ok(B.EMBLEM_D === brandPath, `EMBLEM_D is emblem/emblem.path.txt byte for byte (${brandPath.length} chars)`);
    ok(B.EMBLEM_D.replace("3.9743", "3.9744") !== brandPath, "control: a path one digit off is caught");
}

// ---- P1 geometry ---------------------------------------------------------------------------------------------------------------
console.log("\n— P1 geometry");
function raster(K, erode) {
    const N = 24 * K, c = createCanvas(N, N), g = c.getContext("2d");
    g.scale(K, K); g.fillStyle = "#000"; const p = new Path2D(B.EMBLEM_D); g.fill(p);
    if (erode) { g.strokeStyle = "#fff"; g.lineWidth = erode; g.lineJoin = "round"; g.stroke(p); }
    return { N, K, px: g.getImageData(0, 0, N, N).data };
}
{
    const { N, K, px } = raster(100, 0);
    let x0 = N, y0 = N, x1 = -1, y1 = -1;
    for (let i = 0; i < N * N; i++) if (px[i * 4 + 3] > 0) { const x = i % N, y = (i / N) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const m = { x: x0 / K, y: y0 / K, w: (x1 + 1 - x0) / K, h: (y1 + 1 - y0) / K }, E = B.EMBLEM_BOX;
    const near = (a, b) => Math.abs(a.x - b.x) < .02 && Math.abs(a.y - b.y) < .02 && Math.abs(a.w - b.w) < .02 && Math.abs(a.h - b.h) < .02;
    ok(near(m, E), `painted bbox re-measured ${m.w.toFixed(3)}×${m.h.toFixed(3)} at (${m.x.toFixed(3)}, ${m.y.toFixed(3)}) vs brand.json 18.0828×18.0851 at (3.6824, 2.2349)`);
    ok(!near({ ...m, x: m.x + .05 }, E), "control: a bbox 0.05 off is caught");
}
const ER = raster(200, B.BQR_OUTLINE);
function bodyBreaches(b, er = ER) {
    const { N, K, px } = er; let bad = 0;
    for (let y = Math.floor(b.y * K); y < Math.ceil((b.y + b.s) * K); y++) for (let x = Math.floor(b.x * K); x < Math.ceil((b.x + b.s) * K); x++) {
        const i = (y * N + x) * 4; if (!(px[i + 3] === 255 && px[i] === 0)) bad++;
    }
    return bad;
}
{
    const b = B.BQR_BODY;
    ok(bodyBreaches(b) === 0, `body square ${b.s} at (${b.x}, ${b.y}) lies inside the silhouette less half the outline (${bodyBreaches(b)} breaching px at 200 px/unit)`);
    ok(bodyBreaches({ x: b.x - .05, y: b.y, s: b.s + .1 }) > 0, "control: a body 0.1 larger is caught breaching");
    // the largest square in the eroded silhouette — the body must not waste the emblem
    const { N, K, px } = ER; const dp = new Uint16Array(N * N); let best = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x; if (!(px[i * 4 + 3] === 255 && px[i * 4] === 0)) continue;
        const v = x && y ? 1 + Math.min(dp[i - 1], dp[i - N], dp[i - N - 1]) : 1; dp[i] = v; if (v > best) best = v;
    }
    ok(best / K - b.s < .05 && best / K >= b.s, `largest inscribed square re-measured ${(best / K).toFixed(4)}; body ${b.s} uses it (slack ${(best / K - b.s).toFixed(4)})`);
}
{
    // ⭐ §4Z — Version 2's body, against §4Z's outline (3 × 0.16): the thicker stroke reaches further into the heart.
    // ⭐ §4AA — the stroke is now 6 × 0.16 and the body §4Z's, UNCHANGED (written here: a body that shrank would be caught).
    const G = B.BQR_GEOMETRY.outline, b = G.body, er = raster(200, 3 * B.BQR_OUTLINE);
    ok(Math.abs(G.outline - 6 * B.BQR_OUTLINE) < 1e-9, `outline version's stroke is ${G.outline} = 6 × ${B.BQR_OUTLINE} (§4AA: doubled)`);
    ok(b.x === 4.2112 && b.y === 8.7062 && b.s === 11.085, `outline body is §4Z's, unchanged: ${b.s} at (${b.x}, ${b.y})`);
    ok(bodyBreaches(b, er) === 0, `outline body ${b.s} at (${b.x}, ${b.y}) lies inside the silhouette less §4Z's half-stroke 0.24 (${bodyBreaches(b, er)} breaching px)`);
    ok(bodyBreaches({ x: b.x - .05, y: b.y, s: b.s + .1 }, er) > 0, "control: an outline body 0.1 larger is caught breaching");
    const { N, K, px } = er; const dp = new Uint16Array(N * N); let best = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x; if (!(px[i * 4 + 3] === 255 && px[i * 4] === 0)) continue;
        const v = x && y ? 1 + Math.min(dp[i - 1], dp[i - N], dp[i - N - 1]) : 1; dp[i] = v; if (v > best) best = v;
    }
    ok(best / K - b.s < .05 && best / K >= b.s, `outline: largest inscribed square re-measured ${(best / K).toFixed(4)}; body ${b.s} uses it`);
    ok(bodyBreaches(B.BQR_BODY, er) > 0, "control: Version 1's body would breach Version 2's thicker outline (the re-measure was needed)");
}

// ---- P2 layout -------------------------------------------------------------------------------------------------------------------
const P = [
    ["order-here", "https://homecoffee.heartbank.ceo/"],
    ["checkin-brief", "https://homecoffee.heartbank.ceo/?c=ABCD2345EFGH"],
    ["check-in", "https://homecoffee.heartbank.ceo/?here=k7m2x9pq4rtw3hjn"],
    ["referral", "https://homecoffee.heartbank.ceo/?r=K7QX2M9P"],
    ["long-120", "https://homecoffee.heartbank.ceo/?surface=storefront&tag=homecoffee&here=k7m2x9pq4rtw3hjn&lang=km&from=window-table-four"],
];
if (P[4][1].length !== 120) { console.error(`✗ the long payload is ${P[4][1].length} chars, not 120`); process.exit(1); }
console.log("\n— P2 layout");
/** ⛔ The standard's 4, written HERE — a ring check that read its width from `src/bqr.ts` would pass if that constant were lowered. */
const RING = 4;
/** ⛔ §4Z — Version 1's measured ring, written HERE for the same reason. */
const FILL_RING = 1;
/** ⛔ §4AA — the clear ring the doubled outline must leave around the code in Version 2, written HERE. */
const OUTLINE_CLEAR = 2;
ok(B.BQR_QUIET >= RING, `BQR_QUIET is ${B.BQR_QUIET} (the standard quiet zone is ${RING})`);
ok(B.BQR_GEOMETRY.pixels.ring >= FILL_RING && B.BQR_GEOMETRY.outline.ring >= RING, `rings: pixels ${B.BQR_GEOMETRY.pixels.ring} (≥ ${FILL_RING}) · outline ${B.BQR_GEOMETRY.outline.ring} (≥ ${RING})`);
function layoutBreaches(L, quietRing = FILL_RING) {
    const set = new Set(L.deco.map(([c, r]) => `${c},${r}`));
    let ring = 0, runs = 0, outside = 0;
    for (const [c, r] of L.deco) {
        if (c >= -quietRing && c < L.n + quietRing && r >= -quietRing && r < L.n + quietRing) ring++;
        if (set.has(`${c + 1},${r}`) && set.has(`${c + 2},${r}`)) runs++;
        if (set.has(`${c},${r + 1}`) && set.has(`${c},${r + 2}`)) runs++;
        if (!B.insideEmblem(L.ox + (c + .5) * L.m, L.oy + (r + .5) * L.m)) outside++;
    }
    return { ring, runs, outside };
}
for (const ecc of ["L", "M", "Q", "H"]) for (const [name, text] of P) {
    const q = QRCode.create(text, { errorCorrectionLevel: ecc }), L = B.bqrLayout(q.modules, text, { style: "pixels" });
    const v = layoutBreaches(L);
    ok(v.ring + v.runs + v.outside === 0 && L.deco.length > 100,
        `pixels ${ecc} ${name}: v${q.version} ${L.n}×${L.n}, module ${L.m.toFixed(4)} u, ${L.deco.length} decorative — ring ${v.ring} · runs ${v.runs} · outside ${v.outside}`);
    const O = B.bqrLayout(q.modules, text, { style: "outline" });
    ok(O.deco.length === 0 && O.outline === 6 * B.BQR_OUTLINE, `outline ${ecc} ${name}: ${O.deco.length} decorative · stroke ${O.outline}`);
}
{
    const q = QRCode.create(P[0][1], { errorCorrectionLevel: "M" });
    ok(layoutBreaches(B.bqrLayout(q.modules, P[0][1], { style: "pixels", quiet: 0 })).ring > 0, "control: ring 0 is caught inside the 1-ring");
    const L = B.bqrLayout(q.modules, P[0][1], { style: "pixels" }), [c, r] = L.deco[0];
    ok(layoutBreaches({ ...L, deco: [...L.deco, [c + 1, r], [c + 2, r]] }).runs > 0, "control: a planted run of three is caught");
    // ⭐ §4Z — the padding really is filled: decoration INSIDE the old 4-ring now (it was 0 in §4Y).
    ok(layoutBreaches(L, RING).ring > 0, `pixels fills the old padding: ${layoutBreaches(L, RING).ring} decorative cells inside the 4-ring`);
}

// ---- P3 pixels + P4 determinism ---------------------------------------------------------------------------------------------------
console.log("\n— P3 pixels · P4 determinism");
function renderBqr(text, size, o = {}) {
    const c = createCanvas(size, size), g = c.getContext("2d");
    const q = QRCode.create(text, { errorCorrectionLevel: o.ecc ?? B.BQR_ECC });
    B.paintBqr(g, q.modules, text, { size, ...o });
    return c;
}
function pixelRead(text, quiet, style = "pixels", ringOverride) {
    const S = 1200, c = renderBqr(text, S, { quiet, style }), px = c.getContext("2d").getImageData(0, 0, S, S).data;
    const q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC }), L = B.bqrLayout(q.modules, text, { style, quiet }), { k, tx, ty } = B.bqrPlacement(S);
    const lum = (u, v) => { const i = (Math.round(ty + v * k) * S + Math.round(tx + u * k)) * 4; return (px[i] + px[i + 1] + px[i + 2]) / 3; };
    const ring = ringOverride ?? (style === "outline" ? OUTLINE_CLEAR : FILL_RING);
    let wrong = 0, dirty = 0;
    for (let r = -ring; r < L.n + ring; r++) for (let cc = -ring; cc < L.n + ring; cc++) {
        const inCode = r >= 0 && r < L.n && cc >= 0 && cc < L.n;
        for (const [du, dv] of [[.5, .5], [.2, .2], [.8, .2], [.2, .8], [.8, .8]]) {
            const y = lum(L.ox + (cc + du) * L.m, L.oy + (r + dv) * L.m);
            if (inCode) { if ((y < 128) !== !!q.modules.data[r * L.n + cc]) wrong++; }
            else if (y < 250) dirty++;
        }
    }
    // ⭐ §4Z — Version 2's lobes stay white: the centre of each lobe (viewBox units, measured off the path) must be paper.
    const lobes = style === "outline" ? [[9.9, 4.9], [18.0, 14.1]].map(([u, v]) => lum(u, v)).filter((y) => y < 250).length : 0;
    return { wrong, dirty, lobes };
}
for (const style of ["pixels", "outline"]) for (const [name, text] of P) {
    const v = pixelRead(text, undefined, style);
    ok(v.wrong === 0 && v.dirty === 0 && v.lobes === 0, `${style} ${name}: code modules read back ${v.wrong} wrong · ring ${v.dirty} non-white samples · lobes ${v.lobes} non-white`);
}
ok(pixelRead(P[0][1], 0).dirty > 0, "control: the ring-0 render is caught with a dirty ring");
{
    // ⭐ §4AA P3′ CONTROL — the doubled stroke IS seen entering the old 4-module margin (else the 2-ring check proves nothing).
    const seen = P.map(([name, text]) => [name, pixelRead(text, undefined, "outline", RING).dirty]);
    ok(seen.some(([, d]) => d > 0), `control: the doubled outline is seen in the old 4-ring — ${seen.map(([n, d]) => `${n} ${d}`).join(" · ")} non-white samples`);
}
for (const style of ["pixels", "outline"]) {
    const a = renderBqr(P[3][1], 640, { style }).toBuffer("image/png"), b = renderBqr(P[3][1], 640, { style }).toBuffer("image/png"),
        d = renderBqr(P[1][1], 640, { style }).toBuffer("image/png");
    ok(a.equals(b), `${style}: the same text draws the same bytes twice`);
    ok(!a.equals(d), `${style} control: another text draws different bytes`);
}
ok(!renderBqr(P[3][1], 640, { style: "pixels" }).toBuffer("image/png").equals(renderBqr(P[3][1], 640, { style: "outline" }).toBuffer("image/png")),
    "the two versions of one text draw different bytes");
for (const style of ["pixels", "outline"]) {
    // ⭐ §4AA — ONE green: the default drawing IS the drawing in BQR_INK (and a control colour is not).
    const def = renderBqr(P[0][1], 640, { style }).toBuffer("image/png");
    ok(def.equals(renderBqr(P[0][1], 640, { style, accent: B.BQR_INK }).toBuffer("image/png")), `${style}: no accent draws the same bytes as accent ${B.BQR_INK} (one green)`);
    ok(!def.equals(renderBqr(P[0][1], 640, { style, accent: "#15803d" }).toBuffer("image/png")), `${style} control: accent #15803d draws different bytes`);
}

// ---- the images ------------------------------------------------------------------------------------------------------------------
const CARD_TEXT = { title: "Home Coffee", caption: "Scan to order here", foot: "homecoffee.heartbank.ceo" };
async function card(text, accent, style) {
    const c = createCanvas(C.CARD.W, C.CARD.H);
    await C.paintQrCard(c.getContext("2d"), { url: text, accent, style, ...CARD_TEXT }, "sans-serif");
    return c;
}
/** The pre-B-QR card, exactly as `drawQrCard` drew it: a plain 900 px code with a 1-module margin at y 260 — the BASELINE. */
function plainCard(text) {
    const c = createCanvas(1200, 1560), g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, 1200, 1560);
    const q = QRCode.create(text, { errorCorrectionLevel: "M" }), n = q.modules.size, s = 900 / (n + 2);
    g.fillStyle = "#000";
    for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) if (q.modules.data[r * n + cc])
        g.fillRect(Math.floor(150 + (cc + 1) * s), Math.floor(260 + (r + 1) * s), Math.ceil(s), Math.ceil(s));
    g.fillStyle = "#16141c"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "600 72px sans-serif"; g.fillText(CARD_TEXT.title, 600, 150, 1080);
    g.font = "500 54px sans-serif"; g.fillText(CARD_TEXT.caption, 600, 1290, 1080);
    return c;
}
/** The card's emblem with no words, at a chosen ECC or quiet ring — the ECC sweep, and ⛔ the BROKEN control (quiet < 4). */
function bareCard(text, { quiet, ecc = B.BQR_ECC, style = "pixels", ink, accent } = {}) {
    const c = createCanvas(C.CARD.W, C.CARD.H), g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, C.CARD.W, C.CARD.H);
    const q = QRCode.create(text, { errorCorrectionLevel: ecc });
    B.paintBqr(g, q.modules, text, { ...C.CARD.code, quiet, style, ink, accent });
    return c;
}
/** ⭐ The SAME code pixels with the emblem cut away (code box + quiet ring copied onto white) — separates what the decoration costs
 *  from what the smaller modules cost. If this fails where the B-QR fails, the decoration is not the cause. */
function nakedCard(text) {
    // ⭐ §4Z — `pixels` with the ring pushed past the emblem draws no decoration at all: the same code, the same modules.
    const src = bareCard(text, { quiet: 99 }), q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC });
    const L = B.bqrLayout(q.modules, text, { style: "pixels" }), { k, tx, ty } = B.bqrPlacement(C.CARD.code.size, C.CARD.code.x, C.CARD.code.y);
    const x = Math.round(tx + (L.ox - B.BQR_QUIET * L.m) * k) + 2, y = Math.round(ty + (L.oy - B.BQR_QUIET * L.m) * k) + 2;
    const s = Math.round((L.n + 2 * B.BQR_QUIET) * L.m * k) - 4;
    const c = createCanvas(C.CARD.W, C.CARD.H), g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, C.CARD.W, C.CARD.H); g.drawImage(src, x, y, s, s, x, y, s, s);
    return c;
}
const scale = (src, w) => {
    const h = Math.round(src.height * w / src.width), c = createCanvas(w, h), g = c.getContext("2d");
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high"; g.drawImage(src, 0, 0, w, h); return c;
};
const white = (w, h) => { const c = createCanvas(w, h), g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); return [c, g]; };
const blur = (src) => { const [c, g] = white(src.width, src.height); g.filter = `blur(${Math.max(.4, src.width / 400)}px)`; g.drawImage(src, 0, 0); return c; };
const rotate = (src, deg) => {
    const a = deg * Math.PI / 180, w = Math.ceil(Math.abs(src.width * Math.cos(a)) + Math.abs(src.height * Math.sin(a))),
        h = Math.ceil(Math.abs(src.width * Math.sin(a)) + Math.abs(src.height * Math.cos(a)));
    const [c, g] = white(w, h); g.translate(w / 2, h / 2); g.rotate(a); g.drawImage(src, -src.width / 2, -src.height / 2); return c;
};
function solve(A, b) {
    const n = b.length, M = A.map((r, i) => [...r, b[i]]);
    for (let i = 0; i < n; i++) {
        let p = i; for (let j = i + 1; j < n; j++) if (Math.abs(M[j][i]) > Math.abs(M[p][i])) p = j;
        [M[i], M[p]] = [M[p], M[i]];
        for (let j = 0; j < n; j++) if (j !== i) { const f = M[j][i] / M[i][i]; for (let k = i; k <= n; k++) M[j][k] -= f * M[i][k]; }
    }
    return M.map((r, i) => r[n] / r[i]);
}
/** A mild tilt: the top edge 14% narrower and 3% lower on one side — an inverse homography, bilinear. */
const perspective = (src) => {
    const w = src.width, h = src.height, sp = src.getContext("2d").getImageData(0, 0, w, h).data;
    const dst = [[.07 * w, .03 * h], [.93 * w, 0], [w, h], [0, h]], from = [[0, 0], [w, 0], [w, h], [0, h]];
    const A = [], bb = [];
    for (let i = 0; i < 4; i++) { const [x, y] = dst[i], [u, v] = from[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); bb.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); bb.push(v); }
    const H = solve(A, bb);
    const [c, g] = white(w, h), out = g.getImageData(0, 0, w, h), o = out.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const d = H[6] * x + H[7] * y + 1, u = (H[0] * x + H[1] * y + H[2]) / d, v = (H[3] * x + H[4] * y + H[5]) / d;
        if (u < 0 || v < 0 || u >= w - 1 || v >= h - 1) continue;
        const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0, i = (y * w + x) * 4;
        for (let ch = 0; ch < 3; ch++) {
            const p = (yy, xx) => sp[(yy * w + xx) * 4 + ch];
            o[i + ch] = (p(y0, x0) * (1 - fx) + p(y0, x0 + 1) * fx) * (1 - fy) + (p(y0 + 1, x0) * (1 - fx) + p(y0 + 1, x0 + 1) * fx) * fy;
        }
    }
    g.putImageData(out, 0, 0); return c;
};
const jpeg = async (src) => { const img = await loadImage(await src.encode("jpeg", 60)); const [c, g] = white(img.width, img.height); g.drawImage(img, 0, 0); return c; };
const DISTORT = { clean: (c) => c, blur, "rot+10": (c) => rotate(c, 10), "rot-10": (c) => rotate(c, -10), persp: perspective, jpeg60: jpeg };

// ---- decoding ---------------------------------------------------------------------------------------------------------------------
const cases = [];
let seq = 0;
async function decodeAll(family, size, name, text, accent, base) {
    for (const [dn, fn] of Object.entries(DISTORT)) {
        const img = await fn(scale(base, size)), id = img.getContext("2d").getImageData(0, 0, img.width, img.height);
        const j = jsQR(id.data, id.width, id.height, { inversionAttempts: "dontInvert" })?.data ?? null;
        const z = (await zx.readBarcodes(id, { formats: ["QRCode"], tryHarder: true, maxNumberOfSymbols: 1 }))[0]?.text ?? null;
        const file = join(WORK, `c${seq++}.png`);
        if (HAVE_CV) writeFileSync(file, img.toBuffer("image/png"));
        cases.push({ family, size, distort: dn, name, accent, text, jsqr: j === text, zxing: z === text, file });
    }
}
console.log("\n— rendering and decoding the matrix…");
// ⭐ §4AA — the default drawing (one green) and a control colour.
const ACCENTS = [B.BQR_INK, "#7c3aed"];
/** ⛔ §4AA — the candidates and the baseline, written HERE (header): the rule picks among these, never from `src/bqr.ts`. */
const INKS = ["#15803d", "#106430", "#14532d", "#052e16"];
const OLD_INK = "#16141c";
const VERSIONS = { pixels: "Version 1 (pixels)", outline: "Version 2 (outline)" };
for (const [name, text] of P) {
    for (const [style, vname] of Object.entries(VERSIONS)) for (const accent of ACCENTS) {
        const cd = await card(text, accent, style);
        for (const s of [1200, 300, 200, 150]) await decodeAll(`${vname} card`, s, name, text, accent, cd);
        const pv = renderBqr(text, 640, { accent, style });
        for (const s of [300, 200, 150]) await decodeAll(`${vname} preview`, s, name, text, accent, pv);
    }
    const pl = plainCard(text);
    for (const s of [1200, 300, 200, 150]) await decodeAll("plain card (old)", s, name, text, "—", pl);
    const nk = nakedCard(text);
    for (const s of [1200, 300, 200, 150]) await decodeAll("naked (B-QR code, emblem cut away)", s, name, text, "—", nk);
    // ⭐ The ECC sweep — bare card, green, the sizes where anything fails at all (every case passed at 1200 in the first run).
    for (const ecc of ["L", "M", "Q", "H"]) {
        const ec = bareCard(text, { ecc });
        for (const s of [300, 200, 150]) await decodeAll(`ECC ${ecc} (bare card)`, s, name, text, "#15803d", ec);
    }
    // ⭐ §4AA — the INK sweep (the pre-registered rule in the header): the `pixels` card in each candidate green and in the old ink.
    for (const ink of [OLD_INK, ...INKS]) {
        // ⭐ §4AA amendment — one colour per card: the candidate draws the decoration and outline too; the baseline is the old drawing.
        const ic = bareCard(text, { ink, accent: ink === OLD_INK ? "#15803d" : ink });
        for (const s of [300, 200, 150]) await decodeAll(`INK ${ink}`, s, name, text, "#15803d", ic);
    }
    for (const quiet of [0]) {
        const bc = bareCard(text, { quiet });
        for (const s of [1200, 300, 200, 150]) await decodeAll(`BROKEN quiet ${quiet}`, s, name, text, "#15803d", bc);
    }
}
if (HAVE_CV) {
    const py = `import sys, json, cv2
d = cv2.QRCodeDetector()
for line in sys.stdin:
    p = line.strip()
    try:
        t, _, _ = d.detectAndDecode(cv2.imread(p))
    except Exception:
        t = ""
    print(json.dumps(t or ""), flush=True)
`;
    const r = spawnSync(PY, ["-c", py], { input: cases.map((c) => c.file).join("\n") + "\n", maxBuffer: 1 << 26 });
    const lines = r.stdout.toString().trim().split("\n").map((l) => JSON.parse(l));
    if (lines.length !== cases.length) { console.error(`✗ OpenCV answered ${lines.length} of ${cases.length}\n${r.stderr}`); process.exit(1); }
    cases.forEach((c, i) => { c.opencv = lines[i] === c.text; });
}

// ---- the report -------------------------------------------------------------------------------------------------------------------
const cols = ["jsqr", "zxing", ...(HAVE_CV ? ["opencv"] : [])];
console.log(`\n— decode matrix (k/n decoded exactly; n = payloads × accents). Decoders: jsQR 1.4.0 · ZXing-C++ (zxing-wasm) · ${HAVE_CV ? "OpenCV QRCodeDetector" : "OpenCV NOT RUN"}`);
const fams = [...new Set(cases.map((c) => c.family))];
for (const f of fams) {
    console.log(`\n${f}`);
    console.log(`  ${"size".padEnd(6)}${Object.keys(DISTORT).map((d) => d.padEnd(19)).join("")}`);
    for (const s of [...new Set(cases.filter((c) => c.family === f).map((c) => c.size))]) {
        const row = Object.keys(DISTORT).map((d) => {
            const sub = cases.filter((c) => c.family === f && c.size === s && c.distort === d);
            return cols.map((k) => `${sub.filter((c) => c[k]).length}/${sub.length}`).join(" ").padEnd(19);
        });
        console.log(`  ${String(s).padEnd(6)}${row.join("")}`);
    }
    const all = cases.filter((c) => c.family === f);
    console.log(`  total ${cols.map((k) => `${k} ${all.filter((c) => c[k]).length}/${all.length}`).join(" · ")}`);
    const by = P.map(([n]) => { const s = all.filter((c) => c.name === n); return `${n} ${cols.map((k) => s.filter((c) => !c[k]).length).join("/")}`; });
    console.log(`  misses by payload (${cols.join("/")}): ${by.join(" · ")}`);
}
console.log(`  (each cell: ${cols.join(" ")})`);
if (process.env.BQR_JSON) writeFileSync(process.env.BQR_JSON, JSON.stringify(cases.map(({ file, ...c }) => c)));

console.log("\n— P5 · P6");
const must = cases.filter((c) => c.distort === "clean" && Object.values(VERSIONS).some((v) =>
    (c.family === `${v} card` && (c.size === 1200 || c.size === 300)) || (c.family === `${v} preview` && c.size === 300)));
const miss = must.filter((c) => !(c.jsqr && c.zxing));
ok(must.length === 60, `P5 aperture: ${must.length} cases (2 versions × 5 payloads × 2 accents × 3 renders = 60)`);
ok(miss.length === 0, `P5: ${must.length - miss.length}/${must.length} clean B-QRs (both versions) at card 1200 / card 300 / preview 300 decode in jsQR AND ZXing${miss.length ? " — missed: " + miss.map((c) => `${c.family} ${c.size} ${c.name} ${c.accent}`).join("; ") : ""}`);
const broken = cases.filter((c) => c.family.startsWith("BROKEN"));
const bf = cols.map((k) => `${k} ${broken.filter((c) => !c[k]).length}`).join(" · ");
ok(broken.some((c) => cols.some((k) => !c[k])), `P6: the broken control fails somewhere (failures of ${broken.length}: ${bf})`);

// ---- §4AA the ink ---------------------------------------------------------------------------------------------------------------
console.log("\n— §4AA ink (rule in the header: the lightest green at ISO/IEC 15415 grade A that decodes no worse than the old ink by > 2)");
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const SC = (hex) => 0.85 - lum(hex);
const decoded = (ink, k) => cases.filter((c) => c.family === `INK ${ink}` && c[k]).length;
const inkOf = (ink) => cases.filter((c) => c.family === `INK ${ink}`).length;
const base = { jsqr: decoded(OLD_INK, "jsqr"), zxing: decoded(OLD_INK, "zxing") };
const verdict = INKS.map((ink) => {
    const prints = SC(ink) >= 0.70, j = decoded(ink, "jsqr"), z = decoded(ink, "zxing");
    const scans = base.jsqr - j <= 2 && base.zxing - z <= 2;
    console.log(`  ${ink}  luminance ${lum(ink).toFixed(3)} · SC ${SC(ink).toFixed(3)} ${prints ? "grade A" : "below A"} · contrast ${((1.05) / (lum(ink) + 0.05)).toFixed(2)}:1`
        + ` · jsQR ${j}/${inkOf(ink)} ZXing ${z}/${inkOf(ink)} (old ink ${base.jsqr} · ${base.zxing}) → ${prints && scans ? "PASSES" : "fails " + [!prints && "(a) print", !scans && "(b) scan"].filter(Boolean).join(" + ")}`);
    return { ink, ok: prints && scans, L: lum(ink) };
});
const pick = verdict.filter((v) => v.ok).sort((a, b) => b.L - a.L)[0]?.ink ?? "none";
ok(inkOf(OLD_INK) === 90, `ink sweep aperture: ${inkOf(OLD_INK)} cases per ink (5 payloads × 3 sizes × 6 distortions = 90)`);
ok(pick === B.BQR_INK, `the rule picks ${pick}; BQR_INK is ${B.BQR_INK}`);
ok(SC("#15803d") < 0.70, `control: the accent #15803d is caught by (a) — SC ${SC("#15803d").toFixed(3)} < 0.70`);
ok(SC(OLD_INK) >= 0.70, `control: the old near-black passes (a) — SC ${SC(OLD_INK).toFixed(3)}`);

// ---- samples to look at ------------------------------------------------------------------------------------------------------------
const label = { "order-here": "Scan to order here", "check-in": "Scan when you arrive", referral: "A friend's code for Home Coffee" };
for (const [name, text] of P.filter(([n]) => n in label)) for (const style of Object.keys(VERSIONS)) {
    const c = createCanvas(C.CARD.W, C.CARD.H);
    await C.paintQrCard(c.getContext("2d"), { url: text, title: "Home Coffee", caption: label[name], foot: "homecoffee.heartbank.ceo", style }, "sans-serif");
    writeFileSync(join(OUT, `card-${style}-${name}.png`), c.toBuffer("image/png"));
    writeFileSync(join(OUT, `preview-${style}-${name}.png`), renderBqr(text, 640, { style }).toBuffer("image/png"));
}
writeFileSync(join(OUT, "broken-quiet0.png"), bareCard(P[0][1], { quiet: 0 }).toBuffer("image/png"));
writeFileSync(join(OUT, "naked-control.png"), nakedCard(P[0][1]).toBuffer("image/png"));
console.log(`\nsamples → ${OUT}`);
console.log(failed ? `\n✗ ${failed} check(s) failed` : "\n✓ all pre-registered checks passed");
process.exit(failed ? 1 : 0);
