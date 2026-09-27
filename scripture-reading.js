import { editionForMode } from "./scripture-preference.js?v=0.3.146";
import { resolveCitation, unavailableNote } from "./scripture-resolve.js?v=0.3.146";

export const SCRIPTURE_PAGINATION_MODES = Object.freeze(["verses-4", "verses-8"]);
const STORAGE_KEY = "simple-liturgy.scripture-pagination";

export function initializeScripturePagination({ storage }) {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (SCRIPTURE_PAGINATION_MODES.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  return "verses-4";
}

export function setScripturePagination({ storage }, mode) {
  if (!SCRIPTURE_PAGINATION_MODES.includes(mode)) return null;
  try {
    storage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  return mode;
}

export function paginateVerses(verses, paginationMode = "verses-4") {
  const size = paginationMode === "verses-8" ? 8 : 4;
  if (!verses?.length) return [];
  const pages = [];
  for (let i = 0; i < verses.length; i += size) {
    const chunk = verses.slice(i, i + size);
    pages.push(chunk.map(verse => `${verse.verse} ${verse.text}`).join("\n\n"));
  }
  return pages;
}

/**
 * Build focus pages for a citation under the current scripture mode.
 * @returns {{ pages: string[], citation: string, unavailable: boolean } | null}
 *   null means Off (caller keeps citation-only UI).
 */
export function scriptureLessonPages({
  citation,
  scriptureMode,
  pack,
  paginationMode = "verses-4",
}) {
  if (!scriptureMode || scriptureMode === "off") return null;
  const edition = editionForMode(scriptureMode);
  if (!edition) return null;
  if (!pack) {
    return {
      pages: [unavailableNote()],
      citation: String(citation || ""),
      unavailable: true,
    };
  }
  const resolved = resolveCitation(citation, pack);
  if (!resolved.ok) {
    return {
      pages: [unavailableNote()],
      citation: resolved.citation || String(citation || ""),
      unavailable: true,
    };
  }
  return {
    pages: paginateVerses(resolved.verses, paginationMode),
    citation: resolved.citation,
    unavailable: false,
  };
}

export function applyScriptureToSimpleView(view, {
  scriptureMode,
  pack,
  paginationMode,
}) {
  if (!view?.values) return view;
  const scripturePages = {};
  for (const key of ["OT", "NT", "GS"]) {
    const citation = view.values[key];
    if (!citation || citation === "-") continue;
    const built = scriptureLessonPages({
      citation,
      scriptureMode,
      pack,
      paginationMode,
    });
    if (built) scripturePages[key] = built;
  }
  return { ...view, scripturePages };
}

export function applyScriptureToTimedOffice(office, {
  scriptureMode,
  pack,
  paginationMode,
}) {
  if (!office?.sections || scriptureMode === "off") return office;
  const sections = { ...office.sections };
  for (const [key, section] of Object.entries(sections)) {
    if (!/_LESSON_\d+$/.test(key) || !section.citation) continue;
    const built = scriptureLessonPages({
      citation: section.citation,
      scriptureMode,
      pack,
      paginationMode,
    });
    if (!built) continue;
    sections[key] = {
      ...section,
      pages: built.pages,
      preservePages: true,
      scriptureUnavailable: built.unavailable,
      numberedVerses: !built.unavailable,
    };
  }
  return { ...office, sections };
}
