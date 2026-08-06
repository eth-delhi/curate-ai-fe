// Generates distinct, readable post content (title + markdown body + tags) for
// each seeded user. Deterministic by index so re-runs are reproducible, but
// varied enough that 50 posts don't read like copy-paste.

const TOPICS = [
  {
    tag: "curation",
    subject: "decentralized curation",
    title: "Why the crowd is a better editor than the algorithm",
    body: [
      "For a decade the feed decided what we read. An opaque ranking model, tuned for time-on-site, quietly became the most powerful editor in history — and nobody voted for it.",
      "Curation done in the open flips that. When readers stake their own reputation on what they surface, the incentives finally point at quality instead of outrage.",
      "The interesting part isn't the voting. It's that the record is public: you can trace *why* a piece rose, who backed it, and when. That auditability is something no black-box ranker will ever give you.",
      "I don't think this replaces editors. I think it turns every serious reader into one, and lets the good ones compound their credibility over time.",
    ],
  },
  {
    tag: "quadratic-voting",
    subject: "quadratic voting",
    title: "Quadratic voting, explained without the math anxiety",
    body: [
      "Quadratic voting sounds intimidating, but the idea is simple: your first vote is cheap, and each additional vote on the same thing costs more. Ten votes don't cost 10x — they cost 100x.",
      "The effect is that a whale can't just flood a post to the top. Spreading influence across many things you genuinely like beats piling everything onto one.",
      "It's not perfectly sybil-resistant on its own, which is why identity and reputation still matter. But as a dial for 'how much does intensity count versus breadth', it's remarkably honest.",
      "Try it once and you feel the shift: you start asking *how much* you care, not just *whether* you care.",
    ],
  },
  {
    tag: "writing",
    subject: "writing on-chain",
    title: "Publishing where nobody can quietly edit you later",
    body: [
      "There's a specific dread to publishing on a platform that can rewrite the rules — or your reach — overnight. Permanence changes how you write.",
      "When the content hash is pinned and the authorship is signed by your own key, the post is yours in a way a database row never was.",
      "That doesn't mean everything belongs on-chain. Drafts, edits, half-thoughts — keep those soft. But the finished thing, the thing you're willing to stand behind? Anchor it.",
      "The upside is subtle: you write a little more carefully, and a little more freely, at the same time.",
    ],
  },
  {
    tag: "reputation",
    subject: "on-chain reputation",
    title: "Your following shouldn't be your moat",
    body: [
      "The oldest unfair advantage online is the head start: accounts with a million followers get read no matter what they post.",
      "A curation market where votes are weighted by conviction, not by the author's audience size, gives a first-time writer a real shot at the top of the feed.",
      "Reputation should be earned per-piece and accrue slowly, not inherited from a legacy follower count that says nothing about today's work.",
      "That's the bet: judge the work, and let reputation be a lagging indicator of quality rather than a leading cause of visibility.",
    ],
  },
  {
    tag: "ai",
    subject: "AI and human judgment",
    title: "AI can rank, but it can't vouch",
    body: [
      "Models are great at surfacing candidates — they read faster than any of us. What they can't do is put something on the line.",
      "A vouch is a human saying 'I'll spend my reputation on this being good.' That signal is expensive precisely because a person pays for it.",
      "The healthiest system I can imagine uses AI to widen the funnel and humans to narrow it, each doing the thing the other is bad at.",
      "Keep the machine in the loop. Just don't let it be the one holding the pen — or the gavel.",
    ],
  },
  {
    tag: "web3",
    subject: "wallets as identity",
    title: "The login that finally disappears",
    body: [
      "The best authentication is the one you stop noticing. Email in, key generated, done — no password to forget, no seed phrase to lose on day one.",
      "Underneath, that email login is a real wallet. You can graduate to full self-custody whenever you're ready, but you don't have to start there.",
      "Onboarding has been web3's tallest wall for years. Meeting people where they are — an email address — is how the wall comes down.",
      "Sovereignty as an option, not an entrance exam. That's the version normal people actually adopt.",
    ],
  },
  {
    tag: "economics",
    subject: "token incentives",
    title: "Paying attention, literally",
    body: [
      "Attention has always been the scarce resource; we just never priced it honestly. Reward tokens for curation are a clumsy first attempt to do exactly that.",
      "The design risk is obvious: reward the wrong behavior and you get farms, not readers. Sinks, cooldowns, and quadratic costs exist to keep the game honest.",
      "What I like is that the ledger makes the failure modes visible. If the incentives are broken, you can *see* the farming in the data.",
      "Get the incentives right and curation stops being volunteer labor and starts being a job worth doing well.",
    ],
  },
  {
    tag: "community",
    subject: "small internet communities",
    title: "In praise of the 500-person feed",
    body: [
      "Not everything needs to scale to a billion users. Some of the best reading I do happens in rooms of a few hundred people who actually know the subject.",
      "Curation tools tuned for small, high-trust groups produce a different texture than global virality — slower, deeper, weirder in the good way.",
      "The trick is giving those groups real ownership: their votes, their record, their space, portable if they ever want to leave.",
      "Big platforms optimize for the average. Small ones can optimize for the specific. I'll take specific.",
    ],
  },
];

const ANGLES = [
  "A field note",
  "Notes after a week of testing",
  "The short version",
  "What changed my mind",
  "An honest take",
  "Thinking out loud",
  "One thing I keep coming back to",
];

/**
 * Returns { title, body (markdown), tags } for the given zero-based index.
 * Cycles through topics and varies the framing so each post is distinct.
 */
export function makePost(index) {
  const topic = TOPICS[index % TOPICS.length];
  const angle = ANGLES[Math.floor(index / TOPICS.length) % ANGLES.length];
  const round = Math.floor(index / TOPICS.length) + 1;

  // Keep the base title on the first pass, then prefix with an angle so later
  // passes over the same topic stay recognizably different.
  const title =
    round === 1 ? topic.title : `${topic.title} — ${angle.toLowerCase()}`;

  const intro =
    round === 1 ? "" : `*${angle} on ${topic.subject}.*\n\n`;

  const body =
    `## ${title}\n\n` +
    intro +
    topic.body.join("\n\n") +
    `\n\n---\n\n*Seeded post #${index + 1} — written to exercise the real publish + on-chain flow.*`;

  const tags = [topic.tag, "curate-ai"];

  return { title, body, tags };
}
