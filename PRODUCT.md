# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curate AI serves a **two-sided community of equals** — neither side is subordinate when product decisions conflict:

- **Writers / creators** publishing written work (essays, guides, crypto/tech commentary) who want a fair, merit-based source of income for the written word instead of algorithmic reach games.
- **Curators / voters** who read, cast quadratic votes, and earn CAT for surfacing quality writing early and honestly.

Readers/audience are served by the same surfaces but are not a distinct primary segment; today's reader is a prospective writer or curator. Onboarding assumes people who are *not* crypto-native — the product deliberately does not require a wallet or web3 fluency to start.

## Product Purpose

Curate AI is a decentralized publishing and curation platform for the written word. Writers publish posts; a combination of AI scoring and human quadratic voting rates quality; a daily on-chain settlement distributes CAT-token rewards to writers and curators according to that combined signal.

It exists to make reward distribution for online writing **fair and legible** — success means a good post written by an unknown author, surfaced by honest curators, earns more than a low-quality post amplified by whales, sybils, or vote circles.

## Positioning

Curate AI pairs **AI + human signal** (not one or the other) to score writing, and settles rewards through mechanisms explicitly chosen to resist capital and identity gaming:

- **Quadratic voting** so influence scales with breadth of genuine support, not wallet size — countering whale-dominated rewards and low-quality vote circles.
- **Reputation-based, BrightID-verified identity** — one person, one voice — countering sybil-farmed engagement.
- **Transparent, inspectable AI scoring** from open-source models — countering opaque AI moderation.
- **Words before wallets** onboarding (email/OAuth via Magic) — countering "wallets before words" friction that gates most web3 apps.

The defensible position is the *combination*: a writing platform where the scoring and the identity layer are both transparent and both gaming-resistant, wrapped in an onboarding that hides the chain until value needs to move.

## Operating Context

- **Chain:** Sonic (currently `sonic-testnet`; see Capabilities for the pre-mainnet status). Native token symbol is sourced from the configured wagmi chain.
- **Contracts** (on-chain source of truth): `CurateAiPosts` (post registry, scores, cooldowns/burns), `CurateAiVote` (voting, AI vote), `CurateAiSettlement` (daily settlement + reward claims), `CurateAiRoleManager` (Curator / Moderator / AI-agent roles), `CuratAiToken` (the CAT token).
- **Content storage:** post media and images stored on IPFS, with service-worker + client caching to keep IPFS reads fast (see `SERVICE_WORKER_*.md`, `IPFS_IMAGE_CACHING_OPTIONS.md`).
- **Auth/session:** Magic (email / OAuth) issues a session; a JWT `accessToken` carries the user UUID; wallet actions run through wagmi/viem.
- **Key surfaces (routes):** landing (`/`), auth (`/auth`), interest onboarding (`/onboarding/interests`), home feed (`/home`), post editor (`/create`), post view (`/post/[uuid]`), profile (`/profile/[id]`), search (`/search`), dashboard (`/dashboard`).
- **Backend dependency:** the app reads its RPC URL and other config from a backend/DB at runtime — the frontend renders blank without that backend reachable (WagmiProvider gates on the DB-provided RPC URL).

## Capabilities and Constraints

**Live today (confirmed):**
- On-chain **quadratic voting and CAT rewards**, including daily settlement (`settleDay`) and reward claiming (`claimRewards`).
- **BrightID identity verification** — one person, one voice.
- **Transparent AI scoring** — posts receive an AI rating (0–100) from inspectable/open-source models; `aiRating` is `null` until a post is scored.
- Rich post authoring (TipTap-based editor, markdown), post cooldowns and reset-burn mechanics, role-gated curation/moderation.

**Roadmap / not yet live:**
- **x402 micropayments** — the `x402` / `x402-axios` dependencies are installed but the HTTP-402 payment flow is not yet part of the shipped product. Do not present it as a live feature.

**Constraints & terminology:**
- Currently **pre-launch, heading to mainnet** — the mechanism is real and exercised on testnet, but there is not yet a real-user production deployment. Copy and design must not imply an established user base, track record, or mainnet economy that does not yet exist.
- Post IDs are **0-based** (`postCounter++`); a post's on-chain score is its `totalScore`.
- On-chain reads are polled on a **deliberately slow cadence** (default 60s; 300s for rare edge reads) because dev RPC is tunneled through ngrok — real-time-feeling UI must not assume sub-minute freshness for chain reads.
- The token is spelled **CAT** in display; the contract module is `CuratAiToken` (note the missing "e") — preserve both spellings where they already appear rather than "correcting" contract names.

## Brand Commitments

- **Name:** Curate AI. **Token:** CAT.
- **Existing taglines / voice in the product:** "For the written word", "The Curation Lens.", "AI + human signal", "Fair distribution", "One person, one voice." Voice is confident, plain-spoken, and anti-hype — it names the problems (whale-dominated rewards, sybil-farmed engagement, opaque AI moderation) directly.
- A `Logo` component and landing identity already exist and are the incumbent visual authority (documenting/replacing the visual world is out of scope for this file; see `/impeccable document` or a redesign flow).

*Visual direction (palette, type, components) is intentionally not fixed here.*

## Evidence on Hand

- **Real product content flows from the backend API** (posts, authors, AI ratings, votes) — there is no bundled corpus of real published posts in the repo.
- The homepage and sidebars ship **placeholder/dummy content** (`DUMMY_FEATURED_POSTS`, `DUMMY_USERS` in `constants/home-revamp.ts`, using Unsplash images and invented author names) for layout. These are **not real posts, users, or testimonials** and must never be surfaced as evidence of real activity.
- **No testimonials, press, case studies, benchmarks, user counts, or mainnet economic figures exist.** Future work must not fabricate any of these; the pre-launch status makes social-proof claims especially off-limits until real data exists.

## Product Principles

1. **Merit over capital.** Rewards follow combined AI + human quality signal, never wallet size or engagement volume. Quadratic voting and one-person-one-voice identity are load-bearing, not decoration.
2. **Words before wallets.** Reading, discovering, and starting to write never demand a wallet or crypto knowledge first; the chain surfaces only when value actually moves.
3. **Inspectable by default.** Scoring and identity are transparent and explainable. Where the product shows a score or a reward, a user should be able to understand *why* — this is the explicit counter to opaque moderation.
4. **Two-sided fairness.** Writers earn from quality work and curators earn from surfacing it early; UI, incentives, and defaults must not privilege one side over the other.
5. **On-chain truth, writing-first feel.** Value and settlement are genuinely on-chain, but the experience should feel like a modern writing platform, not a crypto dapp.
