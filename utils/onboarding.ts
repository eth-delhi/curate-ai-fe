// One-time gate for the "select your interests" step.
//
// The interest picker should appear only right after signup — not on every
// login. Gating purely on `interests.length === 0` is wrong: a user who taps
// "Skip for now" (or who simply never picks any) has no interests saved and
// would be sent back through the picker on *every* subsequent login. So we
// remember, per user, that the picker has already been shown.
//
// The marker lives in localStorage and is deliberately preserved across logout
// (see components/ui/HomeNavbar.tsx, which otherwise clears everything) so that
// signing out and back in doesn't reset the gate. It is keyed by the user's id
// so a shared device tracks each account independently.

export const INTERESTS_ONBOARDING_KEY_PREFIX = "curate:interestsOnboarded:";

// Decode the current user's id from the stored backend JWT. Mirrors the
// decode used elsewhere (HomeNavbar, profile page) — kept local so this gate
// has no other dependencies.
function getUserIdFromToken(): string | null {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.uuid || payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

/** True once this user has already been shown the interest picker. */
export function hasSeenInterestsOnboarding(): boolean {
  const userId = getUserIdFromToken();
  if (!userId) return false;
  try {
    return (
      localStorage.getItem(`${INTERESTS_ONBOARDING_KEY_PREFIX}${userId}`) === "1"
    );
  } catch {
    return false;
  }
}

/** Record that this user has now seen the interest picker (idempotent). */
export function markInterestsOnboardingSeen(): void {
  const userId = getUserIdFromToken();
  if (!userId) return;
  try {
    localStorage.setItem(`${INTERESTS_ONBOARDING_KEY_PREFIX}${userId}`, "1");
  } catch {
    // Storage unavailable (private mode / quota) — the gate just falls back to
    // the interests check, which is no worse than before.
  }
}
