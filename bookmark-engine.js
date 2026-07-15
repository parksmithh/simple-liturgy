import { wikipediaUrlForFeast } from "./feast-wikipedia.js?v=0.3.56";

export function parseBundle(text) {
  const readings = new Map();
  const dates = new Map();
  let header = null;
  for (const line of text.trim().split("\n")) {
    const record = JSON.parse(line);
    if (record.type === "header") header = record;
    if (record.type === "reading") readings.set(record.key, record);
    if (record.type === "date") dates.set(record.date, record);
  }
  if (!header || header.schema_version !== 1) throw new Error("Unsupported bundle");
  return { header, readings, dates };
}

function normalizedPrayerTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\bst\./g, "saint")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const PRAYER_TEXT_STARTS = {
  "First Sunday after Christmas Day": "Almighty God,",
  "Last Sunday after the Epiphany": "O God,",
  "Ash Wednesday": "Almighty and everlasting God,",
  "Sunday of the Passion: Palm Sunday": "Almighty and everliving God,",
  "Maundy Thursday": "Almighty Father,",
  "Good Friday": "Almighty God,",
  "Holy Saturday": "O God, Creator",
  "The Day of Pentecost: Whitsunday": "Almighty God, on this day",
};

function prayerOnly(prayer) {
  const marker = PRAYER_TEXT_STARTS[prayer.title];
  if (!marker) return prayer;
  const start = prayer.text.indexOf(marker);
  return start === -1 ? prayer : { ...prayer, text: prayer.text.slice(start) };
}

export function parseCollects(text) {
  const source = JSON.parse(text);
  if (!source?.contemporary || typeof source.contemporary !== "object") throw new Error("Unsupported prayer collection");
  return new Map(Object.values(source.contemporary).map(prayer => {
    const cleaned = prayerOnly(prayer);
    return [normalizedPrayerTitle(cleaned.title), cleaned];
  }));
}

const ORDINALS = {
  1: "first", 2: "second", 3: "third", 4: "fourth",
  5: "fifth", 6: "sixth", 7: "seventh", 8: "eighth",
};

function prayerTitleForDay(day) {
  if (day.feast === "Christmas Day") return "The Nativity of Our Lord: Christmas Day";
  if (day.feast === "Nativity of St. John the Baptist") return "The Nativity of Saint John the Baptist";
  if (day.feast) return day.feast;

  const weekday = new Date(`${day.date}T12:00:00Z`).getUTCDay();
  if (day.label === "Holy Week") {
    return [
      "Sunday of the Passion: Palm Sunday", "Monday in Holy Week", "Tuesday in Holy Week",
      "Wednesday in Holy Week", "Maundy Thursday", "Good Friday", "Holy Saturday",
    ][weekday];
  }
  if (day.label === "Easter Week") {
    return [
      "Easter Day", "Monday in Easter Week", "Tuesday in Easter Week", "Wednesday in Easter Week",
      "Thursday in Easter Week", "Friday in Easter Week", "Saturday in Easter Week",
    ][weekday];
  }
  if (day.label === "Week of 6 Easter" && weekday === 4) return "Ascension Day";
  if (day.label === "Christmas and Following") return "The Nativity of Our Lord: Christmas Day";
  if (day.label === "First Sunday after Christmas") return "First Sunday after Christmas Day";
  if (day.label === "Second Sunday after Christmas") return "Second Sunday after Christmas Day";
  if (day.label === "The Epiphany and Following") return "The Epiphany";
  if (day.label === "Ash Wednesday and Following") return "Ash Wednesday";
  if (day.label === "The Day of Pentecost") return "The Day of Pentecost: Whitsunday";
  if (day.label === "Trinity Sunday") return "First Sunday after Pentecost: Trinity Sunday";
  if (day.label === "Week of Last Epiphany") return "Last Sunday after the Epiphany";

  const proper = day.label.match(/^Week of Proper (\d+)$/)?.[1];
  if (proper) return `Proper ${proper}`;
  const advent = day.label.match(/^Week of ([1-4]) Advent$/)?.[1];
  if (advent) return `${ORDINALS[advent]} Sunday of Advent`;
  const epiphany = day.label.match(/^Week of ([1-8]) Epiphany$/)?.[1];
  if (epiphany === "1") return "First Sunday after the Epiphany: The Baptism of our Lord";
  if (epiphany) return `${ORDINALS[epiphany]} Sunday after the Epiphany`;
  const lent = day.label.match(/^Week of ([1-5]) Lent$/)?.[1];
  if (lent) return `${ORDINALS[lent]} Sunday in Lent`;
  const easter = day.label.match(/^Week of ([2-7]) Easter$/)?.[1];
  if (easter === "7") return "Seventh Sunday of Easter: The Sunday after Ascension Day";
  if (easter) return `${ORDINALS[easter]} Sunday of Easter`;
  return null;
}

