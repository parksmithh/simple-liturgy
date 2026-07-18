import { complineServiceAt } from "./compline-preference.js?v=0.3.96";
import { noondayServiceAt } from "./noonday-preference.js?v=0.3.96";

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
