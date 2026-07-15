import { controlModel, createState, focusSwipeEvent, handle, keyboardEvent, model, paginatePrayerByFit, parseBundle, parseCollects, screenClickEvent, screenHtml, stateAfterDateChange, swipeEvent } from "./bookmark-engine.js?v=79";
import { renderPixelArtStack } from "./pixel-art.js?v=79";
import { initializeTheme, setThemeMode, syncSystemTheme } from "./theme.js?v=79";

const APP_ROOT = new URL(".", window.location.href);
const CONTENT_ROOT = APP_ROOT.pathname.endsWith("/web/") ? new URL("../", APP_ROOT) : APP_ROOT;
const PACK_URL = new URL("firmware/circuitpython/readings.active.jsonl", CONTENT_ROOT);
const COLLECTS_URL = new URL("data/collects/collects.json", CONTENT_ROOT);
const DOUBLE_KEY_WINDOW_MS = 500;
const INSTALL_TOOLTIP_SESSION_KEY = "simple-liturgy.install-tooltip-dismissed";
const screen = document.querySelector("#screen");
const artStack = document.querySelector("#pixel-art-stack");
const installButton = document.querySelector("#install-button");
const installDialog = document.querySelector("#install-dialog");
const settingsPage = document.querySelector("#settings-page");
const reader = document.querySelector(".reader");
const deviceScreen = document.querySelector("#device-screen");
const themeControls = document.querySelectorAll('input[name="theme"]');
const readerMenu = document.querySelector("#reader-menu");
const openReaderButton = document.querySelector("#open-reader-button");
const shareButton = document.querySelector("#share-button");
const shareStatus = document.querySelector("#share-status");
const installTooltip = document.querySelector("#install-tooltip");
const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
const installedPwa = window.matchMedia("(display-mode: standalone)").matches
  || window.matchMedia("(display-mode: fullscreen)").matches
  || window.navigator.standalone === true;
document.documentElement.classList.toggle("installed-pwa", installedPwa);
const installTooltipMedia = window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)");
let installTooltipDismissed = false;
try {
  installTooltipDismissed = window.sessionStorage.getItem(INSTALL_TOOLTIP_SESSION_KEY) === "true";
} catch {}
function syncInstallTooltip() {
  document.documentElement.classList.toggle("install-tooltip-active", !installedPwa && installTooltipMedia.matches && !installTooltipDismissed);
}
syncInstallTooltip();
const previousControl = document.querySelector("#previous-control");
const centerControl = document.querySelector("#center-control");
const nextControl = document.querySelector("#next-control");
let state = createState();
let bundle = null;
let collects = null;
let deferredInstall = null;
let pointerStart = null;
let pointerActivated = false;
let suppressReadingTap = false;
let prayerLayout = null;
let observedDeviceSize = "";
let activeLocalDate = null;
let lastVerticalKey = null;
let lastVerticalKeyAt = -Infinity;
const themeContext = {
  root: document.documentElement,
  controls: themeControls,
  meta: document.querySelector('meta[name="theme-color"]'),
  storage: window.localStorage,
  media: window.matchMedia("(prefers-color-scheme: dark)"),
  styles: window.getComputedStyle.bind(window),
};

initializeTheme(themeContext);

function setSettingsOpen(open) {
  document.documentElement.classList.toggle("settings-open", open);
  settingsPage.hidden = !open;
  reader.hidden = open;
  prayerLayout = null;
  if (open) {
    window.scrollTo({ top: 0, behavior: "auto" });
    openReaderButton.focus({ preventScroll: true });
    return;
  }
  render();
  readerMenu.focus({ preventScroll: true });
}

export function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function deviceSize() {
  return `${deviceScreen.clientWidth}x${deviceScreen.clientHeight}`;
}

function matchingPrayerLayout(view) {
  if (prayerLayout?.date !== view.date || prayerLayout.deviceSize !== deviceSize()) return null;
  return prayerLayout;
}

function resetForNewLocalDate() {
  const currentDate = localIsoDate();
  if (activeLocalDate === null) {
    activeLocalDate = currentDate;
    return false;
  }
  const nextState = stateAfterDateChange(state, activeLocalDate, currentDate);
  if (nextState === state) return false;
  activeLocalDate = currentDate;
  state = nextState;
  prayerLayout = null;
  return true;
}

function currentView() {
  const today = localIsoDate();
  const baseView = model(bundle, state, today, collects);
  const layout = matchingPrayerLayout(baseView);
  if (!layout) return baseView;
  return model(bundle, state, today, collects, { prayerPages: layout.pages });
}

function paint(view) {
  deviceScreen.classList.toggle("has-feast", Boolean(view.feast));
  screen.innerHTML = screenHtml(view);
  const layout = matchingPrayerLayout(view);
  if ((view.focus === "PRAYER" || view.focus === "GLORIA") && layout?.fontSize) {
    screen.querySelector(".prayer-text")?.style.setProperty("font-size", `${layout.fontSize}px`);
  }
  renderPixelArtStack(artStack, view);
  controlModel(view).forEach((control, index) => {
    const button = [previousControl, centerControl, nextControl][index];
    button.dataset.event = control.event;
    button.querySelector("kbd").textContent = control.key;
    button.querySelector("span").textContent = control.label;
    button.setAttribute("aria-label", control.label);
  });
}

