import { getSessionUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Wordmark } from "@/components/ui/screen";
import { GroundingNote } from "@/components/ui/states";

// Landing (/) — Persuade surface. Composition per BACKLOG design intel
// 2026-08-08 landing research: color-as-dominant-field hero (Preply/Chatbase),
// collapsed nav, benefit-first H1, sequence-earning step numbers, the
// differentiator as its own section naming the failure mode we don't have,
// honest pricing (user decision), no fake counters or logo walls.

const PLANS = [
  {
    name: "Free",
    price: "€0",
    sub: "Taste it — no card, no catch",
    featured: false,
    cta: { label: "Start free", href: "/sign-in", variant: "outline" as const },
    features: [
      { text: "20 swipes per week", included: true },
      { text: "Free tailored CV + letter on every saved job", included: true },
      { text: "2 AI polish tries per job · typing always free", included: true },
      { text: "Apply via the official listing", included: true },
      { text: "Automated applying", included: false },
    ],
  },
  {
    name: "Plus",
    price: "€14.99",
    priceNote: "/month",
    sub: "€6.99/week · €34.99/quarter",
    featured: true,
    cta: { label: "Start free, upgrade in-app", href: "/sign-in", variant: "primary" as const },
    features: [
      { text: "Unlimited swipes", included: true },
      { text: "Unlimited AI tries on every job", included: true },
      { text: "Everything in Free", included: true },
      { text: "Automated applying", included: false },
    ],
  },
  {
    name: "Pro",
    price: "€34.99",
    priceNote: "/month",
    sub: "Ships after launch",
    featured: false,
    cta: null,
    features: [
      { text: "Everything in Plus", included: true },
      { text: "Automated applying — up to 1,000/month", included: true },
      { text: "Human-paced submissions protect your accounts", included: true },
      { text: "Receipt for every application: exact documents sent", included: true },
    ],
  },
];

function CheckIco({ muted }: { muted?: boolean }) {
  return (
    <span className="feat-ico" aria-hidden="true">
      {muted ? "—" : <Icon name="check" size={12} />}
    </span>
  );
}

