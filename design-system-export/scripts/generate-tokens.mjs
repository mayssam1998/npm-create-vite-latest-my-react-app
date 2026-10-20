// Generates design-system-export/ from src/styles.css. Read-only on the app.
// Usage (from the source app's root): node design-system-export/scripts/generate-tokens.mjs .
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2]);
const out = path.join(root, "design-system-export");
const src = fs.readFileSync(path.join(root, "src/styles.css"), "utf8").replace(/\r\n/g, "\n");

// Blank out comments but keep offsets, so block offsets index the original text.
const blank = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

function topLevel(text) {
  const blocks = [];
  let depth = 0, start = 0, open = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      if (depth === 0) open = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        blocks.push({ prelude: text.slice(start, open).trim(), body: text.slice(open + 1, i), start: text.slice(start, open).search(/\S/) + start, end: i + 1 });
        start = i + 1;
      }
    } else if (ch === ";" && depth === 0) {
      blocks.push({ prelude: text.slice(start, i).trim(), body: null, start: text.slice(start, i).search(/\S/) + start, end: i + 1 });
      start = i + 1;
    }
  }
  return blocks;
}

function decls(body) {
  const list = [];
  let depth = 0, cur = "";
  for (const ch of body) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "{" ) throw new Error("nested block in token body");
    if (ch === ";" && depth === 0) { if (cur.trim()) list.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) list.push(cur);
  return list.map((d) => {
    const k = d.indexOf(":");
    return [d.slice(0, k).trim(), d.slice(k + 1).replace(/\s+/g, " ").trim()];
  });
}

const SEL = { root: ":root", dark: ".dark", analyst: '[data-theme="analyst"]', analystDark: '[data-theme="analyst"].dark' };

