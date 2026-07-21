export const APP_VERSION = "0.3.101";
export const APP_CHANNEL = "production";

export function appVersionLabel() {
  return `Version ${APP_VERSION}${APP_CHANNEL === "staging" ? " · Staging" : ""}`;
}
