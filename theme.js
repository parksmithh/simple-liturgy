const STORAGE_KEY = "daily-office-theme";

function updateControl(button, theme) {
  if (!button) return;
  const nextTheme = theme === "dark" ? "light" : "dark";
  button.textContent = nextTheme === "dark" ? "Dark" : "Light";
  button.setAttribute("aria-label", `Use ${nextTheme} mode`);
  button.setAttribute("aria-pressed", String(theme === "dark"));
}

function themeColor(context) {
  const styles = context.styles
    ? context.styles(context.root)
    : globalThis.getComputedStyle?.(context.root);
  return styles?.getPropertyValue("--app-background").trim() || "";
}

function applyTheme(context, theme) {
  context.root.dataset.theme = theme;
  const color = themeColor(context);
  if (color) context.meta?.setAttribute("content", color);
  updateControl(context.button, theme);
}

export function initializeTheme({ root, button, storage, media, meta, styles }) {
  const saved = storage.getItem(STORAGE_KEY);
  const theme = saved === "light" || saved === "dark" ? saved : media.matches ? "dark" : "light";
  applyTheme({ root, button, meta, styles }, theme);
  return theme;
}

export function toggleTheme({ root, button, storage, meta, styles }) {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme({ root, button, meta, styles }, theme);
  storage.setItem(STORAGE_KEY, theme);
  return theme;
}
