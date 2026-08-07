/**
 * Role catalog for onboarding (founder feedback 2026-08-07: "every possible
 * job on earth" — a wide, grouped, searchable catalog + free-text custom
 * entry). The catalog is intentionally broad; the search filter matches
 * group names, role names, and keywords.
 */

export interface RoleGroup {
  group: string;
  roles: readonly string[];
}

export const ROLE_GROUPS: readonly RoleGroup[] = [
  {
    group: "Engineering",
    roles: [
      "Backend engineer", "Frontend engineer", "Full-stack engineer",
      "Mobile engineer (iOS)", "Mobile engineer (Android)", "Mobile engineer (cross-platform)",
      "Software engineer (general)", "Site reliability engineer", "DevOps engineer",
      "Platform engineer", "Infrastructure engineer", "Cloud engineer",
      "QA engineer", "Test automation engineer", "Security engineer",
      "Data engineer", "Machine learning engineer", "MLOps engineer",
      "Embedded engineer", "Game developer", "Blockchain engineer",
      "Engineering manager", "Technical lead", "Staff engineer",
      "Systems administrator", "Network engineer", "Database administrator",
      "Solutions engineer", "Integration engineer", "Hardware engineer",
      "Release engineer", "Developer advocate", "Technical writer",
    ],
  },
  {
    group: "Data & AI",
    roles: [
      "Data scientist", "Data analyst", "Business intelligence analyst",
      "Data engineer", "Machine learning engineer", "AI engineer",
      "MLOps engineer", "Research scientist (AI/ML)", "Quantitative analyst",
      "Quantitative developer", "Data architect", "Analytics engineer",
      "Statistician", "Data steward", "NLP engineer", "Computer vision engineer",
      "Data product manager", "Decision scientist", "Marketing analyst",
      "Financial analyst", "Operations research analyst",
    ],
  },
  {
    group: "Design",
    roles: [
      "Product designer", "UX/UI designer", "UX researcher", "UI designer",
      "Design lead", "Brand designer", "Visual designer", "Illustrator",
      "Motion designer", "Interaction designer", "Service designer",
      "Design systems designer", "Graphic designer", "Product design manager",
      "Web designer", "3D artist", "Game designer", "Content designer",
    ],
  },
  {
    group: "Product & Project",
    roles: [
      "Product manager", "Product owner", "Associate product manager",
      "Technical product manager", "Project manager", "Program manager",
      "Scrum master", "Delivery manager", "Product analyst", "Product operations",
      "Growth product manager", "AI product manager", "Business analyst",
      "Product marketing manager", "Product lead", "Head of product",
    ],
  },
  {
    group: "Marketing & Growth",
    roles: [
      "Marketing manager", "Growth marketer", "Performance marketer",
      "SEO specialist", "Content marketer", "Social media manager",
      "Email marketing specialist", "Brand manager", "Marketing analyst",
      "Demand generation manager", "Paid media specialist", "ASO specialist",
      "Community manager", "Influencer marketing", "Marketing operations",
      "Copywriter", "Editor", "Lifecycle marketer", "Events manager",
      "Public relations manager", "Communications manager",
    ],
  },
  {
    group: "Sales & Business Development",
    roles: [
      "Account executive", "Sales development representative", "Business development manager",
      "Account manager", "Sales manager", "Customer success manager",
      "Sales engineer", "Partnerships manager", "Key account manager",
      "Inside sales representative", "Sales operations analyst", "Sales director",
      "Pre-sales consultant", "Revenue operations", "Channel manager",
      "Enterprise account executive", "SDR manager",
    ],
  },
  {
    group: "Customer Success & Support",
    roles: [
      "Customer success manager", "Customer support specialist", "Technical support engineer",
      "Support team lead", "Onboarding specialist", "Customer experience manager",
      "Client services manager", "Helpdesk analyst", "Implementation consultant",
    ],
  },
  {
    group: "Finance & Accounting",
    roles: [
      "Financial analyst", "Accountant", "Controller", "Financial controller",
      "FP&A analyst", "Treasury analyst", "Auditor", "Tax specialist",
      "Credit analyst", "Investment analyst", "Payroll specialist",
      "Bookkeeper", "Finance manager", "Risk analyst", "Compliance analyst",
    ],
  },
  {
    group: "People & HR",
    roles: [
      "HR generalist", "HR business partner", "Recruiter", "Talent acquisition specialist",
      "People operations", "Payroll specialist", "Learning & development specialist",
      "Talent development manager", "HR coordinator", "Employer branding specialist",
      "People partner", "Compensation & benefits analyst",
    ],
  },
  {
    group: "Operations & Administration",
    roles: [
      "Operations manager", "Operations associate", "Office manager", "Executive assistant",
      "Administrative assistant", "Logistics coordinator", "Supply chain analyst",
      "Procurement specialist", "Business operations manager", "Facilities manager",
      "Project coordinator", "Data entry specialist", "Travel operations",
    ],
  },
  {
    group: "Legal & Compliance",
    roles: [
      "Lawyer", "Legal counsel", "Paralegal", "Compliance officer",
      "Data protection officer", "Privacy analyst", "Contract manager",
      "Legal operations", "AML analyst", "Regulatory affairs specialist",
    ],
  },
  {
    group: "Healthcare, Science & Other",
    roles: [
      "Medical writer", "Clinical research associate", "Biostatistician",
      "Research assistant", "Laboratory technician", "Pharmacovigilance specialist",
      "Researcher", "Scientist", "Economist", "Policy analyst",
      "Translator", "Interpreter", "Architect", "Civil engineer",
      "Teacher", "Lecturer", "Journalist", "Photographer", "Video editor",
    ],
  },
];

/** Flattened unique role names (for validation + type-safety). */
export const ALL_ROLES: readonly string[] = [
  ...new Set(ROLE_GROUPS.flatMap((g) => g.roles)),
];

/** Case-insensitive search across group + role names. */
export function searchRoles(query: string): RoleGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...ROLE_GROUPS];
  return ROLE_GROUPS.map((g) => ({
    group: g.group,
    roles: g.roles.filter(
      (r) => r.toLowerCase().includes(q) || g.group.toLowerCase().includes(q),
    ),
  })).filter((g) => g.roles.length > 0);
}
