const REFERRAL_CODE_STORAGE_KEY = "referralCode";

const isValidReferralCode = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

/** Reads ?ref= from the URL and stashes it in sessionStorage so it survives
 * the Magic Link / OAuth redirect round-trip back to the app. */
export function captureReferralCodeFromUrl(refParam: string | null) {
  if (typeof window === "undefined" || !refParam) return;
  if (!isValidReferralCode(refParam)) return;
  sessionStorage.setItem(REFERRAL_CODE_STORAGE_KEY, refParam);
}

export function getStoredReferralCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem(REFERRAL_CODE_STORAGE_KEY) ?? undefined;
}

export function clearStoredReferralCode() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REFERRAL_CODE_STORAGE_KEY);
}