export function resolvePrayer(collects, day) {
  if (!collects || !day) return null;
  const title = prayerTitleForDay(day);
  return title ? collects.get(normalizedPrayerTitle(title)) || null : null;
}

export function paginatePrayer(text, maximumCharacters = 120) {
  const words = String(text || "").trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (words.length === 0) return [];
  const limit = Math.max(40, maximumCharacters);
  const pages = [];
  let start = 0;
  while (start < words.length) {
    let end = start;
    let length = 0;
    let naturalBoundary = null;
    while (end < words.length) {
      const nextLength = length + (length ? 1 : 0) + words[end].length;
      if (nextLength > limit && end > start) break;
      length = nextLength;
      end += 1;
      if (length >= limit * 0.6 && /[.;:!?]$/.test(words[end - 1])) naturalBoundary = end;
      if (nextLength > limit) break;
    }
    if (end < words.length && naturalBoundary !== null) end = naturalBoundary;
    pages.push(words.slice(start, end).join(" "));
    start = end;
  }
  return pages;
}

export function paginatePrayerByFit(text, fits) {
  const words = String(text || "").trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (words.length === 0) return [];
  const pages = [];
  let start = 0;
  while (start < words.length) {
    const prefix = pages.length > 0 ? "..." : "";
    const remaining = words.slice(start).join(" ");
    if (fits(`${prefix}${remaining}`)) {
      pages.push(remaining);
      break;
    }

    let end = start + 1;
    while (end <= words.length) {
      const candidate = `${prefix}${words.slice(start, end).join(" ")}...`;
      if (!fits(candidate)) break;
      end += 1;
    }
    const pageEnd = Math.max(start + 1, end - 1);
    pages.push(words.slice(start, pageEnd).join(" "));
    start = pageEnd;
  }
  return pages;
}

export function createState() {
  return { offset: 0, focus: null, focusPage: 0 };
}

export function stateAfterDateChange(state, previousDate, currentDate) {
  return previousDate === currentDate ? state : createState();
}

const FOCUS_ORDER = ["PRAYER", "PS", "OT", "NT", "GS", "GLORIA"];
const GLORIA_TEXT = "Glory to the Father, to the Son, and to the Holy Spirit. Amen.";
const GOSPEL_BOOKS = ["matthew", "mark", "luke", "john"];
const NEW_TESTAMENT_BOOKS = [
  ...GOSPEL_BOOKS,
  "acts", "romans", "1 corinthians", "2 corinthians", "galatians", "ephesians",
  "philippians", "colossians", "1 thessalonians", "2 thessalonians", "1 timothy",
  "2 timothy", "titus", "philemon", "hebrews", "heb", "james", "1 peter",
  "2 peter", "1 john", "2 john", "3 john", "jude", "revelation",
];

function normalizedCitation(citation) {
  return String(citation).trim().replace(/^or\s+/i, "").replace(/--+/g, "-");
}

function startsWithBook(citation, books) {
  const normalized = normalizedCitation(citation).toLowerCase();
  return books.some(book => normalized === book || normalized.startsWith(`${book} `) || normalized.startsWith(`${book},`));
}

export function lessonValues(lessons = []) {
  const values = { OT: "-", NT: "-", GS: "-" };
  for (const citation of lessons) {
    const normalized = normalizedCitation(citation);
    if (startsWithBook(normalized, GOSPEL_BOOKS)) {
      if (values.GS === "-") values.GS = normalized;
    } else if (startsWithBook(normalized, NEW_TESTAMENT_BOOKS)) {
      if (values.NT === "-") values.NT = normalized;
    } else if (values.OT === "-") values.OT = normalized;
  }
  return values;
}

