#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { register } from "node:module";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

register(new URL("./version-query-loader.mjs", import.meta.url));

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SEMVER_QUERY = /\?v=(\d+\.\d+\.\d+)/g;
const LOCAL_REF = /(?:href|src)="(\.\/[^"#?]+)/g;
const IMPORT_REF = /from\s+"(\.\/[^"]+)"/g;
const QUERY_SELECTOR_ID = /querySelector(?:All)?\(["'`]#([A-Za-z][\w-]*)/g;
const REQUIRED_HTML_IDS = [
  "screen",
  "install-button",
  "install-dialog",
  "settings-page",
  "device-screen",
  "full-daily-office-enabled",
  "preview-simple-morning",
  "preview-simple-evening",
  "preview-traditional-morning",
  "preview-traditional-evening",
  "retry-full-office",
  "create-prayer-reminders",
  "prayer-reminder-status",
  "prayer-import-help",
  "noonday-enabled",
  "preview-noonday",
  "compline-enabled",
  "preview-compline",
  "feast-links-enabled",
  "feast-browser",
  "feast-list",
  "browse-feast-days",
  "close-feast-browser",
  "reader-menu",
  "open-reader-button",
  "share-button",
  "install-tooltip",
  "app-version",
  "previous-control",
  "center-control",
  "next-control",
  "timed-office-onboarding",
];

const SMOKE_PATHS = [
  "/",
  "/index.html",
  "/privacy.html",
  "/terms.html",
  "/llms.txt",
  "/manifest.webmanifest",
  "/service-worker.js",
  "/version.js",
  "/app.js",
  "/app.css",
  "/design-tokens.css",
  "/icon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/assets/og-simple-liturgy.png",
  "/firmware/circuitpython/readings.active.jsonl",
  "/firmware/circuitpython/readings.active.idx",
  "/data/collects/collects.json",
  "/data/daily-office/rite-two.json",
  "/data/daily-office/psalter.json",
  "/dor-engine/daily-office-content.index.json",
  "/dor-engine/daily-office-content.active.jsonl",
  "/dor-engine/office-appointments.json",
];

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".idx": "application/octet-stream",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jsonl": "application/jsonl; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const failures = [];
let passed = 0;

function ok(name) {
  passed += 1;
  console.log(`ok  ${name}`);
}

function fail(name, error) {
  failures.push({ name, error });
  console.error(`not ok  ${name}`);
  console.error(`  ${error instanceof Error ? error.message : error}`);
}

function check(name, fn) {
  try {
    fn();
    ok(name);
  } catch (error) {
    fail(name, error);
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    ok(name);
  } catch (error) {
    fail(name, error);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function repoPath(...parts) {
  return join(ROOT, ...parts);
}

async function readText(...parts) {
  return readFile(repoPath(...parts), "utf8");
}

async function exists(...parts) {
  try {
    await stat(repoPath(...parts));
    return true;
  } catch {
    return false;
  }
}

function stripQuery(specifier) {
  return specifier.split("?")[0];
}

function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(isoDate, offset) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return localIsoDate(date);
}

function recordAt(bytes, offset) {
  const start = offset;
  const newline = bytes.indexOf(10, start);
  const end = newline === -1 ? bytes.length : newline;
  return JSON.parse(Buffer.from(bytes.subarray(start, end)).toString("utf8"));
}

async function listAppJsFiles() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  return entries.filter(entry => entry.isFile() && entry.name.endsWith(".js")).map(entry => entry.name);
}

function extractIds(source) {
  return [...source.matchAll(QUERY_SELECTOR_ID)].map(match => match[1]);
}

function extractShellPaths(workerSource) {
  const paths = new Set();
  for (const match of workerSource.matchAll(/"(\.\/[^"]+)"/g)) {
    paths.add(stripQuery(match[1]));
  }
  for (const match of workerSource.matchAll(/CONTENT_ROOT\}(firmware\/[^"?]+|data\/[^"?]+)/g)) {
    paths.add(`./${match[1]}`);
  }
  paths.add("./firmware/circuitpython/readings.active.jsonl");
  paths.add("./firmware/circuitpython/readings.active.idx");
  paths.add("./data/collects/collects.json");
  paths.add("./dor-engine/daily-office-content.index.json");
  paths.add("./dor-engine/daily-office-content.active.jsonl");
  return [...paths];
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = createServer(async (request, response) => {
      try {
        const url = new URL(request.url, "http://127.0.0.1");
        let relative = decodeURIComponent(url.pathname);
        if (relative === "/") relative = "/index.html";
        const file = repoPath(relative.replace(/^\/+/, ""));
        if (!file.startsWith(ROOT)) {
          response.writeHead(403).end();
          return;
        }
        await stat(file);
        response.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
        createReadStream(file).pipe(response);
      } catch {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

async function fetchStatus(origin, path) {
  const response = await fetch(new URL(path, origin));
  return { path, status: response.status, ok: response.ok, bytes: Number(response.headers.get("content-length") || 0) };
}

const {
  APP_CHANNEL,
  APP_VERSION,
  appVersionLabel,
} = await import("../version.js");
const {
  DAILY_FOCUS_ORDER,
  dateWithOffset,
  handle,
  keyboardEvent,
  LORDS_PRAYER_HEADING,
  LORDS_PRAYER_TEXT,
  model,
  parseBundle,
  parseCollects,
  prayerLineationHtml,
  resolvePrayer,
  screenHtml,
  stateForDate,
  swipeEvent,
  upcomingFeastDays,
} = await import("../bookmark-engine.js");
const { composeDailyOffice } = await import("../daily-office.js");
const { parseReadingIndex } = await import("../reading-pack-loader.js");
const { ALL_ICON_ASSET_PATHS } = await import("../pixel-art.js");
const { scheduledServiceAt, officePeriodAt } = await import("../office-schedule.js");
const { buildPrayerCalendar } = await import("../prayer-calendar.js");

const indexHtml = await readText("index.html");
const privacyHtml = await readText("privacy.html");
const termsHtml = await readText("terms.html");
const manifestText = await readText("manifest.webmanifest");
const workerSource = await readText("service-worker.js");
const appJs = await readText("app.js");
const jsFiles = await listAppJsFiles();
const versionedTextFiles = [
  "index.html",
  "privacy.html",
  "terms.html",
  "manifest.webmanifest",
  ...jsFiles,
];

check("production channel is locked", () => {
  assert(APP_CHANNEL === "production", `APP_CHANNEL must be production, got ${APP_CHANNEL}`);
  assert(/^\d+\.\d+\.\d+$/.test(APP_VERSION), `APP_VERSION must be semver, got ${APP_VERSION}`);
  assert(appVersionLabel().includes(APP_VERSION), "version label must include APP_VERSION");
  assert(!appVersionLabel().toLowerCase().includes("staging"), "production label must not mention staging");
});

check("promote tag matches APP_VERSION", () => {
  if (process.env.GITHUB_REF_TYPE !== "tag") return;
  const tag = process.env.GITHUB_REF_NAME || "";
  assert(tag === `v${APP_VERSION}`, `tag ${tag || "(empty)"} must be v${APP_VERSION}`);
});

await checkAsync("versioned assets use APP_VERSION", async () => {
  const unexpected = [];
  for (const file of versionedTextFiles) {
    const text = await readText(file);
    for (const match of text.matchAll(SEMVER_QUERY)) {
      if (match[1] !== APP_VERSION) unexpected.push(`${file} has ?v=${match[1]}`);
    }
  }
  assert(unexpected.length === 0, unexpected.join("; ") || "mixed versions");
  assert(workerSource.includes(`daily-office-reader-v${APP_VERSION}`), "service worker cache name must include APP_VERSION");
  assert(workerSource.includes(`?v=${APP_VERSION}`), "service worker must version the current release");
});

check("JavaScript modules parse", () => {
  const errors = [];
  for (const file of jsFiles) {
    const result = spawnSync(process.execPath, ["--check", repoPath(file)], { encoding: "utf8" });
    if (result.status !== 0) errors.push(`${file}: ${result.stderr.trim() || result.stdout.trim()}`);
  }
  assert(errors.length === 0, errors.join("\n") || "syntax errors");
});

await checkAsync("module imports resolve to files", async () => {
  const missing = [];
  for (const file of jsFiles) {
    const text = await readText(file);
    for (const match of text.matchAll(IMPORT_REF)) {
      const target = stripQuery(match[1]);
      if (!await exists(target.slice(2))) missing.push(`${file} -> ${target}`);
    }
  }
  assert(missing.length === 0, `missing imports: ${missing.join(", ")}`);
});

await checkAsync("HTML, manifest, and worker assets exist", async () => {
  const missing = [];
  const manifest = JSON.parse(manifestText);
  assert(manifest.name === "Simple Liturgy", "manifest name");
  assert(manifest.start_url === "./", "manifest start_url");
  assert(manifest.display === "standalone", "manifest display");
  for (const icon of manifest.icons || []) {
    const path = stripQuery(icon.src);
    if (!await exists(path.slice(2))) missing.push(path);
  }
  for (const html of [indexHtml, privacyHtml, termsHtml]) {
    for (const match of html.matchAll(LOCAL_REF)) {
      const path = match[1];
      if (!await exists(path.slice(2))) missing.push(path);
    }
  }
  for (const path of extractShellPaths(workerSource)) {
    if (!await exists(path.slice(2))) missing.push(path);
  }
  assert(await exists(".nojekyll"), "GitHub Pages needs .nojekyll");
  assert(missing.length === 0, `missing assets: ${[...new Set(missing)].join(", ")}`);
});

check("index.html has the reader shell and settings controls", () => {
  for (const id of REQUIRED_HTML_IDS) {
    assert(indexHtml.includes(`id="${id}"`), `missing #${id}`);
  }
  assert(indexHtml.includes('class="reader"'), "missing reader root");
  assert(indexHtml.includes('src="./app.js'), "missing app module");
  const referenced = new Set(extractIds(appJs));
  const absent = [...referenced].filter(id => !indexHtml.includes(`id="${id}"`));
  assert(absent.length === 0, `app.js selectors missing from index.html: ${absent.join(", ")}`);
});

await checkAsync("icon catalog files exist", async () => {
  const absent = [];
  for (const path of ALL_ICON_ASSET_PATHS) {
    if (!await exists(path.slice(2))) absent.push(path);
  }
  const manifestCsv = await readText("assets/liturgical-icons/manifest.csv");
  for (const line of manifestCsv.trim().split("\n").slice(1)) {
    const [collection, , , filename] = line.split(",");
    if (!filename) continue;
    const path = `assets/liturgical-icons/${collection}/${filename}`;
    if (!await exists(path)) absent.push(`./${path}`);
  }
  assert(absent.length === 0, `missing icons: ${absent.join(", ")}`);
});

await checkAsync("reading pack, index, and collects can load today", async () => {
  const packText = await readText("firmware/circuitpython/readings.active.jsonl");
  const bundle = parseBundle(packText);
  const collects = parseCollects(await readText("data/collects/collects.json"));
  const indexBytes = await readFile(repoPath("firmware/circuitpython/readings.active.idx"));
  const entries = parseReadingIndex(indexBytes);
  const today = localIsoDate();
  const dates = [addDays(today, -1), today, addDays(today, 1), "2026-12-25", "2026-04-05"];

  assert(bundle.header.schema_version === 1, "reading pack schema");
  assert(bundle.dates.size > 0 && bundle.readings.size > 0, "reading pack is empty");
  assert(entries.length === bundle.dates.size, `index has ${entries.length} dates, pack has ${bundle.dates.size}`);

  const packBytes = new Uint8Array(await readFile(repoPath("firmware/circuitpython/readings.active.jsonl")));
  for (const iso of dates) {
    const day = bundle.dates.get(iso);
    assert(day, `pack is missing ${iso}`);
    const prayer = resolvePrayer(collects, day);
    assert(prayer?.text, `collect missing for ${iso} (${day.label})`);
    const view = model(bundle, stateForDate(today, iso), today, collects);
    assert(!view.error, `${iso}: ${view.error}`);
    assert(view.values?.OT && view.values?.NT && view.values?.GS, `${iso} is missing lesson citations`);
    const html = screenHtml(view);
    assert(typeof html === "string" && html.length > 40, `${iso} rendered an empty reader`);
    const entry = entries.find(item => item.date === iso);
    assert(entry, `reading index is missing ${iso}`);
    const indexedDay = recordAt(packBytes, entry.dateOffset);
    const indexedReading = recordAt(packBytes, entry.readingOffset);
    assert(indexedDay.date === iso, `index date mismatch for ${iso}`);
    assert(indexedReading.key === day.key, `index reading key mismatch for ${iso}`);
  }

  const feasts = upcomingFeastDays(bundle, today);
  assert(Array.isArray(feasts) && feasts.length > 0, "upcoming feast list is empty");
});

await checkAsync("traditional Daily Office composes for today", async () => {
  const today = localIsoDate();
  const bundle = parseBundle(await readText("firmware/circuitpython/readings.active.jsonl"));
  const collects = parseCollects(await readText("data/collects/collects.json"));
  const riteTwo = JSON.parse(await readText("data/daily-office/rite-two.json"));
  const psalter = JSON.parse(await readText("data/daily-office/psalter.json"));
  const appointments = JSON.parse(await readText("dor-engine/office-appointments.json"));
  const index = JSON.parse(await readText("dor-engine/daily-office-content.index.json"));

  assert(riteTwo.schema_version === "bcp1979-rite-two-daily-office-v1", "rite-two schema");
  assert(psalter.schema_version === "bcp1979-psalter-v1" && psalter.psalms.length === 150, "psalter schema");
  assert(appointments.schema_version === "office-appointments-v1", "appointments schema");
  assert(index.schema_version === "daily-office-content-index-v1", "full-office index schema");
  assert(appointments.contexts[today], `appointments missing ${today}`);
  assert(index.contexts[today], `full-office index missing ${today}`);

  for (const service of ["morning", "evening"]) {
    const document = composeDailyOffice({
      service,
      date: today,
      day: bundle.dates.get(today),
      collect: resolvePrayer(collects, bundle.dates.get(today)),
      riteTwo,
      psalter,
      appointments,
    });
    assert(document.schemaVersion === "office-document-v1", `${service} document schema`);
    assert(document.sections.length >= 8, `${service} office is missing sections`);
    const view = model(bundle, { offset: 0, focus: document.sections[0].key, focusPage: 0 }, today, collects, {
      service,
      officeDocument: document,
    });
    assert(!view.error, `${service}: ${view.error}`);
    assert(screenHtml(view).length > 40, `${service} rendered empty`);
  }
});

check("timed-office schedule helpers stay coherent", () => {
  const morning = new Date("2026-09-08T07:00:00");
  const noon = new Date("2026-09-08T12:00:00");
  const evening = new Date("2026-09-08T19:00:00");
  const night = new Date("2026-09-08T22:00:00");
  assert(officePeriodAt(morning) === "morning", "07:00 is morning");
  assert(officePeriodAt(noon) === "midday", "12:00 is midday");
  assert(officePeriodAt(evening) === "evening", "19:00 is evening");
  assert(officePeriodAt(night) === "night", "22:00 is night");
  assert(scheduledServiceAt(morning, { format: "simple", noondayEnabled: false, complineEnabled: false }) === "daily");
  assert(scheduledServiceAt(noon, { format: "simple", noondayEnabled: true, complineEnabled: false }) === "noonday");
  assert(scheduledServiceAt(night, { format: "simple", noondayEnabled: false, complineEnabled: true }) === "compline");
  assert(scheduledServiceAt(morning, { format: "full", noondayEnabled: false, complineEnabled: false }) === "morning");
  assert(scheduledServiceAt(evening, { format: "full", noondayEnabled: false, complineEnabled: false }) === "evening");
});

check("reader navigation helpers still map gestures", () => {
  assert(swipeEvent(200, 80) === "NEXT_DAY", "swipe left should advance");
  assert(swipeEvent(80, 200) === "PREV_DAY", "swipe right should go back");
  assert(keyboardEvent(null, "ArrowRight") === "NEXT_DAY", "right arrow");
  const next = handle({ offset: 0, focus: null, focusPage: 0 }, "NEXT_DAY");
  assert(next.offset === 1, "NEXT_DAY should increment the date offset");
  assert(dateWithOffset("2026-09-08", 1) === "2026-09-09", "date offset");
});

check("Simple Liturgy focus order includes The Lord's Prayer", () => {
  assert(
    DAILY_FOCUS_ORDER.join(",") === "PRAYER,PS,OT,NT,GS,LORDS_PRAYER,GLORIA",
    `focus order is ${DAILY_FOCUS_ORDER.join(",")}`,
  );
  const afterGospel = handle({ offset: 0, focus: "GS", focusPage: 0 }, "NEXT_READING");
  assert(afterGospel.focus === "LORDS_PRAYER", "next after Gospel must open The Lord's Prayer");
  const afterPrayer = handle({ offset: 0, focus: "LORDS_PRAYER", focusPage: 0 }, "NEXT_READING");
  assert(afterPrayer.focus === "GLORIA", "next after The Lord's Prayer must open Gloria");
  const previousFromGloria = handle({ offset: 0, focus: "GLORIA", focusPage: 0 }, "PREV_READING");
  assert(previousFromGloria.focus === "LORDS_PRAYER", "previous from Gloria must open The Lord's Prayer");
  const opened = handle({ offset: 0, focus: null, focusPage: 0 }, "LORDS_PRAYER");
  assert(opened.focus === "LORDS_PRAYER", "overview must focus The Lord's Prayer, not a reading");
  const afterOverview = handle({ offset: 0, focus: "LORDS_PRAYER", focusPage: 0 }, "OVERVIEW");
  assert(afterOverview.focus === null, "overview must clear Lord's Prayer focus");
  const afterDate = handle({ offset: 0, focus: "LORDS_PRAYER", focusPage: 0 }, "NEXT_DAY");
  assert(afterDate.focus === null, "date change must clear Lord's Prayer focus");
});

check("The Lord's Prayer heading uses a curly apostrophe", () => {
  assert(LORDS_PRAYER_HEADING === "The Lord\u2019s Prayer", "heading must be The Lord’s Prayer");
  assert(LORDS_PRAYER_HEADING.includes("\u2019"), "heading must use U+2019");
  assert(!LORDS_PRAYER_HEADING.includes("'"), "heading must not use a straight apostrophe");
});

await checkAsync("Simple Liturgy Lord's Prayer text, lineation, and Amen", async () => {
  const contemporary = "Our Father in heaven, hallowed be your Name, your kingdom come, your will be done, on earth as in heaven. Give us today our daily bread. Forgive us our sins as we forgive those who sin against us. Save us from the time of trial, and deliver us from evil. For the kingdom, the power, and the glory are yours, now and for ever. Amen.";
  const riteTwo = await readText("data/daily-office/rite-two.json");
  assert(riteTwo.includes(contemporary), "Rite II contemporary Lord's Prayer must still be present for comparison");
  assert(LORDS_PRAYER_TEXT.replaceAll("\n", " ") === contemporary, "Simple Liturgy wording must match Rite II contemporary once newlines are ignored");
  assert(!/who art|trespasses|temptation|this day/.test(LORDS_PRAYER_TEXT), "must not use traditional substitutions");
  const html = prayerLineationHtml(LORDS_PRAYER_TEXT);
  assert(html.includes("Our Father in heaven,<br>hallowed be your Name,"), "phrase breaks must be <br> after escaping");
  assert(html.includes("now and for ever.<span class=\"prayer-amen\">Amen.</span>"), "final Amen must be a block span");
  assert(!html.includes("now and for ever. Amen."), "Amen must be peeled off the last doxology line");
});

await checkAsync("Simple Liturgy Lord's Prayer renders in focus and overview", async () => {
  const bundle = parseBundle(await readText("firmware/circuitpython/readings.active.jsonl"));
  const collects = parseCollects(await readText("data/collects/collects.json"));
  const today = localIsoDate();
  const overview = screenHtml(model(bundle, { offset: 0, focus: null, focusPage: 0 }, today, collects));
  assert(overview.includes(`data-event="LORDS_PRAYER"`), "overview marker must open LORDS_PRAYER");
  assert(overview.includes(LORDS_PRAYER_HEADING), "overview must use the shared heading");
  assert(!overview.includes("Our Father in heaven"), "overview must be label-only");
  const focus = screenHtml(model(bundle, { offset: 0, focus: "LORDS_PRAYER", focusPage: 0 }, today, collects));
  assert(focus.includes(`data-reading="LORDS_PRAYER"`), "focus must target LORDS_PRAYER");
  assert(focus.includes(LORDS_PRAYER_HEADING), "focus label must use the shared heading");
  assert(focus.includes("prayer-text lords-prayer-text"), "focus body must use prayer-text plus lords-prayer-text");
  assert(focus.includes('<span class="prayer-amen">Amen.</span>'), "focus must include the block Amen");
  const noonday = screenHtml(model(bundle, { offset: 0, focus: "NOONDAY_LORDS_PRAYER", focusPage: 0 }, today, collects, { service: "noonday" }));
  assert(noonday.includes(LORDS_PRAYER_HEADING), "Noonday must keep The Lord’s Prayer heading");
  assert(!noonday.includes("For the kingdom, the power, and the glory are yours"), "Noonday must keep the doxology-free wording");
});

await checkAsync("Lord's Prayer typography inherits the shared prayer token", async () => {
  const css = await readText("app.css");
  assert(
    /\.grid \{\s*grid-template-columns: 1fr;\s*grid-template-rows: repeat\(7, auto\);/.test(css),
    "portrait Simple Liturgy overview must use repeat(7, auto)",
  );
  assert(css.includes(".prayer-amen { display: block; }"), "Amen must use the shared block treatment");
  const modifierRules = [...css.matchAll(/\.lords-prayer-text\s*\{([^}]*)\}/g)].map(match => match[1]);
  assert(modifierRules.length > 0, "lords-prayer-text modifier must exist");
  assert(
    modifierRules.every(body => !/font-size|line-height|--type-reader-lords-prayer/.test(body)),
    "lords-prayer-text may not set font-size, line-height, or a private type token",
  );
  assert(!css.includes("--type-reader-lords-prayer"), "must not invent --type-reader-lords-prayer");
  assert(
    /function matchingPrayerLayout\(view\) \{\s*if \(view\.focus === "LORDS_PRAYER"\) return null;/.test(appJs),
    "collect cache must exclude LORDS_PRAYER",
  );
  assert(appJs.includes('screen.querySelector(".lords-prayer-text")'), "fitted size must apply only to .lords-prayer-text");
  assert(appJs.includes("matchingLordsPrayerLayout"), "Lord's Prayer must use a dedicated fitter");
  assert(appJs.includes("measuredLordsPrayerLayout"), "Lord's Prayer must measure its own HTML");
});

check("prayer reminder calendar can be generated", () => {
  const calendar = buildPrayerCalendar({
    selections: { morning: "07:00", evening: "18:00", noonday: "off", compline: "off" },
    appUrl: "https://simpleliturgy.com/",
  });
  assert(calendar.includes("BEGIN:VCALENDAR"), "ICS calendar header");
  assert(calendar.includes("Morning Prayer"), "morning event");
  assert(calendar.includes("Evening Prayer"), "evening event");
  assert(!calendar.includes("Noonday Prayer"), "disabled noonday should stay out");
  assert(!calendar.includes("Compline"), "disabled Compline should stay out");
});

await checkAsync("critical URLs return HTTP 200 from a Pages-like server", async () => {
  const server = await startStaticServer();
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  try {
    const results = [];
    for (const path of SMOKE_PATHS) results.push(await fetchStatus(origin, path));
    const failed = results.filter(result => !result.ok);
    assert(failed.length === 0, failed.map(result => `${result.path} -> ${result.status}`).join(", "));
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

console.log("");
if (failures.length > 0) {
  console.error(`${failures.length} failed, ${passed} passed`);
  process.exitCode = 1;
} else {
  console.log(`${passed} passed`);
}
