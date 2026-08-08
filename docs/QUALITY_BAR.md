# MUNUS QUALITY BAR — the standard this app ships to

Created 2026-08-08 from the founder's directive (recorded as D23 in
FEATURES.md): the app must reflect the design and engineering standard of
today's top apps — "the same as asking an IT agency or a software developer
at Apple." The founder ditched a prior external build over exactly this bar.
Focus ordered: **perfect job suggestions + CV/letter tailoring, with every
process automated as far as honesty allows.** Automated *submission* stays
post-MVP (D8/D22).

All references below were pulled from Mobbin on 2026-08-08. A pattern with
no citation is not load-bearing; a deviation from a cited leader pattern
carries its written reason (CLAUDE.md rule 3).

---

## 1 · What "amaze" means, operationally

Not decoration. Four measurable properties, checked every wave:

1. **Instant comprehension** — every screen answers "why am I seeing this?"
   The deck card itself says why the job matched. The score explains itself.
2. **Felt craft** — motion, loading, and empty states are designed, not
   default. Nothing jumps, nothing flashes unstyled, nothing dead-ends.
3. **Compounding intelligence** — the app visibly gets smarter with use:
   each swipe, each one-tap fact, each accepted suggestion improves the next
   match. The user can *see* the flywheel.
4. **Honesty as luxury** — the leaders label data provenance (LinkedIn,
   Glassdoor below). We go further: nothing invented, everything traceable.
   That discipline, surfaced well, IS the premium feel.

---

## 2 · Research evidence, loop by loop

