/**
 * B-Fingerprint℠ (qr/fingerprint.ts): the error correction against three words recorded from Adobe's TrustMark (BCH_SUPER), up to eight wrong bits put right
 * and nine refused, the fingerprint's own properties, and the reader on drawn copies with the decoder's corners a pixel out, in both positions a
 * B-Link is drawn in. The measure on real pictures is in the file's header. npm run fingerprint:test
 */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import QRCode from "qrcode";
const dir = mkdtempSync(join(tmpdir(), "bfp-")), js = (f) => ts.transpileModule(readFileSync(new URL(`../qr/${f}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('from "./bqr"', 'from "./bqr.mjs"');
writeFileSync(join(dir, "bqr.mjs"), js("bqr")); writeFileSync(join(dir, "fp.mjs"), js("fingerprint"));
const F = await import(join(dir, "fp.mjs")), B = await import(join(dir, "bqr.mjs"));
let bad = 0, n = 0; const ok = (c, m) => { n++; console.log(`${c ? "✓" : "✗"} ${m}`); if (!c) bad++; };
const bits = (s) => Array.from(s, Number), WORDS = [["1001011110001110110111001011100011001000", "01001111100100001011011000101000000000011111010011000001"], ["1000111111011100110100000111010010010100", "00011100001010110100000010001000011101010010110001111000"], ["1011110001100001111101100011010001110100", "01111110001011101100111011000011110111011111100111000000"]];
ok(WORDS.every(([d, e]) => F.bchEncode(bits(d)).join("") === e), "three words of TrustMark's own, the same correction bits");
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
{ let put = 0, lost = 0, lie = 0, nine = 0; for (let t = 0; t < 900; t++) { const d = Array.from({ length: 40 }, () => +(rnd() < 0.5)), w = [...d, ...F.bchEncode(d)], k = t % 9, at = new Set(); while (at.size < (t < 800 ? k : 9)) at.add(Math.floor(rnd() * 96)); for (const p of at) w[p] ^= 1; const r = F.bchDecode(w), good = r?.join("") === d.join(""); if (t < 800) good ? put++ : lost++; else { nine++; if (r && !good) lie++; } }
  ok(put === 800 && lost === 0, "800 words with 0 to 8 wrong bits, every one put right"); ok(lie === 0, `CONTROL: of ${nine} with nine wrong, none is read as another word`); }
const picture = (w, h, f) => { const d = new Uint8ClampedArray(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = f(x / w, y / h), i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } return d; };
const sky = (x, y) => 200 - 150 * y + 30 * x, hill = (x, y) => 60 + 150 * y - 20 * x, heart = { x: 230, y: 170, s: 53 };
const a = F.fingerprint(picture(300, 240, sky), 300, 240, heart), c = F.fingerprint(picture(300, 240, hill), 300, 240, heart);
ok(a.bits.length === 36 && a.seen.some((x) => !x) && [a, c].every((p) => p.bits.every((v, i) => p.seen[i] || v === 0)), "36 cells, none seen under the heart");
ok(JSON.stringify(a) === JSON.stringify(F.fingerprint(picture(150, 120, sky), 150, 120, { x: 115, y: 85, s: 26.5 })), "a smaller copy reads the same");
ok(a.bits.filter((v, i) => a.seen[i] && v !== c.bits[i]).length > 15, "another picture reads another");
for (const kind of ["corner", "strip"]) { const w = F.codedOf(kind, a); ok(JSON.stringify(F.readCoded(w.map(Boolean))) === JSON.stringify({ kind, bits: a.bits }), `${kind}: what was written is read`); ok(F.readCoded(w.map((b, i) => (i % 5 === 2 ? !b : !!b))) === null, `${kind}: CONTROL: 19 wrong is not read`); }
ok(F.readCoded(Array(96).fill(false)) === null && F.readCoded([]) === null, "an empty lobe says nothing");
/** A posted copy as pixels, the code and its dots at `m` px a module on a slope of light, the code turned `q` quarters (1 the point, 3 the notch). */
function posted(m, coded, q, tilt = 0) {
    const up = QRCode.create("HTTPS://B.333.ECO/7K2M9QX4B8T3", { errorCorrectionLevel: "M" }).modules, size = up.size; let grid = Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, k) => +!!up.data[r * size + k])); for (let k = 0; k < q; k++) grid = grid[0].map((_, i) => grid.map((row) => row[size - 1 - i]));
    const gx = 20.3, gy = 26 * m + 12.6, W = Math.ceil(gx + 46 * m), H = Math.ceil(gy + 34 * m), d = picture(W, H, (x, y) => 250 - 130 * x - 40 * y);
    const ink = (x0, r, on) => { if (!on) return; for (let y = Math.round(gy + r * m); y < Math.round(gy + (r + 1) * m); y++) for (let x = Math.round(gx + x0 * m + tilt * r); x < Math.round(gx + (x0 + 1) * m + tilt * r); x++) { const i = (y * W + x) * 4; if (i >= 0 && i < d.length) d[i] = d[i + 1] = d[i + 2] = Math.min(d[i], 40); } };
    for (let r = 0; r < size; r++) for (let k = 0; k < size; k++) ink(k, r, grid[r][k]); B.bqrLobeCells(up).forEach(([k, r], i) => ink(k, r, coded[i % 96]));
    const at = (u, v) => ({ x: gx + u * m, y: gy + v * m }), e = [1.3, 1.1, -1.2, -0.9], f = [-1.1, 1.2, 1.0, -1.3];
    return { up, d, W, H, corners: [at(0, size), at(0, 0), at(size, 0), at(size, size)].map((p, i) => ({ x: p.x + e[i], y: p.y + f[i] })), m };
}
const word = F.codedOf("corner", a);
for (const [q, name] of [[1, "point"], [3, "notch"]]) for (const m of [2.6, 3.9, 8]) { const s = posted(m, word, q), light = F.gray(s.d, s.W, s.H), g = F.register(s.up, light, s.corners); ok(g?.position === name && Math.abs(g.m - m) < 0.06 && JSON.stringify(F.readCoded(F.sampleCoded(s.up, light, g))) === JSON.stringify({ kind: "corner", bits: a.bits }), `${name}, ${m} px a module, corners a pixel out: the position and the dots are read`); }
{ const s = posted(5, word, 1, 0.9), l = F.gray(s.d, s.W, s.H), g = F.register(s.up, l, s.corners), r = g && F.readCoded(F.sampleCoded(s.up, l, g)); ok(!r || JSON.stringify(r.bits) === JSON.stringify(a.bits), "CONTROL: a slanted copy is read right or not at all"); ok(F.register(s.up, () => 128, s.corners) === null, "CONTROL: gray paper has no code to find"); }
const read = { kind: "corner", bits: a.bits };
ok(F.drawnFor(read, picture(300, 240, sky), 300, 240, heart).answer === "same" && F.drawnFor(read, picture(300, 240, hill), 300, 240, heart).answer === "different", "the picture it was drawn for is the same; another is different");
console.log(bad ? `${bad} of ${n} FAILED` : `all ${n} passed`); process.exit(bad ? 1 : 0);