function focusTargets(prayerPageCount) {
  const targets = [];
  for (const focus of FOCUS_ORDER) {
    if (focus === "PRAYER") {
      for (let page = 0; page < prayerPageCount; page += 1) targets.push({ focus, focusPage: page });
    } else {
      targets.push({ focus, focusPage: 0 });
    }
  }
  return targets;
}

function moveFocus(next, direction, prayerPageCount, exitAtBoundary = true) {
  const targets = focusTargets(Math.max(1, prayerPageCount || 0));
  const index = targets.findIndex(target => target.focus === next.focus && target.focusPage === (next.focusPage || 0));
  if (index === -1) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= targets.length) {
    if (exitAtBoundary) {
      next.focus = null;
      next.focusPage = 0;
    }
    return;
  }
  const target = targets[targetIndex];
  next.focus = target.focus;
  next.focusPage = target.focusPage;
}

export function handle(state, event, context = {}) {
  const next = { ...state };
  if (event === "PREV_DAY") {
    next.offset -= 1;
    next.focus = null;
    next.focusPage = 0;
  } else if (event === "NEXT_DAY") {
    next.offset += 1;
    next.focus = null;
    next.focusPage = 0;
  } else if (event === "NEXT_READING" || event === "PREV_READING") {
    moveFocus(next, event === "NEXT_READING" ? 1 : -1, context.prayerPageCount);
  }
  else if (event === "FOCUS") {
    if (!next.focus) {
      next.focus = FOCUS_ORDER[0];
      next.focusPage = 0;
    }
  }
  else if (event === "CENTER") {
    if (!next.focus) {
      next.focus = FOCUS_ORDER[0];
      next.focusPage = 0;
    } else {
      moveFocus(next, 1, context.prayerPageCount, next.focus === "GLORIA");
    }
  }
  else if (event === "OVERVIEW") {
    next.focus = null;
    next.focusPage = 0;
  }
  else if (event === "OPEN_PRAYER") {
    next.focus = "PRAYER";
    next.focusPage = 0;
  }
  else if (FOCUS_ORDER.includes(event)) {
    next.focus = next.focus === event ? null : event;
    next.focusPage = 0;
  }
  else if (event === "TODAY") return createState();
  return next;
}

export function controlModel(viewOrFocus) {
  const focus = typeof viewOrFocus === "string" ? viewOrFocus : viewOrFocus?.focus;
  if (focus) {
    const prayer = typeof viewOrFocus === "object" ? viewOrFocus.prayer : null;
    const firstPrayerPage = focus === "PRAYER" && (!prayer || prayer.page === 0);
    const previousLabel = firstPrayerPage ? "exit focus" : focus === "PRAYER" ? "previous page" : "previous reading";
    const nextLabel = focus === "GLORIA" ? "exit focus" : focus === "PRAYER" && prayer && prayer.page < prayer.pages.length - 1 ? "next page" : "next reading";
    const centerLabel = focus === "GLORIA" ? "Overview" : nextLabel;
    return [
      { event: "PREV_READING", key: "←", label: previousLabel },
      { event: "CENTER", key: "↵", label: centerLabel },
      { event: "NEXT_READING", key: "→", label: nextLabel },
    ];
  }
  const todayRelation = typeof viewOrFocus === "object" ? viewOrFocus?.todayRelation || "today" : "today";
  const centerControl = todayRelation !== "today"
    ? { event: "TODAY", key: "↵", label: "Today" }
    : { event: "FOCUS", key: "↵", label: "Focus" };
  return [
    { event: "PREV_DAY", key: "←", label: "previous day" },
    centerControl,
    { event: "NEXT_DAY", key: "→", label: "next day" },
  ];
}

export function swipeEvent(startX, endX, startY = 0, endY = 0, minimumDistance = 48) {
  const horizontalDistance = endX - startX;
  const verticalDistance = endY - startY;
  if (Math.abs(horizontalDistance) < minimumDistance || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) return null;
  return horizontalDistance < 0 ? "NEXT_DAY" : "PREV_DAY";
}

export function focusSwipeEvent(focus, swipe) {
  if (!focus || !swipe) return swipe;
  if (swipe === "NEXT_DAY") return "NEXT_READING";
  if (swipe === "PREV_DAY") return "PREV_READING";
  return swipe;
}

