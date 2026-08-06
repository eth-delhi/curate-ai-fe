# Seed real users + posts

Logs in N real users through the **actual Magic email flow** and has each one
publish a **real post** — same path a human takes: Magic login → backend
`/auth/login` → on-chain `createPost` signed by the Magic wallet → `/posts/update`.

Nothing is faked: real Magic DID tokens, real backend rows, real IPFS pins, real
on-chain transactions. The only automation-specific pieces are (1) reading the
login code from a throwaway **Mailinator public inbox** and (2) the admin prep
each brand-new wallet needs before it's allowed to post.

## What it does per user

1. Opens `/auth`, enters `curate<runid><i>@mailinator.com`, requests the Magic link.
2. Polls the Mailinator public inbox, extracts the magic link / OTP, completes login.
3. Reads the Magic wallet address from the app's `/auth/login` request.
4. **Admin prep** against the local hardhat node:
   - `hardhat_setBalance` → funds the wallet with gas.
   - grants `CURATOR_ROLE` via `RoleManager.grantRole`, sent by the role admin
     using account impersonation (no private key needed).
5. Drives the real `/create` UI: title + body → Publish → tags → Confirm.
6. Waits for the redirect to `/post/<uuid>` = success.

## Prerequisites (all must be running)

- **Next dev server** — `pnpm dev` (note the port it prints; often 3001 if 3000 is taken).
- **Backend** — reachable at `http://localhost:5502` (serves `/settings/contracts`, `/auth/login`, `/posts/*`).
- **Hardhat node** — `http://127.0.0.1:8545` (used for funding + role granting via impersonation).

This is wired for **hardhat-local only** — funding and role granting rely on
hardhat-specific RPC methods.

## Run

```sh
# smoke test first (default is 5)
APP_URL=http://localhost:3001 node scripts/seed/seed.mjs 1

# then the full batch
APP_URL=http://localhost:3001 node scripts/seed/seed.mjs 50
```

### Options (env vars)

| var               | default                  | meaning                                   |
| ----------------- | ------------------------ | ----------------------------------------- |
| `APP_URL`         | `http://localhost:3000`  | Next dev server URL                       |
| `BACKEND_URL`     | `http://localhost:5502`  | backend API                               |
| `ADMIN_RPC`       | `http://127.0.0.1:8545`  | hardhat node (funding + role granting)    |
| `HEADFUL`         | unset                    | `1` opens a visible browser to watch      |
| `START_INDEX`     | `0`                      | continue a batch (post content is indexed) |
| `BETWEEN_USERS_MS`| `4000`                   | delay between users (eases Magic rate limits) |

First arg = number of users.

## Notes & gotchas

- **Mailinator inboxes are public** — fine for throwaway seed accounts, but the
  login codes are world-readable. Don't use this for anything you care about.
- **Magic may rate-limit** bursts of emails from one API key. Keep
  `BETWEEN_USERS_MS` sane; if you hit limits, slow down or run in smaller batches.
- **Magic may reject disposable domains.** If no email ever arrives, Magic is
  likely blocking `mailinator.com` — switch to a domain it accepts.
- **24h post cooldown**: the post contract allows one post per wallet per 24h.
  Fresh wallets are unaffected; re-running for the *same* wallet won't re-post.
- Failures screenshot the page to `scripts/seed/screenshots/` for debugging.

## Files

- `seed.mjs` — orchestrator (Playwright).
- `content.mjs` — deterministic, varied post content per index.
- `mailinator.mjs` — public-inbox polling + magic-link/OTP extraction.
- `chain.mjs` — fund wallet + grant `CURATOR_ROLE` (impersonation).
