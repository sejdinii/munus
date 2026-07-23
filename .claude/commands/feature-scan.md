---
description: Research competitors and derive the full feature set this app SHOULD have, then diff against FEATURES.md
---

Do not build anything. This is market-driven feature discovery.

1. Delegate to the design-researcher subagent with this mission:
   "Analyze what features the leading products in this category actually ship
   TODAY. Sources: Mobbin flows/screens of category leaders (Airbnb, Booking.com,
   plus wedding-specific players like Zola, WeddingWire/The Knot venue tools),
   their app store listings and changelogs, and recent teardowns. Return a
   structured feature inventory: feature name, which competitors have it,
   whether it's table-stakes (everyone has it) or differentiator (some have it)."
   The researcher must cite sources — no feature list from memory.

2. Take that researched inventory and DIFF it against FEATURES.md:
   - Features competitors ship that our file doesn't even mention → add them
     to DISCOVERED GAPS with a [market] tag and which competitor proves demand.
   - Features in our file that NO competitor ships → flag as "possibly
     unnecessary — challenge the user on whether to cut."
   - Table-stakes features we have as MISSING → escalate their priority note.

3. Do NOT silently promote market features into MVP scope. Present the diff
   to the user as a challenge: "The market says you need X, Y, Z. I recommend
   X for MVP, Y post-launch, cutting Z because [reason]. Push back if you
   disagree." The user decides; record decisions in the DECISIONS LOG.

4. End with the 3 features whose absence would most embarrass this app in a
   side-by-side demo against a competitor.
