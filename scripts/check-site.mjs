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
  dateWithOffset,
  handle,
  keyboardEvent,
  model,
  parseBundle,
  parseCollects,
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
