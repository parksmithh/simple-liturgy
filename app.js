import { initializeAnalytics } from "./analytics.js?v=0.3.77";
import { controlModel, createState, focusPageCounts, focusSwipeEvent, handle, keyboardEvent, model, noondayPsalmHtml, paginateBlocksByFit, paginatePrayerByFit, parseBundle, parseCollects, prayerAvailableHeight, screenClickDecision, screenHtml, stateAfterDateChange, stateForDate, swipeEvent, upcomingFeastDays } from "./bookmark-engine.js?v=0.3.77";
import { bindFeastLinksPreference, initializeFeastLinks } from "./feast-link-preference.js?v=0.3.77";
import { bindNoondayPreference, createNoondayBoundaryTimer, initializeNoondayPreference, noondayPreviewMarkerAt, noondayPreviewRelation, noondayServiceAt, refreshNoondayPreview, refreshNoondayService, shouldShowNoondayPreview } from "./noonday-preference.js?v=0.3.77";
import { calendarEventIconAssetPath, renderPixelArtStack } from "./pixel-art.js?v=0.3.77";
import { bindPsalmPreference, createPsalmBoundaryTimer, initializePsalmPreference, psalmOfficeAt, refreshPsalmDisplay } from "./psalm-preference.js?v=0.3.77";
import { bindPrayerReminderSettings } from "./prayer-calendar.js?v=0.3.77";
import { initializeTheme, setThemeMode, syncSystemTheme } from "./theme.js?v=0.3.77";
import { appVersionLabel } from "./version.js?v=0.3.77";

const APP_ROOT = new URL(".", window.location.href);
const CONTENT_ROOT = APP_ROOT.pathname.endsWith("/web/") ? new URL("../", APP_ROOT) : APP_ROOT;
const PACK_URL = new URL("firmware/circuitpython/readings.active.jsonl?v=0.3.77", CONTENT_ROOT);
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
const psalmControls = document.querySelectorAll('input[name="psalm-display"]');
const prayerReminderControls = document.querySelectorAll("[data-prayer-office]");
const createPrayerRemindersButton = document.querySelector("#create-prayer-reminders");
const prayerReminderStatus = document.querySelector("#prayer-reminder-status");
const prayerImportHelp = document.querySelector("#prayer-import-help");
const noondayControl = document.querySelector("#noonday-enabled");
const previewNoondayButton = document.querySelector("#preview-noonday");
const feastLinksControl = document.querySelector("#feast-links-enabled");
const feastBrowser = document.querySelector("#feast-browser");
const feastList = document.querySelector("#feast-list");
const feastListStatus = document.querySelector("#feast-list-status");
const browseFeastDaysButton = document.querySelector("#browse-feast-days");
const closeFeastBrowserButton = document.querySelector("#close-feast-browser");
const readerMenu = document.querySelector("#reader-menu");
const openReaderButton = document.querySelector("#open-reader-button");
const shareButton = document.querySelector("#share-button");
const shareStatus = document.querySelector("#share-status");
const installTooltip = document.querySelector("#install-tooltip");
const appVersion = document.querySelector("#app-version");
const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
bindPrayerReminderSettings({
  controls: prayerReminderControls,
  button: createPrayerRemindersButton,
  status: prayerReminderStatus,
  importHelp: prayerImportHelp,
  storage: window.localStorage,
  appUrl: canonicalUrl,
});
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
let noondayLayout = null;
let observedDeviceSize = "";
let activeLocalDate = null;
let activePsalmOffice = null;
let activeService = "daily";
let noondayPreview = false;
let noondayPreviewMarker = null;
let lastVerticalKey = null;
let lastVerticalKeyAt = -Infinity;

function invalidateLayouts() {
  prayerLayout = null;
  noondayLayout = null;
}

const themeContext = {
  root: document.documentElement,
  controls: themeControls,
  meta: document.querySelector('meta[name="theme-color"]'),
  storage: window.localStorage,
  media: window.matchMedia("(prefers-color-scheme: dark)"),
  styles: window.getComputedStyle.bind(window),
};
const feastLinksContext = { control: feastLinksControl, storage: window.localStorage };
const psalmContext = { controls: psalmControls, storage: window.localStorage };
const noondayContext = { control: noondayControl, storage: window.localStorage };
const psalmBoundary = createPsalmBoundaryTimer({
  onBoundary: now => refreshAt(now, false),
});
const noondayBoundary = createNoondayBoundaryTimer({
  onBoundary: now => refreshAt(now, false),
});

