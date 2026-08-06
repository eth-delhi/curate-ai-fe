// Seeds N real users end-to-end, exactly like a human would:
//   1. real Magic email login (OTP/link read from a Mailinator public inbox)
//   2. backend /auth/login -> JWT
//   3. admin prep: fund the Magic wallet + grant CURATOR_ROLE (local hardhat)
//   4. drive the real /create UI -> /posts/publish + on-chain createPost + update
//
// Usage:
//   node scripts/seed/seed.mjs [count]          # default 5
//   HEADFUL=1 node scripts/seed/seed.mjs 1      # watch the browser
//   START_INDEX=5 node scripts/seed/seed.mjs 45 # continue a batch
//
// Requires: the Next dev server, the backend, and the hardhat node all running.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { makePost } from "./content.mjs";
import { waitForMagicEmail } from "./mailinator.mjs";
import { makeProvider, fundWallet, ensureCuratorRole, chainId } from "./chain.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- config ---------------------------------------------------------------
const COUNT = Number(process.argv[2] || 5);
const START_INDEX = Number(process.env.START_INDEX || 0);
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5502";
const ADMIN_RPC = process.env.ADMIN_RPC || "http://127.0.0.1:8545";
const HEADFUL = process.env.HEADFUL === "1";
const BETWEEN_USERS_MS = Number(process.env.BETWEEN_USERS_MS || 4000);
const RUN_ID = Date.now().toString(36);
const SHOTS_DIR = join(__dirname, "screenshots");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

// ---- preflight ------------------------------------------------------------
async function preflight() {
  const problems = [];

  try {
    const r = await fetch(`${APP_URL}/auth`, { redirect: "manual" });
    if (r.status >= 500) problems.push(`app returned ${r.status} at ${APP_URL}`);
  } catch {
    problems.push(`Next dev server not reachable at ${APP_URL} (run: pnpm dev)`);
  }

  let contracts;
  try {
    const r = await fetch(`${BACKEND_URL}/settings/contracts`);
    if (!r.ok) throw new Error(`status ${r.status}`);
    contracts = await r.json();
  } catch (e) {
    problems.push(`backend /settings/contracts failed at ${BACKEND_URL}: ${e.message}`);
  }

  let provider;
  try {
    provider = makeProvider(ADMIN_RPC);
    const id = await chainId(provider);
    log(`  hardhat node ok — chainId ${id}`);
  } catch (e) {
    problems.push(`hardhat node not reachable at ${ADMIN_RPC}: ${e.message}`);
  }

  if (problems.length) {
    log("\nPreflight failed:");
    problems.forEach((p) => log(`  ✗ ${p}`));
    process.exit(1);
  }
  log(`  contracts ok — role ${contracts.role}`);
  return { contracts, provider };
}