export function keyboardEvent(focus, key, doublePress = false) {
  if (key === "ArrowLeft") return focus ? "PREV_READING" : "PREV_DAY";
  if (key === "ArrowRight") return focus ? "NEXT_READING" : "NEXT_DAY";
  if (key === "Enter") return focus ? "CENTER" : "FOCUS";
  if (key === "ArrowUp") return focus ? null : doublePress ? "TODAY" : "OVERVIEW";
  if (key === "ArrowDown") return doublePress && focus ? "OPEN_PRAYER" : "FOCUS";
  return null;
}

export function screenTapEvent(focus, clientX, screenLeft, screenWidth, edgeRatio = 0.25) {
  if (!Number.isFinite(screenWidth) || screenWidth <= 0) return null;
  if (!focus) return "FOCUS";
  const position = (clientX - screenLeft) / screenWidth;
  if (position <= edgeRatio) return "PREV_READING";
  if (position >= 1 - edgeRatio) return "NEXT_READING";
  return "CENTER";
}

export function screenClickEvent(focus, clientX, screenLeft, screenWidth, { detail = 1, fromPointer = true, reading = false } = {}) {
  if (!fromPointer && detail === 0) {
    if (!reading) return null;
    return focus ? "CENTER" : "FOCUS";
  }
  return screenTapEvent(focus, clientX, screenLeft, screenWidth);
}

export function screenClickDecision(
  { focus, clientX, screenLeft, screenWidth },
  { suppressed = false, link = false, controlEvent = null, detail = 1, fromPointer = true, reading = false } = {},
) {
  if (suppressed) return { action: null, preventDefault: link };
  if (link) return { action: null, preventDefault: false };
  if (controlEvent) return { action: controlEvent, preventDefault: false };
  return {
    action: screenClickEvent(focus, clientX, screenLeft, screenWidth, { detail, fromPointer, reading }),
    preventDefault: false,
  };
}

export function prayerAvailableHeight({
  focusHeight,
  paddingTop,
  paddingBottom,
  labelHeight,
  textMarginTop,
  feastLinkHeight = 0,
  feastLinkMarginTop = 0,
  feastLinkMarginBottom = 0,
}) {
  return focusHeight - paddingTop - paddingBottom - labelHeight - textMarginTop
    - feastLinkHeight - feastLinkMarginTop - feastLinkMarginBottom;
}