function resolve(text) {
  const blocks = topLevel(text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")));
  const by = { root: [], dark: [], analyst: [], analystDark: [], theme: [] };
  for (const b of blocks) {
    for (const [k, s] of Object.entries(SEL)) if (b.prelude === s) by[k].push(...decls(b.body));
    if (b.prelude === "@theme inline") by.theme.push(...decls(b.body));
  }
  const merge = (...lists) => Object.fromEntries(lists.flat());
  const base = merge(by.root), dark = merge(by.dark), an = merge(by.analyst), and = merge(by.analystDark);
  // Cascade on <html>: :root (0,1,0) < .dark (0,1,0, later) < [data-theme] (0,1,0, later still) < [data-theme].dark (0,2,0).
  return {
    defaultLight: { ...base },
    defaultDark: { ...base, ...dark },
    analystLight: { ...base, ...an },
    analystDark: { ...base, ...dark, ...an, ...and },
    blocks: { base, dark, an, and },
    theme: merge(by.theme),
    order: blocks,
  };
}

const R = resolve(src);
const blocks = topLevel(blank);
const slice = (pred, label) => {
  const b = blocks.filter(pred);
  if (!b.length) throw new Error("missing " + label);
  return b.map((x) => src.slice(x.start, x.end)).join("\n");
};
const sliceRange = (fromPred, toPred, label) => {
  const i = blocks.findIndex(fromPred), j = blocks.findIndex(toPred);
  if (i < 0 || j < i) throw new Error("range " + label);
  return src.slice(blocks[i].start, blocks[j].end);
};

// ---------- grouping for readable CSS ----------
const GROUPS = [
  ["Radius", (k) => k === "--radius"],
  ["Core surfaces (shadcn contract)", (k) => /^--(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring)(-foreground)?$/.test(k)],
  ["Surface", (k) => k === "--surface-subtle"],
  ["Charts", (k) => k.startsWith("--chart-")],
  ["Sidebar", (k) => k.startsWith("--sidebar")],
  ["Brand (O.P.H.I.S logo tones)", (k) => k.startsWith("--brand-")],
  ["Login stage only", (k) => k.startsWith("--ophis-")],
  ["Status", (k) => k.startsWith("--status-")],
  ["Certainty", (k) => k.startsWith("--certainty-")],
  ["Entity types", (k) => k.startsWith("--entity-")],
  ["Priority", (k) => k.startsWith("--priority-")],
  ["Tags", (k) => k.startsWith("--tag-")],
  ["Analyst event semantics", (k) => k.startsWith("--ev-")],
  ["VIP", (k) => k.startsWith("--vip")],
  ["Interception speakers", (k) => k.startsWith("--int-")],
  ["Map identifiers (one per requested identifier)", (k) => k.startsWith("--map-id-")],
  ["Reference database highlight palette", (k) => k.startsWith("--ref-")],
  ["Elevation (Analyst theme only)", (k) => k.startsWith("--shadow-")],
  ["Typography", (k) => k === "--font-mono" || k === "font-family"],
  ["Link-analysis board (hex on purpose: the WebGL renderer parses them)", (k) => k.startsWith("--board-")],
];
function groupOf(k) {
  const g = GROUPS.find(([, f]) => f(k));
  if (!g) throw new Error("ungrouped token " + k);
  return g[0];
}
function cssBlock(selector, map, intro) {
  const byGroup = new Map(GROUPS.map(([n]) => [n, []]));
  for (const [k, v] of Object.entries(map)) byGroup.get(groupOf(k)).push([k, v]);
  let s = intro ? `/* ${intro} */\n` : "";
  s += `${selector} {\n`;
  let first = true;
  for (const [name, list] of byGroup) {
    if (!list.length) continue;
    s += `${first ? "" : "\n"}  /* ${name} */\n`;
    for (const [k, v] of list) s += `  ${k}: ${v};\n`;
    first = false;
  }
  return s + "}\n";
}
const diff = (full, baseMap) => Object.fromEntries(Object.entries(full).filter(([k, v]) => baseMap[k] !== v));

// The default theme: everything resolved.
// .dark: only what differs from :root. Analyst: exactly the source blocks (they are already minimal overrides).
const darkOnly = diff(R.defaultDark, R.defaultLight);
const HEADER = `/*
 * O.P.H.I.S design tokens — generated from src/styles.css of the
 * semantic-ui-kit (Lovable) app on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand;
 * regenerate instead. Values are copied verbatim (no rounding, no conversion).
 *
 * The source file declares :root and .dark several times (shadcn slate
 * defaults, then a "single accent" layer, then the board tokens, then the
 * O.P.H.I.S brand layer). This file holds the RESULT of that cascade: one
 * :root and one .dark with the values the app actually renders. The Analyst
 * family blocks are copied as they are.
 *
 * Themes are switched on <html>:
 *   light (default)   no class
 *   dark              class="dark"
 *   Analyst family    data-theme="analyst"        (combine with .dark)
 */
`;
let tokensCss = HEADER + "\n";
tokensCss += cssBlock(":root", R.defaultLight, "Default (O.P.H.I.S) theme — light. Warm stone surfaces, cedar-green primary.") + "\n";
tokensCss += cssBlock(".dark", darkOnly, "Default (O.P.H.I.S) theme — dark. Field-night green-black, light cedar-green primary.") + "\n";
tokensCss += cssBlock('[data-theme="analyst"]', R.blocks.an, "Analyst family — light. Near-monochrome blue-grey; calmer status chroma. Sets font-family on <html>.") + "\n";
tokensCss += cssBlock('[data-theme="analyst"].dark', R.blocks.and, "Analyst family — dark.");

const tailwindCss = `/*
 * Tailwind v4 bridge for the O.P.H.I.S tokens. Copied verbatim from
 * src/styles.css: the dark variant, the @theme inline map (token -> utility,
 * e.g. --status-open -> bg-status-open / text-status-open), the scroll-thin
 * utility and the base layer.
 *
 * Tokens NOT mapped to utilities in the source (use them through var()):
 *   --map-id-1..6, --brand-green, --brand-gold, --ophis-grid, --ophis-scan,
 *   --shadow-elegant, --shadow-hover, all --board-*.
 *   e.g. className="bg-[var(--map-id-1)]" or style={{ color: "var(--brand-gold)" }}
 */

@custom-variant dark (&:is(.dark *));

${slice((b) => b.prelude === "@theme inline", "theme")}

/* Slim scrollbars for dense workspace panes. */
${slice((b) => b.prelude === "@utility scroll-thin", "scroll-thin")}

${slice((b) => b.prelude === "@layer base", "base")}
`;

const fontsCss = `/*
 * Self-hosted IBM Plex faces (copied verbatim from src/styles.css). The .woff2
 * files are in ./public/fonts — serve them at /fonts/ (put them in your app's
 * public/fonts/). IBM Plex Mono is the default theme's font-mono; IBM Plex Sans
 * and IBM Plex Sans Arabic are the Analyst family's text faces.
 *
 * The default theme's text faces (Inter, Noto Sans Arabic) are NOT self-hosted:
 * the app loads them from Google Fonts with this exact link in <head>:
 *   https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+Arabic:wght@400;500;600&display=swap
 */

${slice((b) => b.prelude === "@font-face", "font-face")}
`;

const extrasCss = `/*
 * Shared non-token styles, copied verbatim from src/styles.css.
 * Optional: import only if you use these surfaces.
 */

/* Login stage: the only place glow, blur, grid and scanlines are allowed. */
${sliceRange((b) => b.prelude === ".ophis-stage", (b) => b.prelude.startsWith("@media (prefers-reduced-motion"), "ophis")}

/* Analyst family typography overlay: weights capped at 500, mono metadata
 * (anything inside <Ltr> carries [data-ltr]), soft shadow on popover surfaces. */
${sliceRange((b) => b.prelude.startsWith('[data-theme="analyst"] :is(.font-bold'), (b) => b.prelude === '[data-theme="analyst"] .bg-popover', "analyst overlay")}

/* Link analysis board: print / Save as PDF shows only the .board-print view. */
${sliceRange((b) => b.prelude === ".board-print", (b) => b.prelude === "@media print", "print")}

/* An unknown persona's portrait: a hatch, so an empty photo never reads as a broken image. */
${slice((b) => b.prelude === ".profile-portrait-empty", "portrait")}
`;

const indexCss = `/*
 * Entry point for a Tailwind v4 project. Import this ONE file from your app
 * (e.g. in main.tsx: import "./design-system/index.css").
 * Order matters: tokens before the @theme bridge is not required (inline
 * theme reads var() at use time) but keep extras last so it can override.
 */
@import "tailwindcss";
@import "tw-animate-css";

@import "./css/fonts.css";
@import "./css/tokens.css";
@import "./css/tailwind-theme.css";
@import "./css/extras.css";
`;

// ---------- JSON ----------
const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
const splitBoard = (m) => {
  const ui = {}, board = {};
  for (const [k, v] of Object.entries(m)) (k.startsWith("--board-") ? board : ui)[k] = v;
  return { ui: sortObj(ui), board: sortObj(board) };
};
const pkgVersion = (name) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, "node_modules", name, "package.json"), "utf8")).version; } catch {}
  try { const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8")); const v = lock.packages?.["node_modules/" + name]?.version; if (v) return v; } catch {}
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  return pkg.dependencies?.[name] ?? pkg.devDependencies?.[name] ?? null;
};
const json = {
  $description: "O.P.H.I.S design tokens, fully resolved per theme (every CSS custom property the app renders on <html>). Generated from src/styles.css; values verbatim.",
  generatedAt: new Date().toISOString().slice(0, 10),
  source: "src/styles.css",
  colorSpace: "oklch (board tokens are hex because the WebGL renderer parses them)",
  themeSwitch: {
    light: "<html>",
    dark: '<html class="dark">',
    analystLight: '<html data-theme="analyst">',
    analystDark: '<html data-theme="analyst" class="dark">',
    storage: { theme: 'localStorage["cm:theme"] = "light" | "dark" (light default)', family: 'localStorage["cm:theme-family"] = "analyst" | anything else' },
  },
  typography: {
    defaultSans: R.theme["--font-sans"],
    defaultMono: R.theme["--font-mono"],
    analystSans: R.blocks.an["font-family"],
    analystMono: R.blocks.an["--font-mono"],
    googleFontsHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+Arabic:wght@400;500;600&display=swap",
    selfHosted: ["IBM Plex Sans 400/500", "IBM Plex Mono 400/500", "IBM Plex Sans Arabic 400/500"],
    analystOverlay: { "font-bold|font-semibold": "font-weight: 500", "h1-h4": "font-weight: 500; letter-spacing: -0.01em", "[data-ltr]": "IBM Plex Mono; letter-spacing: 0.01em" },
  },
  radius: Object.fromEntries(Object.entries(R.theme).filter(([k]) => k.startsWith("--radius-"))),
  spacing: "Tailwind v4 defaults, not overridden (--spacing: 0.25rem). Table rows h-14 (56px) by convention.",
  tailwindColorUtilities: sortObj(Object.fromEntries(Object.entries(R.theme).filter(([k]) => k.startsWith("--color-")).map(([k, v]) => [k.slice(8), v]))),
  themes: {
    defaultLight: splitBoard(R.defaultLight),
    defaultDark: splitBoard(R.defaultDark),
    analystLight: splitBoard(R.analystLight),
    analystDark: splitBoard(R.analystDark),
  },
  dependencies: Object.fromEntries(["tailwindcss", "@tailwindcss/vite", "tw-animate-css", "class-variance-authority", "clsx", "tailwind-merge", "lucide-react", "@radix-ui/react-direction"].map((n) => [n, pkgVersion(n)])),
};
const tokensTs = `// Generated from src/styles.css — do not edit. Same data as tokens.json, typed.
// Use for canvas/chart/map code that needs a token's value in JS; in components
// prefer the CSS variable (var(--x) or the Tailwind utility) so themes switch live.
export const tokens = ${JSON.stringify(json, null, 2)} as const;

export type ThemeName = keyof typeof tokens.themes;
export type UiToken = keyof typeof tokens.themes.defaultLight.ui;
export type BoardToken = keyof typeof tokens.themes.defaultLight.board;

/** Read a token's live value from <html> (follows the active theme). Browser only. */
export function readToken(name: UiToken | BoardToken, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}
`;

