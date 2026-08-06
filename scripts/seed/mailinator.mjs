// Reads Magic's login email from a Mailinator *public* inbox (no API token).
// Public inboxes are world-readable, which is fine for throwaway seed accounts.
//
// Endpoints (unofficial but stable public v2 API):
//   list:    GET /api/v2/domains/public/inboxes/<inbox>
//   message: GET /api/v2/domains/public/messages/<messageId>

const BASE = "https://api.mailinator.com/api/v2/domains/public";
const UA = "Mozilla/5.0 (curate-ai-seed)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`mailinator ${res.status} for ${url}`);
  return res.json();
}

/** Flattens a message's parts into one big text blob (html + plain). */
function messageText(msg) {
  const parts = msg?.parts || [];
  return parts.map((p) => p?.body || "").join("\n");
}

/** Pulls the Magic confirmation link and/or 6-digit OTP out of the email. */
export function extractMagicCredentials(text) {
  // Any magic.link URL (login/confirm), un-HTML-escaped.
  const clean = text.replace(/&amp;/g, "&").replace(/&#61;/g, "=");

  const urlRe = /https?:\/\/[^\s"'<>)]+/gi;
  const urls = clean.match(urlRe) || [];
  const magicLinks = urls.filter((u) => /magic\.link/i.test(u));
  // Prefer an explicit confirm/login link; otherwise take the longest magic URL.
  const link =
    magicLinks.find((u) => /confirm|login|magic_credential/i.test(u)) ||
    magicLinks.sort((a, b) => b.length - a.length)[0] ||
    null;

  // OTP: Magic emails show the code as six digits, often spaced or in a table.
  let otp = null;
  const otpLabelled = clean.match(/(?:code|passcode)[^\d]{0,40}(\d[\d\s-]{4,10}\d)/i);
  if (otpLabelled) {
    const digits = otpLabelled[1].replace(/\D/g, "");
    if (digits.length === 6) otp = digits;
  }
  if (!otp) {
    const bare = clean.match(/\b(\d{6})\b/);
    if (bare) otp = bare[1];
  }

  return { link, otp };
}

/**
 * Polls the public inbox until an email newer than `sinceMs` arrives, then
 * returns its extracted { link, otp }. Throws on timeout.
 */
export async function waitForMagicEmail(
  inbox,
  { sinceMs = Date.now(), timeoutMs = 90_000, pollMs = 4_000, log = () => {} } = {}
) {
  const deadline = Date.now() + timeoutMs;
  let seenIds = new Set();

  while (Date.now() < deadline) {
    let list;
    try {
      list = await getJson(`${BASE}/inboxes/${encodeURIComponent(inbox)}`);
    } catch (e) {
      log(`  inbox fetch retry: ${e.message}`);
      await sleep(pollMs);
      continue;
    }

    const msgs = (list?.msgs || [])
      // Only messages that arrived after we triggered the send (5s slack).
      .filter((m) => (m.time || 0) >= sinceMs - 5_000)
      .sort((a, b) => (b.time || 0) - (a.time || 0));

    for (const m of msgs) {
      if (seenIds.has(m.id)) continue;
      seenIds.add(m.id);
      log(`  email arrived: "${m.subject}" (${m.from})`);
      let full;
      try {
        full = await getJson(`${BASE}/messages/${encodeURIComponent(m.id)}`);
      } catch (e) {
        log(`  message fetch retry: ${e.message}`);
        continue;
      }
      const creds = extractMagicCredentials(messageText(full));
      if (creds.link || creds.otp) return creds;
      log("  email had no magic link/OTP, waiting for next…");
    }

    await sleep(pollMs);
  }
  throw new Error(`no Magic email in ${inbox} within ${timeoutMs}ms`);
}