### Deck (core loop) — Tinder
[Swiping for a match](https://mobbin.com/flows/c7f3bc64-0e7d-4859-abba-22919c981813) ·
[card → full profile](https://mobbin.com/flows/a91721ab-5ab7-4278-be42-778582182c88)
- Cards carry **"Matched 4 Preferences" + evidence chips** (3 Photos ✓,
  Has Bio ✓…) directly on the card. → Munus: match-reason chips on every
  card ("Figma ✓ · Salary fits ✓ · Visa OK ✓"). This is our evidence-only
  matching made visible — the single highest-leverage design move we get.
- **"Learning your type — send 15 more likes to get started"** banner: the
  recommender narrates its own cold start. → Munus copies this honestly
  ("Learning your taste — N swipes in").
- **"Recently Active" badge** = freshness as a trust signal. → Munus:
  "Verified live today" chip (we already re-check links; surface it).
- Scroll-down turns the card into the full detail with actions persistent —
  no navigation cliff between deciding and reading. Already our pattern.

### Job list & detail — LinkedIn
[Job detail](https://mobbin.com/flows/93510bda-78ff-44a9-b48d-f3b640c9ce67) ·
[searching for jobs](https://mobbin.com/flows/7e099382-6f60-48a8-82ec-25a70e9cef6d)
- **Salary provenance labels**: "$130K/yr (from job description)" vs
  "(LinkedIn est.)". The category leader labels which numbers are real.
  → Validates D4; Munus ships "listed by employer" / "not listed" only.
  **Deviation (justified):** we never ship the estimate variant at all —
  estimates are the exact fabrication channel our verifier exists to close.
- "Reposted 2 weeks ago", "Actively recruiting", saved-search alerts with
  **"92 new" since-last-visit counts**, "Alert On" → the retention loop is
  *delta since you left*, not a naked notification.
- **Deviation (justified):** LinkedIn's applicant counts ("13 applicants")
  create competition anxiety and we cannot verify them from ATS feeds —
  unverifiable numbers are banned. We show freshness instead.
- Apply carries the **external-link glyph** (↗) — redirect-apply is what
  the leader honestly shows. Validates D2.

### Application hub — Glassdoor, Wellfound
[Glassdoor job activity](https://mobbin.com/flows/9f33a7bf-f182-4602-aa5d-9cb8a79054a3) ·
[Wellfound applications](https://mobbin.com/flows/d3bf1b51-18cf-47ef-b681-9681151a7139)
- Glassdoor: one hub with **Saved / Alerts / Applied tabs**, "Applied on
  Glassdoor Feb 18" stamps, and an illustrated empty state with a forward
  CTA ("Explore jobs for you"). Wellfound: Ongoing/Archived split, status
  dot + relative time ("Pending · less than a minute ago").
  → Munus favorites/receipts already lean this way; the hub gets the
  three-tab shape and stamped timeline (D2's Prepared → Opened → Confirmed
  is *more* honest than either leader's single stamp).

### Progressive profiling — Glassdoor iOS (the sleeper hit)
[Inline skill prompt](https://mobbin.com/screens/ab1a62c4-c216-4648-af14-2b5317a02b40)
- Mid-feed card: **"Do you have this skill: GIS? — Yes / No / Skip."** One
  tap, zero forms. → For Munus this is not a growth hack, it is an
  **evidence-store feeder**: each answered chip is a verified fact the
  matcher AND the CV studio can cite. The profile builds itself one tap at
  a time. This automates profile-building — exactly the "automate every
  process" order.

### Match confidence — Credit Karma
[Karma Confidence](https://mobbin.com/screens/6fc37382-12d8-4e81-aec9-6df7f69c4eea)
- "100% likely to be approved" + **"How we rank offers ⓘ"** — a confidence
  number never appears without an explanation affordance. → Munus: the
  match score is always tappable → "why this ranked here" sheet listing the
  actual matched facts. A bare percentage is banned.

### Profile completeness & CV review — Wellfound
[Resume upload](https://mobbin.com/flows/412a53f3-94c8-4cfd-8f01-8288b0a5290d) ·
[resume critique](https://mobbin.com/screens/994515e4-69ce-4e2a-9a41-23f283614428)
- Segmented **progress bar + "3 steps to complete" + the single
  highest-impact next step** ("Add relevant skills — the #1 factor in
  recruiter outreach"). Not a naked percentage — always the next action.
- Their resume review is prose criticism ("missing key outcomes…").
  → Munus does it structurally: a **CV health score** computed from the
  evidence store (has outcomes? has dates? skills coverage vs target
  vertical?) — each finding deep-links to the fix.

### Onboarding — Duolingo
[Onboarding](https://mobbin.com/flows/7d7aacbe-213b-471e-8b1f-b5b7087bcb65) ·
[deferred signup](https://mobbin.com/flows/9f5126ab-a403-4ac6-bc9f-1f44b1d373ec)
- One question per screen · top progress bar · personalized interstitials
  ("Since you know a few words, start at Score 10") · **value before
  signup** — the account ask comes *after* the first win ("Create a
  profile to save your progress"). → Munus: onboarding ends by showing
  your first real matched deck *from the shared job pool*, THEN asks for
  the account to save it. Guest preview (D16) becomes load-bearing.
- Commitment device ("I'M COMMITTED") → our daily-goal step can mirror
  this exactly; it feeds the alert cadence question we already ask.

### AI suggestion UX — Raycast, Deepstash, Craft
[Raycast apply-AI-result](https://mobbin.com/flows/78910aea-0efa-4a46-ad01-99426770a9eb) ·
[Deepstash rephrase](https://mobbin.com/flows/da69f7aa-0cec-4252-9a0d-882eb2fdb870)
- The grammar everywhere: **result sheet → Apply / Copy / retry → visible
  "Saved ✓"**. Deepstash adds a quick-action toolbar (Rephrase, Enhance).
  → Studio's Accept/Keep already matches the grammar. Add: per-suggestion
  regenerate ("try another way", counts against the try meter) and the
  tone quick-bar. Every accept lands with a saved-state confirmation.

### Daily ritual — Hinge Standouts
[Standouts](https://mobbin.com/screens/2acae7b0-ec17-418f-910e-41fb35e6d719) ·
["You've seen everyone"](https://mobbin.com/screens/1c9c298d-209c-4fe9-bac7-b17464ebc1d9)
- A *separate, small, curated* daily shelf: "Refreshed daily", a literal
  **"Next refresh in 05:27" countdown**, scarcity by design, and an honest
  terminal state ("You've seen everyone"). → Munus: **Today's Picks — the
  3 best matches each morning**, countdown to refresh, and the deck's
  end-state copies the honesty: "You've seen every live job that fits.
  ~N new jobs arrive daily." Deck exhaustion becomes a ritual hook, not
  an embarrassment. (Also the natural email-digest content — one pipeline,
  two channels.)

### Empty states — Wise, GoPay, Google Drive
[Wise filters-empty](https://mobbin.com/screens/0cdba498-dc6c-40a0-97fb-9acb9b7a417f)
- The standard shape: say *why* it's empty + one-tap **"Clear filters"**
  recovery. Every Munus empty state names its cause and ships a way out.

---

## 3 · The things you didn't ask for (and now can't unsee)

Each lands in a wave below. E = already implied by our contracts, R = new
requirement discovered by this research.

1. **R · Match-reason chips on cards** (Tinder) — the flagship design move.
2. **R · "Why this ranked here" sheet** behind every score (Credit Karma).
3. **R · One-tap fact chips in the deck** (Glassdoor) — self-building,
   verifier-feeding profile. The automation centerpiece.
4. **R · CV health score** with next-action deep links (Wellfound, done
   structurally instead of prose).
5. **R · Today's Picks daily shelf** + refresh countdown + honest deck-end
   (Hinge) — retention without dark patterns.
6. **R · Delta-since-last-visit** ("12 new since Tuesday") on alerts and
   favorites (LinkedIn) — the digest email shares this pipeline.
7. **R · Value-before-signup onboarding** — first matched deck from the
   shared pool BEFORE the account ask (Duolingo).
8. **R · Per-suggestion regenerate + tone quick-bar** in Studio (Deepstash).
9. **E · Provenance labels everywhere** — leaders label sources; we already
   ban estimates. Surface the discipline ("listed by employer", "verified
   live today") as visible chips, not buried policy.
10. **E · Stamped application timeline** — D2's three stamps out-honest the
    leaders' one. Keep; present it as the feature it is.
11. **R · A celebration moment** at "Confirmed applied" — the receipt is
    the win screen (confetti pattern: Runna/Nibble class, restrained,
    reduced-motion aware). Job hunting is grim; the app should mark wins.
12. **R · Match-quality eval harness** (engineering) — "perfect job
    suggestions" is unfalsifiable without a golden set: N profiles × M
    jobs, ranked by hand once, regression-tested on every matcher change.
    No leader screenshot for this; it's what their ML teams do off-screen.

---

## 4 · Engineering standard (invisible until it's missing)

- **Performance budget, enforced in CI once deployed**: LCP < 2.0s on
  4G, deck gesture response < 100ms, route JS < 170KB gz; @react-pdf
  stays lazy-loaded off the critical path.
- **Motion system**: one spring definition (tokens), stamp ramp already
  spec'd; every transition ≤ 300ms; `prefers-reduced-motion` honored
  everywhere (already policy — keep).
- **Skeletons, not spinners**, for every data surface; optimistic UI on
  swipe/save with rollback on failure.
- **PWA**: installable, offline shell for favorites + receipts (a job hunt
  happens on trains), install prompt AFTER the first win, never before.
- **Accessibility AA**: full keyboard deck (arrows = swipe, U = undo),
  focus-visible ring on rose tokens, contrast-checked chips, live-region
  announcements for swipe results.
- **Observability from day one of real data**: Sentry (or equivalent) +
  feed-health dashboard (exists) + **AI observability**: verifier drop
  rate, suggestion acceptance rate, regenerate rate, per-model latency —
  these four numbers ARE the tailoring quality dial.
- **Eval harnesses**: matcher golden set (above) + tailoring eval (a fixed
  CV/job pair set; verifier pass-rate and citation coverage must not
  regress when prompts or models change).
- **Security**: RLS everywhere (done), rate limits on AI endpoints, mock
  checkout deploy-guarded (D21c).

---

## 5 · Build order — quality waves (amends the D21 resequencing)

Each wave keeps the standing exit bar: states complete, critic pass,
tests green, FEATURES.md updated. Waves needing credentials say so.

- **QW0 · Foundation of feel** *(no credentials needed)* — motion tokens +
  spring system, skeleton components, celebration component, empty-state
  overhaul with cause+recovery, keyboard deck, PWA shell. Pure client.
- **QW1 · Legible matching** *(needs Supabase + network for real data;
  mock-data version can ship first)* — match-reason chips on cards,
  "why this ranked" sheet, provenance chips, deck-end honesty screen.
- **QW2 · Self-building profile** *(needs Supabase + Groq)* — CV upload →
  parse → **fact confirmation inbox** (every extracted fact confirmed by
  the user before the verifier may cite it), one-tap fact chips in deck,
  CV health score, Wellfound-style next-action banner.
- **QW3 · The ritual** *(needs real data)* — Today's Picks + refresh
  countdown, delta-since-last-visit, email digest sharing the picks
  pipeline, value-before-signup onboarding rework.
- **QW4 · Studio at full polish** *(needs Groq)* — per-suggestion
  regenerate, tone quick-bar, saved-state confirmations, tailoring eval
  harness wired to CI.
- **QW5 · Ship discipline** — performance budget in CI, Sentry, a11y
  audit pass, PWA install prompt placement, W5b mock checkout + deploy
  guard (unchanged from D21).

The matcher golden set (item 12) starts in QW1 and grows every wave — it
is the definition of "perfect job suggestions" and the reason this plan
is falsifiable rather than vibes.

---

*Maintenance: this document changes only with new dated evidence or a
founder decision. Cite or don't change it.*