// ---------- write ----------
// Overwrites generated files only; hand-written files (README, rules, components) are left alone.
for (const d of ["css", "public"]) fs.rmSync(path.join(out, d), { recursive: true, force: true });
const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(out, p)), { recursive: true }); fs.writeFileSync(path.join(out, p), s); };
w("css/tokens.css", tokensCss);
w("css/tailwind-theme.css", tailwindCss);
w("css/fonts.css", fontsCss);
w("css/extras.css", extrasCss);
w("index.css", indexCss);
w("tokens.json", JSON.stringify(json, null, 2) + "\n");
w("tokens.ts", tokensTs);
w("lib/utils.ts", fs.readFileSync(path.join(root, "src/lib/utils.ts"), "utf8"));
const copy = (from, to) => { fs.mkdirSync(path.dirname(path.join(out, to)), { recursive: true }); fs.copyFileSync(path.join(root, from), path.join(out, to)); };
for (const f of fs.readdirSync(path.join(root, "public/fonts"))) copy(`public/fonts/${f}`, `public/fonts/${f}`);
copy("public/brand/ophis-mark.png", "public/brand/ophis-mark.png");
for (const f of ["favicon.ico", "favicon-32.png", "favicon-192.png"]) copy(`public/${f}`, `public/${f}`);

