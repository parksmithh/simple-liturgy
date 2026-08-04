import { complineServiceAt } from "./compline-preference.js?v=0.3.114";
import { noondayServiceAt } from "./noonday-preference.js?v=0.3.114";

export function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function scheduledServiceAt(date = new Date(), noondayEnabled = true, complineEnabled = true) {
  const noondayService = noondayServiceAt(date, noondayEnabled);
  if (noondayService !== "daily") return noondayService;
  return complineServiceAt(date, complineEnabled);
}

export function timedOfficePreviewToExit({ noondayPreview, complinePreview, scheduledService }) {
  if (complinePreview && scheduledService === "noonday") return "compline";
  if (noondayPreview && scheduledService === "compline") return "noonday";
  return null;
}
