import {
  hasScripturePreference,
  setScriptureMode,
  SCRIPTURE_MODES,
} from "./scripture-preference.js?v=0.3.162";

export const SCRIPTURE_ONBOARDING_COPY = {
  title: "How should Scripture appear?",
  description:
    "Appointed citations always show. Full Psalm and lesson text is optional—Off keeps the citation only. Change this anytime in Settings.",
};

export function shouldOfferScriptureOnboarding({ hasPreference }) {
  return !hasPreference;
}

export function createScriptureOnboardingController({
  document,
  storage,
  controls,
  canOfferAutomatically = () => true,
  onChoose,
}) {
  const dialog = document.querySelector("#scripture-onboarding");
  const form = document.querySelector("#scripture-onboarding form");
  const installDialog = document.querySelector("#install-dialog");
  const title = document.querySelector("#scripture-onboarding-title");
  const description = document.querySelector("#scripture-onboarding-description");
  let pending = false;
  let retryAfterInstall = false;

  title.textContent = SCRIPTURE_ONBOARDING_COPY.title;
  description.textContent = SCRIPTURE_ONBOARDING_COPY.description;

  function isEligible() {
    return shouldOfferScriptureOnboarding({
      hasPreference: hasScripturePreference(storage),
    });
  }

  function show() {
    dialog.returnValue = "";
    pending = true;
    dialog.showModal();
    return true;
  }

  function offerAutomatic() {
    if (!canOfferAutomatically() || dialog.open || !isEligible()) return false;
    if (installDialog?.open) {
      retryAfterInstall = true;
      return false;
    }
    return show();
  }

  function finish(mode) {
    if (!pending) return false;
    pending = false;
    const chosen = SCRIPTURE_MODES.has(mode) ? mode : "off";
    const applied = setScriptureMode({ controls, storage }, chosen);
    if (applied) onChoose?.(applied);
    return true;
  }

  form.addEventListener("submit", event => {
    const mode = event.submitter?.value;
    if (!SCRIPTURE_MODES.has(mode)) return;
    event.preventDefault();
    finish(mode);
    dialog.close(mode);
  });

  dialog.addEventListener("close", () => {
    if (!pending) return;
    finish(dialog.returnValue);
  });

  installDialog?.addEventListener("close", () => {
    const shouldRetry = retryAfterInstall;
    retryAfterInstall = false;
    if (shouldRetry) offerAutomatic();
  });

  return {
    isOpen: () => dialog.open,
    offerAutomatic,
  };
}