initializeTheme(themeContext);
initializeFeastLinks(feastLinksContext);
appVersion.textContent = appVersionLabel();
let psalmDisplayMode = initializePsalmPreference(psalmContext);
psalmBoundary.setMode("by-time-of-day");
let noondayEnabled = initializeNoondayPreference(noondayContext);
const initialNoondayTime = new Date();
activeService = noondayServiceAt(initialNoondayTime, noondayEnabled);
syncNoondayPreviewButton(initialNoondayTime);
noondayBoundary.setEnabled(noondayEnabled, initialNoondayTime);

function syncNoondayPreviewButton(date = new Date()) {
  previewNoondayButton.hidden = !shouldShowNoondayPreview(date, noondayEnabled);
}

function exitNoondayPreview(now = new Date()) {
  if (!noondayPreview) return;
  noondayPreview = false;
  noondayPreviewMarker = null;
  noondayBoundary.setEnabled(noondayEnabled, now);
  activateService(noondayServiceAt(now, noondayEnabled));
}

function setSettingsOpen(open) {
  if (open) {
    exitNoondayPreview();
    syncNoondayPreviewButton();
  }
  document.documentElement.classList.toggle("settings-open", open);
  settingsPage.hidden = !open;
  reader.hidden = open;
  invalidateLayouts();
  setFeastBrowserOpen(false, { focus: false, scroll: false });
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

const feastDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function renderFeastList() {
  const today = localIsoDate();
  feastList.replaceChildren();
  if (!bundle) {
    feastListStatus.textContent = "Feast days will appear when the readings finish loading.";
    return;
  }

  const days = upcomingFeastDays(bundle, today);
  const fragment = document.createDocumentFragment();
  let yearItems = null;
  let activeYear = null;
  for (const day of days) {
    const year = day.date.slice(0, 4);
    if (year !== activeYear) {
      activeYear = year;
      const group = document.createElement("section");
      const heading = document.createElement("h3");
      yearItems = document.createElement("div");
      heading.className = "feast-year-title";
      heading.id = `feast-year-${year}`;
      heading.textContent = year;
      yearItems.className = "feast-year-items";
      group.className = "feast-year-group";
      group.setAttribute("aria-labelledby", heading.id);
      group.append(heading, yearItems);
      fragment.append(group);
    }

    const button = document.createElement("button");
    const iconFrame = document.createElement("span");
    const dateLabel = document.createElement("span");
    const time = document.createElement("time");
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    const arrow = document.createElement("span");
    button.className = "feast-list-item";
    button.type = "button";
    button.dataset.feastDate = day.date;
    iconFrame.className = "feast-list-icon";
    iconFrame.setAttribute("aria-hidden", "true");
    const iconPath = calendarEventIconAssetPath(bundle.dates.get(day.date));
    if (iconPath) {
      const icon = document.createElement("img");
      icon.src = new URL(iconPath, import.meta.url).href;
      icon.alt = "";
      icon.draggable = false;
      icon.decoding = "async";
      icon.loading = "lazy";
      iconFrame.append(icon);
    }
    dateLabel.className = "feast-list-date";
    time.dateTime = day.date;
    time.textContent = `${day.date === today ? "Today · " : ""}${feastDateFormatter.format(new Date(`${day.date}T12:00:00Z`))}`;
    copy.className = "feast-list-copy";
    title.textContent = day.title;
    detail.textContent = `${day.kind} · ${day.season}`;
    arrow.className = "feast-list-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    dateLabel.append(time);
    copy.append(title, detail);
    button.append(iconFrame, dateLabel, copy, arrow);
    yearItems.append(button);
  }
  feastList.append(fragment);
  feastListStatus.textContent = days.length
    ? `Showing ${days.length} upcoming dates through ${days.at(-1).date.slice(0, 4)}.`
    : "There are no more feast days in the installed calendar pack.";
}

function setFeastBrowserOpen(open, { focus = true, scroll = true } = {}) {
  settingsPage.classList.toggle("feast-browser-open", open);
  feastBrowser.hidden = !open;
  if (open) renderFeastList();
  if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
  if (focus) (open ? closeFeastBrowserButton : browseFeastDaysButton).focus({ preventScroll: true });
}

function deviceSize() {
  return `${deviceScreen.clientWidth}x${deviceScreen.clientHeight}`;
}

function matchingPrayerLayout(view) {
  if (view.service !== "daily" || prayerLayout?.date !== view.date || prayerLayout.deviceSize !== deviceSize()) return null;
  return prayerLayout;
}

function matchingNoondayLayout(view) {
  if (view.service !== "noonday"
    || noondayLayout?.date !== view.date
    || noondayLayout.focus !== view.focus
    || noondayLayout.deviceSize !== deviceSize()) return null;
  return noondayLayout;
}

function resetForNewLocalDate(date = new Date()) {
  const currentDate = localIsoDate(date);
  if (activeLocalDate === null) {
    activeLocalDate = currentDate;
    return false;
  }
  const nextState = stateAfterDateChange(state, activeLocalDate, currentDate);
  if (nextState === state) return false;
  activeLocalDate = currentDate;
  state = nextState;
  invalidateLayouts();
  return true;
}

function currentView() {
  const now = new Date();
  const today = localIsoDate(now);
  const service = noondayPreview ? "noonday" : noondayServiceAt(now, noondayEnabled);
  if (service !== activeService) activateService(service);
  const viewOptions = {
    service,
    noondayPreviewRelation: noondayPreview ? noondayPreviewRelation(now) : null,
  };
  const baseView = model(bundle, state, today, collects, viewOptions);
  const prayer = matchingPrayerLayout(baseView);
  if (prayer) return model(bundle, state, today, collects, { ...viewOptions, prayerPages: prayer.pages });
  const layout = matchingNoondayLayout(baseView);
  if (layout) return model(bundle, state, today, collects, { ...viewOptions, noondayPages: { [baseView.focus]: layout.pages } });
  return baseView;
}

function paint(view) {
  deviceScreen.classList.toggle("has-feast", Boolean(view.feast));
  const feastLinksEnabled = feastLinksControl.checked;
  const psalmOffice = psalmOfficeAt();
  screen.innerHTML = screenHtml(view, { feastLinksEnabled, psalmDisplayMode, psalmOffice });
  activeService = view.service || "daily";
  activePsalmOffice = view.service === "daily" ? psalmOffice : null;
  const layout = matchingPrayerLayout(view) || matchingNoondayLayout(view);
  if (layout?.fontSize) {
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

function largestWholePrayerFont(probe, prayer, availableHeight, preferredFontSize, renderCandidate = appendMeasuredContent) {
  const minimumFontSize = Math.min(16, preferredFontSize);
  const maximumFontSize = Math.max(Math.floor(preferredFontSize), Math.min(52, Math.floor(availableHeight / 2)));
  for (let fontSize = maximumFontSize; fontSize >= minimumFontSize; fontSize -= 1) {
    probe.style.fontSize = `${fontSize}px`;
    renderCandidate(probe, prayer);
    if (probe.scrollHeight <= availableHeight + 0.5) return fontSize;
  }
  return null;
}

function renderNoondayCandidate(probe, candidate, isPsalm) {
  if (isPsalm) probe.innerHTML = noondayPsalmHtml(candidate);
  else probe.textContent = candidate;
}

function createMeasurementProbe(text, textStyle, width) {
  const probe = text.cloneNode(false);
  probe.classList.add("prayer-measure");
  probe.style.width = `${width}px`;
  probe.style.fontFamily = textStyle.fontFamily;
  deviceScreen.append(probe);
  return probe;
}

function measuredNoondayTextArea(focus, text, focusStyle) {
  const focusRect = focus.getBoundingClientRect();
  const textRect = text.getBoundingClientRect();
  return {
    height: focusRect.bottom - parseFloat(focusStyle.paddingBottom) - textRect.top,
    width: textRect.width,
  };
}

function measuredPsalmTextAreas(focus, text, section, focusStyle) {
  let citation = focus.querySelector(".focus-cite");
  let subtitle = focus.querySelector(".noonday-subtitle");
  let temporaryCitation = null;
  let temporarySubtitle = null;
  if (!citation && section.citation) {
    temporaryCitation = document.createElement("span");
    temporaryCitation.className = "focus-cite noonday-psalm-cite";
    temporaryCitation.textContent = section.citation;
    temporaryCitation.style.visibility = "hidden";
    focus.insertBefore(temporaryCitation, focus.querySelector(".noonday-subtitle") || text);
    citation = temporaryCitation;
  }
  if (!subtitle && section.subtitle) {
    temporarySubtitle = document.createElement("span");
    temporarySubtitle.className = "noonday-subtitle";
    temporarySubtitle.textContent = section.subtitle;
    temporarySubtitle.style.visibility = "hidden";
    focus.insertBefore(temporarySubtitle, text);
    subtitle = temporarySubtitle;
  }

  const originalCitationDisplay = citation?.style.display || "";
  const originalSubtitleDisplay = subtitle?.style.display || "";
  try {
    if (citation) citation.style.display = originalCitationDisplay;
    if (subtitle) subtitle.style.display = originalSubtitleDisplay;
    const firstPage = measuredNoondayTextArea(focus, text, focusStyle);
    if (citation) citation.style.display = "none";
    if (subtitle) subtitle.style.display = "none";
    return [firstPage, measuredNoondayTextArea(focus, text, focusStyle)];
  } finally {
    if (citation) citation.style.display = originalCitationDisplay;
    if (subtitle) subtitle.style.display = originalSubtitleDisplay;
    temporaryCitation?.remove();
    temporarySubtitle?.remove();
  }
}

function measuredNoondayLayout(view) {
  const section = view.noonday?.sections?.[view.focus];
  const focus = screen.querySelector(".noonday-focus");
  const text = screen.querySelector(".noonday-text");
  if (!section?.pages || !focus || !text) return null;

  const focusStyle = getComputedStyle(focus);
  const textStyle = getComputedStyle(text);
  const isPsalm = view.focus === "NOONDAY_PSALM";
  const textAreas = isPsalm
    ? measuredPsalmTextAreas(focus, text, section, focusStyle)
    : [measuredNoondayTextArea(focus, text, focusStyle)];
  if (textAreas.some(area => area.height <= 0 || area.width <= 0)) return null;

  const probe = createMeasurementProbe(text, textStyle, textAreas[0].width);
  const renderCandidate = (element, candidate) => renderNoondayCandidate(element, candidate, isPsalm);
  try {
    const preferredFontSize = parseFloat(textStyle.fontSize);
    if (section.preservePages) return { pages: section.pages, fontSize: preferredFontSize };
    const pageHeights = textAreas.map(area => isPsalm
      ? Math.max(0, area.height - Math.ceil(preferredFontSize * 0.5))
      : area.height);

    if (!isPsalm) {
      const wholeTextFont = largestWholePrayerFont(probe, section.text, pageHeights[0], preferredFontSize, renderCandidate);
      if (wholeTextFont !== null) return { pages: [section.text], fontSize: wholeTextFont };
    }

    probe.style.fontSize = `${preferredFontSize}px`;
    const pages = paginateBlocksByFit(section.text, (candidate, pageIndex) => {
      renderCandidate(probe, candidate);
      return probe.scrollHeight <= pageHeights[Math.min(pageIndex, pageHeights.length - 1)];
    });
    return { pages, fontSize: preferredFontSize };
  } finally {
    probe.remove();
  }
}

function measuredPrayerLayout(view) {
  const focus = screen.querySelector(".prayer-focus");
  const text = screen.querySelector(".prayer-text");
  const label = focus?.querySelector(".label");
  const feastAbout = focus?.querySelector(".feast-about-link");
  if (!focus || !text || !label) return null;

  const focusStyle = getComputedStyle(focus);
  const textStyle = getComputedStyle(text);
  const feastAboutStyle = feastAbout ? getComputedStyle(feastAbout) : null;
  const focusHeight = focus.getBoundingClientRect().height;
  const labelHeight = label.getBoundingClientRect().height;
  const availableHeight = prayerAvailableHeight({
    focusHeight,
    paddingTop: parseFloat(focusStyle.paddingTop),
    paddingBottom: parseFloat(focusStyle.paddingBottom),
    labelHeight,
    textMarginTop: parseFloat(textStyle.marginTop),
    feastLinkHeight: feastAbout?.getBoundingClientRect().height || 0,
    feastLinkMarginTop: feastAboutStyle ? parseFloat(feastAboutStyle.marginTop) : 0,
    feastLinkMarginBottom: feastAboutStyle ? parseFloat(feastAboutStyle.marginBottom) : 0,
  });
  const textWidth = text.getBoundingClientRect().width;
  if (availableHeight <= 0 || textWidth <= 0) return null;

  const probe = createMeasurementProbe(text, textStyle, textWidth);
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
  const measuringPrayer = Boolean(view.focus === "PRAYER" && view.prayer);
  const layout = measuringPrayer ? measuredPrayerLayout(view) : measuredNoondayLayout(view);
  if (!layout?.pages.length) return;
  const { pages } = layout;
  const section = measuringPrayer ? view.prayer : view.noonday.sections[view.focus];
  const changed = pages.length !== section.pages.length || pages.some((page, index) => page !== section.pages[index]);
  const previousLayout = measuringPrayer ? prayerLayout : noondayLayout;
  const fontChanged = previousLayout?.fontSize !== layout.fontSize;
  const measuredLayout = { date: view.date, deviceSize: deviceSize(), ...layout };
  if (measuringPrayer) prayerLayout = measuredLayout;
  else noondayLayout = { focus: view.focus, ...measuredLayout };
  if (!changed && !fontChanged) return;
  state.focusPage = Math.min(state.focusPage, pages.length - 1);
  view = currentView();
  paint(view);
}

function dispatch(event) {
  if (resetForNewLocalDate()) return render();
  const view = currentView();
  state = handle(state, event, {
    focusPageCounts: focusPageCounts(view),
    focusOrder: view.focusOrder,
  });
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
    if (!feastBrowser.hidden) renderFeastList();
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
  const link = event.target.closest("a");
  const control = event.target.closest("[data-event]");
  const reading = event.target.closest("[data-reading]");
  const bounds = deviceScreen.getBoundingClientRect();
  const decision = screenClickDecision({
    focus: state.focus,
    clientX: event.clientX,
    screenLeft: bounds.left,
    screenWidth: bounds.width,
  }, {
    suppressed: suppressReadingTap,
    link: Boolean(link),
    controlEvent: control?.dataset.event,
    detail: event.detail,
    fromPointer,
    reading: Boolean(reading),
  });
  if (decision.preventDefault) event.preventDefault();
  if (decision.action === "TODAY" && noondayPreview) exitNoondayPreview();
  if (decision.action) dispatch(decision.action);
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

bindFeastLinksPreference({
  ...feastLinksContext,
  invalidateLayout: invalidateLayouts,
  isReady: () => Boolean(bundle && collects),
  render,
});

bindPsalmPreference({
  ...psalmContext,
  onChange: mode => {
    psalmDisplayMode = mode;
    activePsalmOffice = null;
    if (bundle && collects) render();
  },
});

function activateService(service) {
  if (service !== activeService) state = { ...state, focus: null, focusPage: 0 };
  activeService = service;
  invalidateLayouts();
}

function startNoondayPreview() {
  const now = new Date();
  noondayPreview = true;
  noondayPreviewMarker = noondayPreviewMarkerAt(now, noondayEnabled);
  noondayBoundary.setEnabled(true, now);
  activeLocalDate = localIsoDate(now);
  state = createState();
  activateService("noonday");
  setSettingsOpen(false);
}

bindNoondayPreference({
  ...noondayContext,
  onChange: enabled => {
    const now = new Date();
    const nextService = noondayServiceAt(now, enabled);
    noondayEnabled = enabled;
    syncNoondayPreviewButton(now);
    noondayBoundary.setEnabled(enabled, now);
    activateService(nextService);
    if (bundle && collects) render();
  },
});

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
    invalidateLayouts();
    render();
  }).observe(deviceScreen);
}

readerMenu.addEventListener("click", () => setSettingsOpen(true));
openReaderButton.addEventListener("click", () => setSettingsOpen(false));
previewNoondayButton.addEventListener("click", startNoondayPreview);
browseFeastDaysButton.addEventListener("click", () => setFeastBrowserOpen(true));
closeFeastBrowserButton.addEventListener("click", () => setFeastBrowserOpen(false));
feastList.addEventListener("click", event => {
  const button = event.target instanceof Element ? event.target.closest("[data-feast-date]") : null;
  const targetDate = button?.dataset.feastDate;
  if (!targetDate || !bundle || !collects) return;
  const today = localIsoDate();
  activeLocalDate = today;
  state = stateForDate(today, targetDate);
  invalidateLayouts();
  setSettingsOpen(false);
});
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
function rescheduleTimeBoundaries(date) {
  psalmBoundary.reschedule(date);
  noondayBoundary.reschedule(date);
}
function refreshAt(date, rescheduleTimer = true) {
  syncNoondayPreviewButton(date);
  if (noondayPreview) {
    refreshNoondayPreview({
      date,
      marker: noondayPreviewMarker,
      enabled: noondayEnabled,
      exit: exitNoondayPreview,
      resetForNewLocalDate,
      render: () => { if (bundle && collects) render(); },
    });
    if (rescheduleTimer) rescheduleTimeBoundaries(date);
    return;
  }
  const noondayResult = refreshNoondayService({
    date,
    enabled: noondayEnabled,
    activeService,
    resetForNewLocalDate,
    render: nextService => {
      activateService(nextService);
      render();
    },
  });
  activeService = noondayResult.service;
  if (noondayResult.service === "daily") {
    refreshPsalmDisplay({
      date,
      activeOffice: activePsalmOffice,
      resetForNewLocalDate,
      render,
    });
  }
  if (rescheduleTimer) rescheduleTimeBoundaries(date);
}
function refreshForCurrentTime() {
  refreshAt(new Date());
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshForCurrentTime();
});
window.addEventListener("focus", refreshForCurrentTime);
window.addEventListener("pageshow", refreshForCurrentTime);

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
initializeAnalytics({ document, storage: window.localStorage, trackerWindow: window });
