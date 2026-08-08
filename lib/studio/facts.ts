/* Mock evidence store — stands in for the CV-parse pipeline (W0 exit
   criterion, blocked on Supabase+Groq creds). Contents deliberately match
   the sample deck's fit reasons so suggestions ground believably. Replaced
   by real parsed facts once the facts table exists. */

import type { Fact } from "./types";

export const mockFacts: Fact[] = [
  {
    id: "fact-role-saas",
    kind: "role",
    content:
      "Six years designing B2B SaaS products, most recently as senior product designer on a workflow platform",
    sourceSpan: "Experience · 2020–2026",
  },
  {
    id: "fact-outcome-workflow",
    kind: "outcome",
    content:
      "Led discovery and end-to-end design for a new workflow product, partnering with engineering from prototype to launch",
    sourceSpan: "“Workflow launch” project",
  },
  {
    id: "fact-skill-systems",
    kind: "skill",
    content:
      "Built and maintained a multi-brand design system (tokens, primitives, documentation) used by four product teams",
    sourceSpan: "“Design system” role",
  },
  {
    id: "fact-skill-figma",
    kind: "skill",
    content: "Figma advanced workflows: variables, component APIs, prototyping",
    sourceSpan: "Skills",
  },
  {
    id: "fact-outcome-activation",
    kind: "outcome",
    content:
      "Redesigned activation and onboarding flows, lifting week-one retention by 14%",
    sourceSpan: "“Activation” project",
  },
  {
    id: "fact-edu-hci",
    kind: "education",
    content: "BSc Human-Computer Interaction",
    sourceSpan: "Education",
  },
];
