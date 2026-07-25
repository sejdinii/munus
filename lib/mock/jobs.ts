/* Mock jobs — verbatim from prototypes/scout-pink-v2.html (binding spec).
   Replaced by the real deck API in W2. The `supported` flag from the
   prototype is deliberately absent: MVP is redirect-apply for every job
   (FEATURES.md D2). */

export type Job = {
  id: string;
  company: string;
  monogram: string;
  color: string;
  deck: string;
  pop: string;
  title: string;
  location: string;
  salary: string;
  type: string;
  source: string;
  fresh: string;
  match: number;
  reasons: [string, string];
  concern: string;
  about: string;
};

export const jobs: Job[] = [
  {
    id: "northstar",
    company: "Northstar",
    monogram: "N",
    color: "#dcd6ff",
    deck: "#efecff",
    pop: "#d6ff63",
    title: "Senior Product Designer",
    location: "Remote · Europe",
    salary: "€72–88k",
    type: "Full-time",
    source: "Company careers",
    fresh: "18 min ago",
    match: 92,
    reasons: [
      "Your 6 years in SaaS exceeds the 5-year requirement",
      "Figma, discovery, and design systems match",
    ],
    concern: "Portfolio must show one 0→1 product case study.",
    about:
      "Own end-to-end product design for a workflow platform used by distributed operations teams. You will partner with product and engineering from discovery through shipped outcomes.",
  },
  {
    id: "loomery",
    company: "Loomery",
    monogram: "L",
    color: "#bfe9ff",
    deck: "#e9f7ff",
    pop: "#ff8b5c",
    title: "Product Designer, Growth",
    location: "Berlin · Hybrid",
    salary: "€65–78k",
    type: "Full-time",
    source: "Welcome to the Jungle",
    fresh: "44 min ago",
    match: 87,
    reasons: [
      "Strong overlap with your activation and onboarding work",
      "English-first team and Berlin hybrid preference match",
    ],
    concern:
      "Role asks for experimentation analytics; your profile has limited evidence.",
    about:
      "Design experiments across acquisition, activation, and retention. Work in a small cross-functional group with direct access to customers and product data.",
  },
  {
    id: "fieldnote",
    company: "Fieldnote",
    monogram: "F",
    color: "#d8f3b5",
    deck: "#eff8e6",
    pop: "#6957f5",
    title: "Founding Product Designer",
    location: "Remote · EMEA",
    salary: "€70–95k",
    type: "Full-time",
    source: "Otta",
    fresh: "2 hr ago",
    match: 81,
    reasons: [
      "Your early-stage product work fits the ownership level",
      "Remote EMEA and salary preferences match",
    ],
    concern: "The role includes light brand work outside your stated focus.",
    about:
      "Set the design direction for a young B2B platform, build its first durable design system, and work directly with the founders on product strategy.",
  },
  {
    id: "arc",
    company: "Arc Health",
    monogram: "A",
    color: "#ffdbbb",
    deck: "#fff1e5",
    pop: "#78d9ff",
    title: "Product Design Lead",
    location: "London · Hybrid",
    salary: "£82–96k",
    type: "Full-time",
    source: "Company careers",
    fresh: "Today",
    match: 74,
    reasons: [
      "Design leadership and complex workflow experience align",
      "Healthcare experience is preferred, not required",
    ],
    concern: "Requires two office days; your preference is remote-first.",
    about:
      "Lead a small product design team simplifying clinical administration. Balance hands-on product work with coaching and design operations.",
  },
  {
    id: "mono",
    company: "Mono",
    monogram: "M",
    color: "#ffd9e6",
    deck: "#fff0f5",
    pop: "#d6ff63",
    title: "Staff Product Designer, Platform",
    location: "Remote · Europe",
    salary: "€85–102k",
    type: "Full-time",
    source: "Company careers",
    fresh: "31 min ago",
    match: 89,
    reasons: [
      "Platform and design-system depth match the staff scope",
      "Remote Europe and salary band both clear your floor",
    ],
    concern: "Expects occasional travel to Copenhagen (quarterly).",
    about:
      "Shape the design platform powering every Mono product surface: tokens, primitives, and the tooling other designers build with.",
  },
  {
    id: "brightline",
    company: "Brightline",
    monogram: "B",
    color: "#d6ecff",
    deck: "#ecf6ff",
    pop: "#ffe36e",
    title: "Senior UX Designer, Payments",
    location: "Amsterdam · Hybrid",
    salary: "€70–84k",
    type: "Full-time",
    source: "Otta",
    fresh: "1 hr ago",
    match: 78,
    reasons: [
      "Complex-flow experience maps to payments onboarding",
      "English-first team; relocation support offered",
    ],
    concern: "Domain is regulated fintech; compliance review adds process.",
    about:
      "Design the merchant onboarding and payout flows for a European payments platform, working tightly with risk and compliance.",
  },
  {
    id: "cargo",
    company: "Cargo",
    monogram: "C",
    color: "#e3ddff",
    deck: "#f1eeff",
    pop: "#ff8b5c",
    title: "Product Designer, Logistics",
    location: "Remote · EMEA",
    salary: "€64–76k",
    type: "Full-time",
    source: "Welcome to the Jungle",
    fresh: "3 hr ago",
    match: 72,
    reasons: [
      "Operational-tool background fits dispatch workflows",
      "Remote EMEA matches your preference",
    ],
    concern: "Salary top end sits below your stated midpoint.",
    about:
      "Redesign dispatch and tracking tools used by freight teams in 14 countries. Heavy tables, live data, edge cases everywhere.",
  },
  {
    id: "halide",
    company: "Halide",
    monogram: "H",
    color: "#d9f2ea",
    deck: "#ecf9f4",
    pop: "#f20c78",
    title: "Design Lead, Mobile",
    location: "Remote · Europe",
    salary: "€88–105k",
    type: "Full-time",
    source: "Company careers",
    fresh: "Today",
    match: 84,
    reasons: [
      "Mobile-first shipping record matches the charter",
      "Lead level aligns with your two-level preference",
    ],
    concern: "Team is 11 hours of overlap with PST twice a week.",
    about:
      "Lead mobile design across a photography toolset loved by professionals. Small senior team, high craft bar, direct user community access.",
  },
];

export function jobById(id: string): Job | undefined {
  return jobs.find((j) => j.id === id);
}
