/* Privacy policy — Wave 5 slice C (FEATURES D21: real accounts hold real
   CVs, so this is written to be true the moment sign-in ships, not a
   post-launch afterthought). Every claim below maps to a CONTRACTS §2 table
   (profiles/facts/jobs/decisions/documents/applications/usage) and to a
   §3 invariant (evidence-only AI, redirect-apply — Munus never submits to
   employers). Static content, no store/network dependency — see final
   report for why loading/empty/error states don't apply here. */

import Link from "next/link";
import { Topbar } from "@/components/ui/Topbar";
import {
  DraftBanner,
  LastUpdated,
  LegalCallout,
  LegalSection,
  LegalTOC,
  Placeholder,
} from "../legal-shared";

const TOC = [
  { id: "what-we-collect", label: "What we collect and why" },
  { id: "legal-basis", label: "Legal basis for processing" },
  { id: "never-to-employers", label: "We never send your data to employers" },
  { id: "processors", label: "Who processes your data" },
  { id: "international-transfers", label: "International data transfers" },
  { id: "retention", label: "How long we keep your data" },
  { id: "your-rights", label: "Your rights under GDPR" },
  { id: "cookies-analytics", label: "Cookies and analytics" },
  { id: "security", label: "Security" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact and complaints" },
];

export default function PrivacyPage() {
  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title="Privacy policy" backHref="/profile" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-2">
        <DraftBanner />
        <LastUpdated date="25 July 2026" />
        <LegalTOC items={TOC} />

        <LegalSection id="what-we-collect" title="1. What we collect, and why">
          <p>
            <strong>Account identity.</strong> Your name and email, from
            Google sign-in. We need this to create your account and let you
            sign back in.{" "}
            <em>Basis: performing our contract with you.</em>
          </p>
          <p>
            <strong>Job search preferences.</strong> The role, seniority
            level, locations, remote preference, and minimum salary you set
            during onboarding, plus whether you want job alerts. We need the
            preferences to rank and filter jobs for you.{" "}
            <em>
              Basis: performing our contract with you (preferences) and your
              consent (alerts specifically — you can turn them off any time
              without affecting the rest of your account).
            </em>
          </p>
          <p>
            <strong>Your CV file.</strong> The document you upload. We need
            it as the source we parse into the facts described next.{" "}
            <em>
              Basis: your consent — uploading a CV is an action you take, not
              something we require to create an account.
            </em>
          </p>
          <p>
            <strong>Facts extracted from your CV.</strong> Structured roles,
            skills, education, and outcomes, each kept with the exact span of
            your CV it came from. This is the evidence store our matching and
            document-tailoring features run on, and keeping the source span
            is what lets us show you where a claim came from and delete it
            precisely.{" "}
            <em>Basis: your consent (this flows from the CV consent above).</em>
          </p>
          <p>
            <strong>Swipe decisions.</strong> Every save, pass, star, and
            undo, and when you made it. This builds your Favorites list and
            feeds the &ldquo;why this match&rdquo; reasoning you see on a job.{" "}
            <em>Basis: performing our contract with you.</em>
          </p>
          <p>
            <strong>Generated documents.</strong> The tailored CV and cover
            letter content we draft for a job, which suggestions you
            accepted, your tone choice, and the exported PDF.{" "}
            <em>
              Basis: performing our contract with you — you asked us to
              prepare these, and they&rsquo;re built only from facts collected
              under your consent above.
            </em>
          </p>
          <p>
            <strong>Application records.</strong> Which job, the status
            (prepared, opened listing, confirmed applied), and a snapshot of
            the documents used, kept as a receipt.{" "}
            <em>Basis: performing our contract with you.</em>
          </p>
          <p>
            <strong>Usage counters.</strong> How many swipes you&rsquo;ve
            made this week and how many documents you&rsquo;ve generated
            today — nothing about their content, just the counts.{" "}
            <em>
              Basis: our legitimate interest in enforcing free-tier and
              fair-use limits on our servers, so no account can exhaust our
              shared AI budget for everyone else. You can object — see{" "}
              <a href="#your-rights">Your rights</a>.
            </em>
          </p>
        </LegalSection>

        <LegalSection id="legal-basis" title="2. Legal basis for processing, in one place">
          <ul>
            <li>
              <strong>Contract performance</strong> covers most of the data
              above: we can&rsquo;t run your account, matching, swiping,
              document studio, or application tracking without it — it&rsquo;s
              the minimum needed to give you the service you signed up for.
            </li>
            <li>
              <strong>Consent</strong> covers your CV upload and everything
              derived from it (facts), plus job alerts specifically. You can
              withdraw this at any time — delete your CV or facts, or turn
              off alerts — without closing your account.
            </li>
            <li>
              <strong>Legitimate interest</strong> covers only the usage
              counters, to keep the free tier and fair-use limits honest.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="never-to-employers" title="3. We never send your data to employers">
          <LegalCallout>
            Munus never transmits your CV, letter, or profile data to an
            employer&rsquo;s system, and no employer can query us for your
            data. &ldquo;Open official application&rdquo; hands you off to
            the employer&rsquo;s own listing — you fill in and submit their
            form yourself. &ldquo;Confirmed applied&rdquo; is your own answer
            to our question afterward, not a signal we received from the
            employer.
          </LegalCallout>
        </LegalSection>

        <LegalSection id="processors" title="4. Who processes your data (our subprocessors)">
          <ul>
            <li>
              <strong>Supabase</strong> — hosting, authentication, database,
              and file storage, in an EU region. Everything described in
              section 1 lives here.
            </li>
            <li>
              <strong>Groq</strong> — runs CV parsing, job-match reasoning,
              and document tailoring. We send it your CV facts and the text
              of the specific job description being matched or tailored to —
              never your name, email, or account credentials.
            </li>
            <li>
              <strong>PostHog (EU Cloud)</strong> — product analytics, see{" "}
              <a href="#cookies-analytics">Cookies and analytics</a> below.
              Hosted in the EU.
            </li>
            <li>
              <strong>Stripe — not yet active.</strong> Paid plans
              aren&rsquo;t live (see our{" "}
              <Link href="/terms">Terms of Service</Link>); we don&rsquo;t
              collect card details or send anything to Stripe today. When
              Plus billing ships, this section will be updated before a
              single payment is taken.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="international-transfers" title="5. International data transfers">
          <p>
            Supabase&rsquo;s and Groq&rsquo;s operating companies are
            US-headquartered, even though the servers we use for Supabase are
            in the EU. Where a transfer of your data outside the EEA happens,
            we rely on Standard Contractual Clauses with each processor.{" "}
            <Placeholder>
              founder to confirm and attach the signed Supabase and Groq DPAs
              / SCCs before launch
            </Placeholder>
            . PostHog&rsquo;s EU Cloud keeps analytics data in the EU, so no
            transfer applies there.
          </p>
        </LegalSection>

        <LegalSection id="retention" title="6. How long we keep your data">
          <ul>
            <li>
              Facts and your CV — kept until you delete that fact, remove
              your CV, or delete your account.
            </li>
            <li>
              Generated documents — kept until you delete them or your
              account.
            </li>
            <li>
              Swipe decisions — kept while your account is active (they power
              Favorites and match reasoning); removed with the account.
            </li>
            <li>
              Application records — kept as your own permanent record of what
              you submitted and when, like a sent-mail folder; removed if you
              delete that record or your account.{" "}
              <Placeholder>
                founder to set a minimum retention window, if any, for abuse
                or fraud logs
              </Placeholder>
              .
            </li>
            <li>
              Usage counters — short-lived by design: swipe counts reset
              weekly, generation counts reset daily.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="your-rights" title="7. Your rights under GDPR">
          <ol>
            <li>
              <strong>Access and export.</strong> Get a copy of everything we
              hold on you. How: email{" "}
              <Placeholder>founder to add: privacy contact email</Placeholder>
              ; a self-serve export in Settings is part of this same build
              and will supersede the email request once it ships.
            </li>
            <li>
              <strong>Rectification.</strong> Fix something that&rsquo;s
              wrong. How: edit onboarding answers or an individual fact
              yourself in-app, or re-upload your CV; email the address above
              for anything you can&rsquo;t reach yourself.
            </li>
            <li>
              <strong>Erasure.</strong> Delete your account and everything
              tied to it. How: a self-serve delete control is part of this
              build; until it ships, email the address above and we will
              delete your profile, facts, documents, and decisions within{" "}
              <Placeholder>founder to set a response window, e.g. 30 days</Placeholder>
              .
            </li>
            <li>
              <strong>Portability.</strong> Take your data elsewhere. How:
              the same export mechanism as Access, delivered as structured,
              machine-readable data.
            </li>
            <li>
              <strong>Objection / withdraw consent.</strong> Stop a specific
              use without deleting your whole account. How: remove your CV
              or turn off alerts yourself; email the address above to object
              to anything else, including usage-counter processing — note
              that objecting to metering may mean we can no longer offer you
              the feature it protects.
            </li>
            <li>
              <strong>Complain to a regulator.</strong> You can complain to
              your national data protection authority instead of, or as well
              as, contacting us.{" "}
              <Placeholder>
                founder to name our lead supervisory authority once the
                company&rsquo;s home country is set
              </Placeholder>
              .
            </li>
          </ol>
        </LegalSection>

        <LegalSection id="cookies-analytics" title="8. Cookies and analytics">
          <p>
            We use PostHog, on their EU Cloud, for product analytics — which
            screens get used, where people drop off, what breaks. It runs
            cookie-less: no tracking cookie is set in your browser and no
            cross-site identifier follows you elsewhere. Events are only tied
            to your account after you&rsquo;ve signed in; before that
            they&rsquo;re anonymous. Because we don&rsquo;t set a cookie for
            this, this page doesn&rsquo;t carry a cookie-consent banner — if
            that ever changes, we&rsquo;ll add one and update this section
            first.
          </p>
        </LegalSection>

        <LegalSection id="security" title="9. Security">
          <p>
            Every table in our database has row-level security turned on, so
            the only account that can read your profile, facts, decisions,
            documents, or applications is your own signed-in session; the
            backend workers that ingest jobs and run scheduled tasks use a
            separate key your session never sees. That&rsquo;s the specific
            control in place today, not a promise that nothing can go wrong.
          </p>
        </LegalSection>

        <LegalSection id="changes" title="10. Changes to this policy">
          <p>
            We&rsquo;ll update the &ldquo;Last updated&rdquo; date above
            whenever this changes, and post an in-app notice for any change
            that meaningfully affects what we collect or who we share it
            with.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="11. Contact and complaints">
          <p>
            Questions, requests, or complaints about this policy: email{" "}
            <Placeholder>founder to add: privacy contact email</Placeholder>.
          </p>
          <p>
            Legal entity and registered address:{" "}
            <Placeholder>
              founder to add: legal entity name and registered address
            </Placeholder>
            . Company registration number:{" "}
            <Placeholder>
              founder to add: registration number, once incorporated
            </Placeholder>
            .
          </p>
        </LegalSection>
      </div>
    </section>
  );
}