// ---- one user -------------------------------------------------------------
async function seedOne({ context, index, contracts, provider }) {
  const inbox = `curate${RUN_ID}${index}`;
  const email = `${inbox}@mailinator.com`;
  const post = makePost(index);
  const page = await context.newPage();

  // Capture the wallet address the app sends to /auth/login — the most reliable
  // place to learn the Magic-generated address without SDK access.
  let walletAddress = null;
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("/auth/login")) {
      try {
        walletAddress = JSON.parse(req.postData() || "{}").walletAddress || null;
      } catch { /* ignore */ }
    }
  });

  log(`\n[#${index}] ${email}`);

  // 1. request the Magic login email
  await page.goto(`${APP_URL}/auth`, { waitUntil: "domcontentloaded" });
  await page.locator("#email").waitFor({ state: "visible", timeout: 30_000 });
  await page.fill("#email", email);
  const sentAt = Date.now();
  await page.getByRole("button", { name: /send magic link/i }).click();
  log("  magic link requested, polling inbox…");

  // 2. read the email and complete login
  const creds = await waitForMagicEmail(inbox, {
    sinceMs: sentAt,
    timeoutMs: 120_000,
    log,
  });

  const loggedIn = page
    .waitForFunction(() => !!localStorage.getItem("accessToken"), { timeout: 60_000 })
    .then(() => "token");

  if (creds.link) {
    log("  opening magic link in-context…");
    const confirm = await context.newPage();
    await confirm.goto(creds.link, { waitUntil: "domcontentloaded" }).catch(() => {});
    // Some confirm pages have a final "confirm login" button; click if present.
    await confirm.getByRole("button", { name: /log ?in|confirm|continue/i })
      .click({ timeout: 4000 }).catch(() => {});
    await loggedIn.catch(() => {});
    await confirm.close().catch(() => {});
  }

  // OTP fallback: enter the code into Magic's iframe on the main page.
  const hasToken = await page.evaluate(() => !!localStorage.getItem("accessToken"));
  if (!hasToken && creds.otp) {
    log(`  link path didn't complete — trying OTP ${creds.otp} in iframe…`);
    const frame = page.frameLocator('iframe[src*="magic"]');
    const otpBox = frame.locator('input').first();
    await otpBox.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
    await otpBox.fill(creds.otp).catch(() => {});
    await page.keyboard.press("Enter").catch(() => {});
  }

  await loggedIn; // throws if we never got a token
  log("  logged in ✓");

  // Wait for the app to have posted /auth/login and captured the address.
  for (let i = 0; i < 20 && !walletAddress; i++) await sleep(300);
  if (!walletAddress) throw new Error("never captured wallet address from /auth/login");
  log(`  wallet ${walletAddress}`);

  // 3. admin prep: fund + curator role
  await fundWallet(provider, walletAddress);
  const roleRes = await ensureCuratorRole(provider, contracts.role, walletAddress);
  log(`  funded + curator ${roleRes.alreadyHad ? "(already had)" : "granted"}`);

  // 4. write and publish a real post
  await page.goto(`${APP_URL}/create`, { waitUntil: "domcontentloaded" });
  const titleInput = page.locator('input[placeholder="Title..."]');
  await titleInput.waitFor({ state: "visible", timeout: 30_000 });
  await titleInput.fill(post.title);

  const editor = page.locator(".ProseMirror");
  await editor.click();
  await editor.pressSequentially(post.body, { delay: 1 });

  // Publish button in the title bar enables once title is set + gates pass.
  const publishBtn = page.getByRole("button", { name: /^publish$/i });
  await publishBtn.waitFor({ state: "visible", timeout: 30_000 });
  // Give the on-chain curator/gas reads a moment to refetch post-grant.
  for (let i = 0; i < 30; i++) {
    if (await publishBtn.isEnabled()) break;
    await sleep(1000);
  }
  if (!(await publishBtn.isEnabled())) {
    throw new Error("Publish button stayed disabled (role/gas/cooldown gate)");
  }
  await publishBtn.click();

  // Tag modal -> add tags -> continue
  const tagInput = page.locator('input[placeholder="Add a tag..."]');
  await tagInput.waitFor({ state: "visible", timeout: 15_000 });
  for (const tag of post.tags) {
    await tagInput.fill(tag);
    await page.keyboard.press("Enter");
  }
  await page.getByRole("button", { name: /continue to publish/i }).click();

  // Confirm modal -> Confirm (fires /posts/publish + on-chain tx + update)
  await page.getByRole("button", { name: /^confirm$/i }).click();

  // Success = redirect to the new post page.
  await page.waitForURL(/\/post\//, { timeout: 120_000 });
  const postUrl = page.url();
  log(`  published ✓ ${postUrl}`);

  return { email, walletAddress, postUrl, curator: roleRes };
}

// ---- main -----------------------------------------------------------------
async function main() {
  log(`Curate AI seeder — ${COUNT} user(s), run ${RUN_ID}`);
  log(`  app=${APP_URL} backend=${BACKEND_URL} rpc=${ADMIN_RPC}\n`);
  const { contracts, provider } = await preflight();
  await mkdir(SHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: !HEADFUL });
  const results = [];

  for (let n = 0; n < COUNT; n++) {
    const index = START_INDEX + n;
    // Fresh context per user = clean Magic session + isolated storage.
    const context = await browser.newContext();
    try {
      const r = await seedOne({ context, index, contracts, provider });
      results.push({ index, ok: true, ...r });
    } catch (e) {
      const shot = join(SHOTS_DIR, `fail-${RUN_ID}-${index}.png`);
      const pages = context.pages();
      if (pages[0]) await pages[0].screenshot({ path: shot, fullPage: true }).catch(() => {});
      log(`  ✗ failed: ${e.message}`);
      results.push({ index, ok: false, error: e.message, screenshot: shot });
    } finally {
      await context.close();
    }
    if (n < COUNT - 1) await sleep(BETWEEN_USERS_MS);
  }

  await browser.close();

  // ---- summary ----
  const ok = results.filter((r) => r.ok);
  log(`\n${"=".repeat(60)}`);
  log(`Done: ${ok.length}/${results.length} users posted successfully`);
  for (const r of results) {
    if (r.ok) log(`  ✓ #${r.index} ${r.email} -> ${r.postUrl}`);
    else log(`  ✗ #${r.index} ${r.error} (see ${r.screenshot})`);
  }
  process.exit(ok.length === results.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
