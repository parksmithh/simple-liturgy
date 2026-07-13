const STORAGE_KEY = "daily-office-theme";

function updateControl(button, theme) {
  if (!button) return;
  const nextTheme = theme === "dark" ? "light" : "dark";
  button.textContent = nextTheme === "dark" ? "Dark" : "Light";
  button.setAttribute("aria-label", `Use ${nextTheme} mode`);
  button.setAttribute("aria-pressed", String(theme === "dark"));
}

function applyTheme(context, theme) {
  context.root.dataset.theme = theme;
  context.meta?.setAttribute("content", theme === "dark" ? "#111311" : "#e9e6dc");
  updateControl(context.button, theme);
}

export function initializeTheme({ root, button, storage, media, meta }) {
  const saved = storage.getItem(STORAGE_KEY);
  const theme = saved === "light" || saved === "dark" ? saved : media.matches ? "dark" : "light";
  applyTheme({ root, button, meta }, theme);
  return theme;
}

export function toggleTheme({ root, button, storage, meta }) {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme({ root, button, meta }, theme);
  storage.setItem(STORAGE_KEY, theme);
  return theme;
}