export function dateWithOffset(isoDate, offset) {
  const date = new Date(isoDate + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function stateForDate(today, targetDate) {
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const todayTime = Date.parse(`${today}T12:00:00Z`);
  const targetTime = Date.parse(`${targetDate}T12:00:00Z`);
  return { ...createState(), offset: Math.round((targetTime - todayTime) / dayMilliseconds) };
}

export function liturgicalSeason(label) {
  if (/Advent/i.test(label)) return "Advent";
  if (/Christmas/i.test(label)) return "Christmas";
  if (/Epiphany/i.test(label)) return "Epiphany";
  if (/Holy Week/i.test(label)) return "Holy Week";
  if (/Ash Wednesday|Lent/i.test(label)) return "Lent";
  if (/Easter/i.test(label)) return "Easter";
  if (/Day of Pentecost/i.test(label)) return "Pentecost";
  if (/Trinity|Proper/i.test(label)) return "After Pentecost";
  return label;
}

function seasonalTitleForDay(day) {
  const weekday = new Date(`${day.date}T12:00:00Z`).getUTCDay();
  if (day.label === "Ash Wednesday and Following" && weekday === 3) return "Ash Wednesday";
  if (day.label === "Holy Week") {
    return ["Palm Sunday", null, null, null, "Maundy Thursday", "Good Friday", "Holy Saturday"][weekday];
  }
  if (day.label === "Easter Week" && weekday === 0) return "Easter Day";
  if (day.label === "Week of 6 Easter" && weekday === 4) return "Ascension Day";
  if (day.label === "The Day of Pentecost" && weekday === 0) return "Day of Pentecost";
  if (day.label === "Trinity Sunday" && weekday === 0) return "Trinity Sunday";
  if (day.label === "Week of 1 Advent" && weekday === 0) return "First Sunday of Advent";
  return null;
}

export function upcomingFeastDays(bundle, today) {
  return [...bundle.dates.values()]
    .filter(day => day.date >= today)
    .map(day => {
      const churchFeast = day.feast && day.occasion_type === "church";
      const title = churchFeast ? day.feast : seasonalTitleForDay(day);
      if (!title) return null;
      return {
        date: day.date,
        title,
        season: liturgicalSeason(day.label),
        kind: churchFeast ? "Feast day" : "Seasonal day",
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.date.localeCompare(right.date));
}

function saintNameForFeast(feast) {
  if (feast === "All Saints' Day") return "All Saints";
  if (feast === "The Holy Innocents") return "the Holy Innocents";
  const saintIndex = String(feast || "").indexOf("St.");
  return saintIndex === -1 ? null : feast.slice(saintIndex);
}

export function model(bundle, state, today, collects = null, options = {}) {
  const date = dateWithOffset(today, state.offset);
  const todayRelation = state.offset < 0 ? "past" : state.offset > 0 ? "future" : "today";
  const day = bundle.dates.get(date);
  if (!day) return { date, todayRelation, error: "DATE OUTSIDE INSTALLED PACK" };
  const reading = bundle.readings.get(day.key);
  const prayerEntry = resolvePrayer(collects, day);
  const prayerPages = prayerEntry
    ? (Array.isArray(options.prayerPages) && options.prayerPages.length > 0 ? options.prayerPages : paginatePrayer(prayerEntry.text))
    : [];
  const prayerPage = Math.min(state.focusPage || 0, Math.max(0, prayerPages.length - 1));
  const prayer = prayerEntry ? { ...prayerEntry, pages: prayerPages, page: prayerPage, saintName: saintNameForFeast(day.feast) } : null;
  const dayView = {
    date,
    todayRelation,
    label: day.label,
    year: `Year ${day.lectionary_year[0].toUpperCase()}${day.lectionary_year.slice(1)}`,
    feast: day.feast,
    occasionType: day.occasion_type || null,
    focus: state.focus,
    prayer,
  };
  if (!reading) return { ...dayView, error: "READINGS NOT IN INSTALLED PACK" };
  const morningPsalms = reading.psalms_morning.join(", ");
  const eveningPsalms = reading.psalms_evening.join(", ");
  const lessons = lessonValues(reading.lessons);
  return {
    ...dayView,
    psalms: { morning: morningPsalms, evening: eveningPsalms },
    values: { PS: `${morningPsalms}\n${eveningPsalms}`, OT: lessons.OT, NT: lessons.NT, GS: lessons.GS },
  };
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function citationHtml(view, key, className) {
  if (key !== "PS" || !view.psalms) return `<span class="${className}">${escapeHtml(view.values[key])}</span>`;
  return `<span class="${className} psalm-cite"><span class="psalm-office"><span class="office-icon" aria-label="Morning">☀</span><span>${escapeHtml(view.psalms.morning)}</span></span><span class="psalm-office"><span class="office-icon" aria-label="Evening">☾</span><span>${escapeHtml(view.psalms.evening)}</span></span></span>`;
}

function prayerPageHtml(prayer) {
  const ellipsis = '<span class="continuation-ellipsis" aria-hidden="true">...</span>';
  const prefix = prayer.page > 0 ? ellipsis : "";
  const suffix = prayer.page < prayer.pages.length - 1 ? ellipsis : "";
  return `${prefix}${escapeHtml(prayer.pages[prayer.page])}${suffix}`;
}

function prayerHeading(prayer, includeArticle = false) {
  if (prayer.saintName) return `Prayer of ${prayer.saintName}`;
  return `${includeArticle ? "A " : ""}Prayer for ${prayer.title}`;
}

function feastAboutHtml(feast, occasionType, enabled) {
  if (!enabled || occasionType !== "church") return "";
  const wikipediaUrl = wikipediaUrlForFeast(feast);
  if (!wikipediaUrl) return "";
  return `<a class="feast-about-link" href="${wikipediaUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(`About ${feast} →`)}</a>`;
}

function compactYear(year) {
  if (year === "Year One") return "Y1";
  if (year === "Year Two") return "Y2";
  return year;
}

export function screenHtml(view, { feastLinksEnabled = true } = {}) {
  const date = new Date(`${view.date}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date);
  const mediumDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
  const labels = { OT: "Old Testament", PS: "Psalms", NT: "New Testament", GS: "Gospel", PRAYER: "Prayer", GLORIA: "Gloria" };
  const occasionType = view.occasionType || null;
  const occasionTypeAttribute = occasionType ? ` data-occasion-type="${occasionType}"` : "";
  const feastBanner = view.feast ? `<span class="feast-banner"${occasionTypeAttribute}>${escapeHtml(view.feast)}</span>` : "";
  const meta = [view.label, compactYear(view.year)].filter(Boolean).join(" · ");
  const headerClass = view.focus ? "screen-header-copy focus-header" : "screen-header-copy";
  const beforeToday = view.todayRelation === "past";
  const afterToday = view.todayRelation === "future";
  const relationLabel = beforeToday ? " Shown date is before today." : afterToday ? " Shown date is after today." : "";
  const beforeChevron = afterToday ? '<span class="today-chevron today-chevron-before" aria-hidden="true">&lt;</span>' : "";
  const afterChevron = beforeToday ? '<span class="today-chevron today-chevron-after" aria-hidden="true">&gt;</span>' : "";
  const weekdayLine = `<span class="weekday-line">${beforeChevron}<span class="weekday">${escapeHtml(weekday)}</span>${afterChevron}</span>`;
  const primaryHeader = `<span class="header-primary">${weekdayLine}${feastBanner}</span>`;
  const secondaryHeader = `<span class="header-secondary"><span class="date-value">${escapeHtml(mediumDate)}</span>${meta ? `<span class="meta"><span class="meta-separator" aria-hidden="true">· </span>${escapeHtml(meta)}</span>` : ""}</span>`;
  const dateLine = `<button class="date-line" data-event="TODAY" type="button" aria-label="Return to today.${relationLabel}">${primaryHeader}${secondaryHeader}</button>`;
  const headerCopy = `<div class="${headerClass}"><div class="header-summary">${dateLine}</div></div>`;
  const heading = headerCopy;
  if (view.error && !(view.focus === "PRAYER" && view.prayer)) return `${heading}<h2 class="warning">${escapeHtml(view.error)}</h2>`;
  const prayerIndex = view.prayer?.pages.length > 1 ? ` (${view.prayer.page + 1}/${view.prayer.pages.length})` : "";
  const prayerFocus = view.focus === "PRAYER" && view.prayer
    ? `<div class="reading focus prayer-focus"><button class="prayer-content" data-reading="PRAYER" type="button"><span class="label">${escapeHtml(prayerHeading(view.prayer))}${prayerIndex}</span><span class="prayer-text">${prayerPageHtml(view.prayer)}</span></button>${feastAboutHtml(view.feast, occasionType, feastLinksEnabled)}</div>`
    : null;
  const gloriaFocus = view.focus === "GLORIA"
    ? `<button class="reading focus prayer-focus" data-reading="GLORIA" type="button"><span class="label">Gloria</span><span class="prayer-text gloria-text">${escapeHtml(GLORIA_TEXT)}</span></button>`
    : null;
  const openingPrayerOverview = '<div class="reading overview-marker opening-prayer-marker"><span class="label">Opening Prayer</span></div>';
  const gloriaOverview = '<div class="reading overview-marker gloria-marker"><span class="label">Gloria</span></div>';
  const body = view.focus
    ? prayerFocus || gloriaFocus || `<button class="reading focus" data-reading="${view.focus}" type="button"><span class="label">${labels[view.focus]}</span>${citationHtml(view, view.focus, "focus-cite")}</button>`
    : `<div class="grid">${openingPrayerOverview}${Object.keys(view.values).map(key => `<button class="reading" data-reading="${key}" type="button"><span class="label">${labels[key]}</span>${citationHtml(view, key, "cite")}</button>`).join("")}${gloriaOverview}</div>`;
  const focusHint = view.focus ? '<span class="focus-next-hint" aria-hidden="true"></span>' : "";
  const overviewHint = view.focus ? "" : '<span class="overview-focus-hint">Tap to focus</span>';
  return `${heading}${body}${focusHint}${overviewHint}`;
}