// ---------- verify: the export resolves to exactly what the source resolves to ----------
const exported = resolve([tokensCss, tailwindCss].join("\n"));
const eq = (a, b) => JSON.stringify(sortObj(a)) === JSON.stringify(sortObj(b));
const checks = {
  defaultLight: eq(exported.defaultLight, R.defaultLight),
  defaultDark: eq(exported.defaultDark, R.defaultDark),
  analystLight: eq(exported.analystLight, R.analystLight),
  analystDark: eq(exported.analystDark, R.analystDark),
  themeInline: eq(exported.theme, R.theme),
};
// Every source rule except the app-specific @import/@source lines must land somewhere.
const all = [tokensCss, tailwindCss, fontsCss, extrasCss].join("\n");
const missing = blocks.filter((b) => !/^:root$|^\.dark$|^\[data-theme="analyst"\](\.dark)?$/.test(b.prelude) && !/^@(import|source)\b/.test(b.prelude) && !all.includes(src.slice(b.start, b.end)));
console.log(JSON.stringify({ checks, missingRules: missing.map((b) => b.prelude), counts: Object.fromEntries(Object.entries({ defaultLight: R.defaultLight, defaultDark: R.defaultDark, analystLight: R.analystLight, analystDark: R.analystDark }).map(([k, v]) => [k, Object.keys(v).length])), deps: json.dependencies }, null, 2));
if (!Object.values(checks).every(Boolean) || missing.length) process.exit(1);