export default async function LandingPage() {
  const user = await getSessionUser();
  const appHref = user
    ? (await store.getCvMeta(user.id).catch(() => null))
      ? "/profile/facts"
      : "/onboarding"
    : "/sign-in";
  const ctaLabel = user ? "Open Scout" : "Start free";

  return (
    <main className="landing">
      <nav className="landing-nav" aria-label="Main">
        <Wordmark />
        <div className="nav-actions">
          {!user ? (
            <ButtonLink size="sm" variant="plain" href="/sign-in">
              Sign in
            </ButtonLink>
          ) : null}
          <ButtonLink size="sm" variant="primary" href={appHref}>
            {ctaLabel}
          </ButtonLink>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-grid">
          <div>
            <span className="eyebrow-pill liquid-glass">
              <i aria-hidden="true" />
              Early access · designers first
            </span>
            <h1>
              Find the roles worth <em>your time.</em>
            </h1>
            <p className="hero-sub">
              Scout pulls fresh jobs straight from company career sites, ranks
              them around the work you actually want, and tailors your
              applications without ever inventing a word.
            </p>
            <div className="hero-cta-row">
              <ButtonLink variant="primary" href={appHref}>
                {ctaLabel}
              </ButtonLink>
              <span className="hero-links">
                <a href="#how">How it works</a>
                <a href="#pricing">Pricing</a>
              </span>
            </div>
          </div>
          <div className="mock-phone" aria-hidden="true">
            <div className="mock-card liquid-glass-selected">
              <div className="mock-card-top">
                <span className="source-pill">
                  <i />
                  Company careers · verified 18 min ago
                </span>
                <span className="mock-monogram">N</span>
              </div>
              <div className="mock-card-body">
                <p className="job-company">Northstar</p>
                <h3 className="job-title">Senior Product Designer</h3>
                <div className="mock-meta">
                  <span className="meta-chip">Remote · Europe</span>
                  <span className="meta-chip">€72–88k</span>
                </div>
                <div className="fit-mini">
                  <div className="fit-head">
                    <span>Evidence match</span>
                    <span className="fit-score">92%</span>
                  </div>
                  <div className="fit-bar">
                    <span style={{ width: "92%" }} />
                  </div>
                  <div className="fact-row">
                    <span className="fact-dot">
                      <Icon name="check" size={10} />
                    </span>
                    <span>Your 6 years in SaaS exceeds the 5-year requirement</span>
                  </div>
                  <div className="fact-row">
                    <span className="fact-dot">
                      <Icon name="check" size={10} />
                    </span>
                    <span>Figma, discovery, and design systems match</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mock-actions">
              <span className="liquid-glass">
                <Icon name="x" size={16} />
              </span>
              <span className="save liquid-glass-selected">
                <Icon name="heart" size={16} />
              </span>
              <span className="liquid-glass">
                <Icon name="star" size={16} />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="section-inner">
          <h2>Three steps. No spray-and-pray.</h2>
          <p className="section-lead">
            Scout is built for people who apply deliberately — and are tired of
            job boards reselling stale listings.
          </p>
          <div className="step-grid">
            <div className="step-card liquid-glass">
              <span className="step-no">1</span>
              <h3>Your CV becomes evidence</h3>
              <p>
                Upload once. Scout extracts your verified facts — roles,
                outcomes, skills — and shows you exactly what it found.
              </p>
            </div>
            <div className="step-card liquid-glass">
              <span className="step-no">2</span>
              <h3>Swipe roles that are actually fresh</h3>
              <p>
                Jobs come straight from company ATS feeds, verified minutes
                ago, ranked with reasons you can check — and one honest concern.
              </p>
            </div>
            <div className="step-card liquid-glass">
              <span className="step-no">3</span>
              <h3>Apply with documents you approved</h3>
              <p>
                An evidence-checked CV and letter, reviewed by you, submitted
                via the official listing. Scout keeps the receipt forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-band">
        <div className="trust-grid">
          <div>
            <h2>AI may reframe. It may never invent.</h2>
            <p className="section-lead" style={{ marginBottom: 0 }}>
              Every suggestion Scout makes maps to a fact from your CV. Claims
              without evidence are dropped by a blocking verifier — not
              flagged, dropped.
            </p>
            <div className="trust-points">
              <div className="fact-row">
                <span className="fact-dot">
                  <Icon name="check" size={11} />
                </span>
                <span>Your CV is the only source the AI may work from.</span>
              </div>
              <div className="fact-row">
                <span className="fact-dot">
                  <Icon name="check" size={11} />
                </span>
                <span>
                  You read every word before anything reaches an employer.
                </span>
              </div>
              <div className="fact-row">
                <span className="fact-dot">
                  <Icon name="check" size={11} />
                </span>
                <span>
                  Salary shown when listed — never silently estimated.
                </span>
              </div>
            </div>
            <p className="no-bot-line">
              Scout is not an auto-applier. It never submits a single
              application on your behalf without your review — automation, when
              it ships, stays under the same rule.
            </p>
          </div>
          <div className="evidence-mock liquid-glass" aria-hidden="true">
            <GroundingNote>
              <strong>Evidence-only mode is on.</strong>
              <br />
              Scout can sharpen wording and emphasis, but cannot add skills or
              outcomes missing from your career profile.
            </GroundingNote>
            <div className="fact-row">
              <span className="fact-dot">
                <Icon name="check" size={11} />
              </span>
              <span>
                Led discovery and end-to-end design for a new workflow product
                <span className="fact-source">from “Workflow launch” project</span>
              </span>
            </div>
            <div className="fact-row">
              <span className="fact-dot">
                <Icon name="check" size={11} />
              </span>
              <span>
                Built the company design system used by 4 product teams
                <span className="fact-source">from “Design system” role</span>
              </span>
            </div>
            <div className="fact-row">
              <span className="fact-dot">
                <Icon name="check" size={11} />
              </span>
              <span>
                Ran 40+ user interviews across three release cycles
                <span className="fact-source">from “Research practice” bullet</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="section-inner">
          <h2>Same price for everyone. No personal pricing, ever.</h2>
          <p className="section-lead">
            Three brackets, one number each. Cancel or pause the moment you are
            hired. Fair-use limits sit far above any human job hunt — they
            exist only to stop scripts.
          </p>
          <div className="plan-grid">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={plan.featured ? "plan-card featured liquid-glass-selected" : "plan-card liquid-glass"}
              >
                {plan.featured ? <span className="plan-flag">Most popular</span> : null}
                <div className="plan-head">
                  <h3>{plan.name}</h3>
                  <span className="plan-price">
                    {plan.price}
                    {plan.priceNote ? <small> {plan.priceNote}</small> : null}
                  </span>
                </div>
                <p className="plan-sub">{plan.sub}</p>
                <ul className="plan-feats">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className={feature.included ? "" : "na"}>
                      <CheckIco muted={!feature.included} />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                {plan.cta ? (
                  <ButtonLink variant={plan.cta.variant} href={plan.cta.href}>
                    {plan.cta.label}
                  </ButtonLink>
                ) : (
                  <p className="plan-sub" style={{ marginTop: 16, marginBottom: 0 }}>
                    Joins the lineup once Plus has earned its keep.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <Wordmark />
        <span>Your job search, focused. Privacy policy and terms publish with public launch.</span>
        <span>© 2026 Scout</span>
      </footer>
    </main>
  );
}