function appendMeasuredContent(probe, candidate) {
  const startsWithEllipsis = candidate.startsWith("...");
  const endsWithEllipsis = candidate.endsWith("...");
  const start = startsWithEllipsis ? 3 : 0;
  const end = endsWithEllipsis ? -3 : undefined;
  const content = candidate.slice(start, end);
  const nodes = [];
  if (startsWithEllipsis) {
    const prefix = document.createElement("span");
    prefix.className = "continuation-ellipsis";
    prefix.textContent = "...";
    nodes.push(prefix);
  }
  nodes.push(document.createTextNode(content));
  if (endsWithEllipsis) {
    const suffix = document.createElement("span");
    suffix.className = "continuation-ellipsis";
    suffix.textContent = "...";
    nodes.push(suffix);
  }
  probe.replaceChildren(...nodes);
}

function largestWholePrayerFont(probe, prayer, availableHeight, preferredFontSize) {
  const minimumFontSize = Math.min(16, preferredFontSize);
  const maximumFontSize = Math.max(Math.floor(preferredFontSize), Math.min(52, Math.floor(availableHeight / 2)));
  for (let fontSize = maximumFontSize; fontSize >= minimumFontSize; fontSize -= 1) {
    probe.style.fontSize = `${fontSize}px`;
    appendMeasuredContent(probe, prayer);
    if (probe.scrollHeight <= availableHeight + 0.5) return fontSize;
  }
  return null;
}

function measuredPrayerLayout(view) {
  const focus = screen.querySelector(".prayer-focus");
  const text = screen.querySelector(".prayer-text");
  const label = focus?.querySelector(".label");
  if (!focus || !text || !label) return null;

  const focusStyle = getComputedStyle(focus);
  const textStyle = getComputedStyle(text);
  const focusHeight = focus.getBoundingClientRect().height;
  const labelHeight = label.getBoundingClientRect().height;
  const availableHeight = focusHeight
    - parseFloat(focusStyle.paddingTop)
    - parseFloat(focusStyle.paddingBottom)
    - labelHeight
    - parseFloat(textStyle.marginTop);
  const textWidth = text.getBoundingClientRect().width;
  if (availableHeight <= 0 || textWidth <= 0) return null;

  const probe = text.cloneNode(false);
  probe.classList.add("prayer-measure");
  probe.style.width = `${textWidth}px`;
  deviceScreen.append(probe);
  try {
    const maximumFontSize = parseFloat(textStyle.fontSize);
    const wholePrayerFont = largestWholePrayerFont(probe, view.prayer.text, availableHeight, maximumFontSize);
    if (wholePrayerFont !== null) return { pages: [view.prayer.text], fontSize: wholePrayerFont };

    probe.style.fontSize = `${maximumFontSize}px`;
    const pages = paginatePrayerByFit(view.prayer.text, candidate => {
      appendMeasuredContent(probe, candidate);
      return probe.scrollHeight <= availableHeight + 0.5;
    });
    return { pages, fontSize: maximumFontSize };
  } finally {
    probe.remove();
  }
}

function render() {
  if (!bundle || !collects) return;
  resetForNewLocalDate();
  let view = currentView();
  paint(view);
  if (view.focus !== "PRAYER" || !view.prayer) return;

  const layout = measuredPrayerLayout(view);
  if (!layout?.pages.length) return;
  const { pages } = layout;
  const changed = pages.length !== view.prayer.pages.length || pages.some((page, index) => page !== view.prayer.pages[index]);
  const fontChanged = prayerLayout?.fontSize !== layout.fontSize;
  prayerLayout = { date: view.date, deviceSize: deviceSize(), ...layout };
  if (!changed && !fontChanged) return;
  state.focusPage = Math.min(state.focusPage, pages.length - 1);
  view = currentView();
  paint(view);
}

function dispatch(event) {
  if (resetForNewLocalDate()) return render();
  const view = currentView();
  state = handle(state, event, { prayerPageCount: view.prayer?.pages.length || 0 });
  render();
}

function showLoadError(error) {
  deviceScreen.classList.remove("has-feast");
  const title = document.createElement("b");
  const detail = document.createElement("div");
  const retry = document.createElement("button");
  title.textContent = "READINGS UNAVAILABLE";
  detail.className = "meta";
  detail.textContent = String(error.message || error);
  retry.className = "warning";
  retry.id = "retry-load";
  retry.type = "button";
  retry.textContent = "RETRY";
  retry.addEventListener("click", loadPack);
  screen.replaceChildren(title, detail, retry);
}

async function loadPack() {
  screen.textContent = "Loading readings…";
  try {
    const [packResponse, collectsResponse] = await Promise.all([fetch(PACK_URL), fetch(COLLECTS_URL)]);
    if (!packResponse.ok) throw new Error(`Readings could not be loaded (${packResponse.status})`);
    if (!collectsResponse.ok) throw new Error(`Prayers could not be loaded (${collectsResponse.status})`);
    bundle = parseBundle(await packResponse.text());
    collects = parseCollects(await collectsResponse.text());
    render();
  } catch (error) {
    showLoadError(error);
  }
}

[previousControl, nextControl].forEach(button => {
  button.addEventListener("click", () => dispatch(button.dataset.event));
});

centerControl.addEventListener("click", () => dispatch(centerControl.dataset.event));

window.addEventListener("keydown", event => {
  if (!settingsPage.hidden || !bundle || !collects || installDialog.open || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]")) return;
  if (event.key === "Enter" && event.target instanceof Element && event.target.closest("button, a")) return;
  const verticalKey = event.key === "ArrowUp" || event.key === "ArrowDown";
  const now = performance.now();
  const doublePress = verticalKey && !event.repeat && event.key === lastVerticalKey && now - lastVerticalKeyAt <= DOUBLE_KEY_WINDOW_MS;
  if (!verticalKey || event.repeat || doublePress) {
    lastVerticalKey = null;
    lastVerticalKeyAt = -Infinity;
  } else {
    lastVerticalKey = event.key;
    lastVerticalKeyAt = now;
  }
  const action = keyboardEvent(state.focus, event.key, doublePress);
  if (!action) return;
  event.preventDefault();
  dispatch(action);
});

deviceScreen.addEventListener("click", event => {
  const fromPointer = pointerActivated;
  pointerActivated = false;
  if (suppressReadingTap) return;
  const control = event.target.closest("[data-event]");
  if (control) return dispatch(control.dataset.event);
  const reading = event.target.closest("[data-reading]");
  const bounds = deviceScreen.getBoundingClientRect();
  const tapEvent = screenClickEvent(state.focus, event.clientX, bounds.left, bounds.width, {
    detail: event.detail,
    fromPointer,
    reading: Boolean(reading),
  });
  if (!tapEvent) return;
  dispatch(tapEvent);
});

deviceScreen.addEventListener("pointerdown", event => {
  pointerActivated = true;
  pointerStart = { x: event.clientX, y: event.clientY };
});

deviceScreen.addEventListener("pointerup", event => {
  if (pointerStart === null) return;
  const swipe = swipeEvent(pointerStart.x, event.clientX, pointerStart.y, event.clientY);
  pointerStart = null;
  if (!swipe) return;
  suppressReadingTap = true;
  dispatch(focusSwipeEvent(state.focus, swipe));
  requestAnimationFrame(() => { suppressReadingTap = false; });
});

deviceScreen.addEventListener("pointercancel", () => {
  pointerActivated = false;
  pointerStart = null;
});

themeControls.forEach(control => control.addEventListener("change", () => {
  if (!control.checked) return;
  setThemeMode(themeContext, control.value);
  if (bundle && collects) renderPixelArtStack(artStack, currentView());
}));

themeContext.media.addEventListener?.("change", () => {
  if (!syncSystemTheme(themeContext)) return;
  if (bundle && collects) renderPixelArtStack(artStack, currentView());
});

if ("ResizeObserver" in window) {
  observedDeviceSize = deviceSize();
  new ResizeObserver(() => {
    const nextSize = deviceSize();
    if (nextSize === observedDeviceSize) return;
    observedDeviceSize = nextSize;
    prayerLayout = null;
    render();
  }).observe(deviceScreen);
}

readerMenu.addEventListener("click", () => setSettingsOpen(true));
openReaderButton.addEventListener("click", () => setSettingsOpen(false));
installTooltip.addEventListener("click", () => {
  installTooltipDismissed = true;
  try {
    window.sessionStorage.setItem(INSTALL_TOOLTIP_SESSION_KEY, "true");
  } catch {}
  syncInstallTooltip();
});
installTooltipMedia.addEventListener?.("change", syncInstallTooltip);

shareButton.addEventListener("click", async () => {
  const shareData = {
    title: "Simple Liturgy",
    text: "BCP 1979 Daily Office readings and prayers.",
    url: canonicalUrl,
  };
  if (typeof navigator.share === "function") {
    try {
      await navigator.share(shareData);
      shareStatus.textContent = "Share sheet opened.";
    } catch (error) {
      if (error.name !== "AbortError") shareStatus.textContent = "Sharing could not be opened. Please try again.";
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(canonicalUrl);
    shareStatus.textContent = "Link copied to clipboard.";
  } catch {
    shareStatus.textContent = "Sharing is not available in this browser.";
  }
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstall = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstall) return installDialog.showModal();
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => { installButton.hidden = true; });
function refreshForCurrentDay() {
  if (resetForNewLocalDate()) render();
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshForCurrentDay();
});
window.addEventListener("focus", refreshForCurrentDay);
window.addEventListener("pageshow", refreshForCurrentDay);

if ("serviceWorker" in navigator) {
  let reloadingForUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadingForUpdate) return;
    reloadingForUpdate = true;
    window.location.reload();
  });
  navigator.serviceWorker
    .register("./service-worker.js", { updateViaCache: "none" })
    .then(registration => registration.update())
    .catch(() => {});
}

loadPack();
