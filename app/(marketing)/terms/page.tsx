/* Terms of service — Wave 5 slice C (FEATURES D21). Mirrors CONTRACTS §3
   invariants precisely: evidence-only AI (reframes verified facts, never
   invents), redirect-apply (Munus never submits to employers), and the
   current mock-payments state (Stripe/checkout is not live — D21 explicitly
   keeps that a mock while everything else goes real). Static content, no
   store/network dependency — see final report for why loading/empty/error
   states don't apply here. */

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
  { id: "what-munus-is", label: "What Munus is" },
  { id: "what-munus-is-not", label: "What Munus is not" },
  { id: "evidence-only", label: "The evidence-only guarantee" },
  { id: "redirect-apply", label: "You apply — we never do" },
  { id: "accounts", label: "Accounts" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "plans-billing", label: "Plans and billing (current status)" },
  { id: "termination", label: "Suspension and termination" },
  { id: "liability", label: "Disclaimers and liability" },
  { id: "governing-law", label: "Governing law" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title="Terms of service" backHref="/profile" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-2">
        <DraftBanner />
        <LastUpdated date="25 July 2026" />
        <LegalTOC items={TOC} />

        <LegalSection id="what-munus-is" title="1. What Munus is">
          <p>
            Munus is a job-discovery tool. We pull fresh roles directly from
            employers&rsquo; own applicant-tracking systems (Greenhouse,
            Lever, Ashby, Workable, SmartRecruiters — public, structured job
            feeds, not scraped web pages), rank them against the preferences
            and evidence you give us, and help you prepare an honest,
            evidence-based CV and cover letter for a specific job. When
            you&rsquo;re ready, we hand you off to the employer&rsquo;s own
            application page to submit it yourself.
          </p>
        </LegalSection>

        <LegalSection id="what-munus-is-not" title="2. What Munus is not">
          <ul>
            <li>
              We do not submit applications on your behalf, on any plan.
              Every application is submitted by you, on the employer&rsquo;s
              own site.
            </li>
            <li>
              We do not guarantee an interview, an offer, or any hiring
              outcome — matching is a ranking, not a promise.
            </li>
            <li>
              We are not a recruitment or staffing agency. We have no
              relationship with the employers whose jobs we list beyond
              reading their public job-feed APIs; we do not represent you to
              them, and they do not pay us to place you.
            </li>
            <li>
              We are not a substitute for legal, career, or immigration
              advice.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="evidence-only" title="3. The evidence-only guarantee">
          <p>
            Every suggestion the AI writes for your CV or letter is built
            from exactly two inputs: the facts you&rsquo;ve given us (parsed
            from your CV, or added by hand) and the description of the
            specific job you&rsquo;re applying to — nothing else. A verifier
            step checks every claim against your fact store before you ever
            see it; anything it can&rsquo;t match to one of your facts is
            dropped and logged, not shown. Nothing is invented on your
            behalf.
          </p>
          <p>
            You still review and explicitly accept or keep every suggested
            change yourself — nothing is added to your documents without
            your action. Once you submit an application, you&rsquo;re
            responsible for its accuracy and content: Munus checks that the
            wording traces back to a fact you gave us, not that the
            underlying fact itself is true. Don&rsquo;t tell us things that
            aren&rsquo;t true.
          </p>
        </LegalSection>

        <LegalSection id="redirect-apply" title="4. You apply — we never do">
          <LegalCallout>
            Munus never transmits your documents or profile to an
            employer&rsquo;s system. &ldquo;Open official application&rdquo;
            sends you to the employer&rsquo;s own listing, where you fill in
            and submit their form. Afterwards we ask &ldquo;Did you
            apply?&rdquo; and record your own answer.
          </LegalCallout>
          <p>
            The states you&rsquo;ll see are{" "}
            <strong>Prepared → Opened listing → Confirmed applied</strong>,
            based on what you tell us, not on any confirmation from the
            employer. If a listing goes offline, we mark it closed and stop
            showing it, but we don&rsquo;t chase or verify your application
            with the employer in any way. See our{" "}
            <Link href="/privacy">Privacy Policy</Link> for what we collect
            around this.
          </p>
        </LegalSection>

        <LegalSection id="accounts" title="5. Accounts">
          <p>
            You need an account, created via Google sign-in, to save jobs,
            generate documents, or apply. You&rsquo;re responsible for
            keeping that account secure and for everything that happens
            under it. One account is for one person — don&rsquo;t share
            credentials to get around usage limits.
          </p>
        </LegalSection>

        <LegalSection id="acceptable-use" title="6. Acceptable use">
          <ul>
            <li>
              No scraping, crawling, or automated bulk extraction of our job
              listings, matches, or generated content.
            </li>
            <li>
              No bots or scripts that swipe, generate, or apply faster than a
              person could, or that exist to route around the fair-use
              limits below.
            </li>
            <li>
              No reselling or redistributing job data, match reasoning, or
              generated documents in bulk.
            </li>
            <li>
              Free accounts get 20 swipes a week, plus a free tailored
              CV/letter kit for the first job you save and 2 more AI tries on
              that job afterward. These limits are enforced on our servers,
              not just suggested in the interface, and we can suspend
              accounts that try to bypass them.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="plans-billing" title="7. Plans and billing (current status)">
          <p>
            Today, Munus is free to use within the limits above. Plus and
            the automated &ldquo;Pro&rdquo; tier are shown on our Plans
            screen for transparency about where we&rsquo;re headed, but{" "}
            <strong>paid plans are not yet available</strong>: we do not
            collect payment details, we do not charge anyone, and
            &ldquo;upgrade&rdquo; actions currently only preview what&rsquo;s
            coming. When Plus billing goes live, we&rsquo;ll add Stripe as
            our payment processor, publish real pricing, cancellation, and
            refund terms here, and no one will be charged without a clear
            checkout step. Joining the Pro waitlist creates no payment
            obligation.
          </p>
        </LegalSection>

        <LegalSection id="termination" title="8. Suspension and termination">
          <p>
            You can delete your account at any time — see our{" "}
            <Link href="/privacy">Privacy Policy</Link> for what happens to
            your data when you do. We can suspend or terminate an account
            that violates the acceptable-use rules above, attempts to
            scrape or abuse the service, or otherwise puts the service or
            other users at risk; we&rsquo;ll try to tell you why.
          </p>
        </LegalSection>

        <LegalSection id="liability" title="9. Disclaimers and liability">
          <p>
            Munus surfaces job listings and drafts documents based on
            information you provide. We can&rsquo;t and don&rsquo;t
            guarantee that any listing is accurate, still open, or leads
            anywhere, and we aren&rsquo;t a party to your employment
            relationship with any employer. To the fullest extent the law
            allows, Munus is provided &ldquo;as is,&rdquo; and we
            aren&rsquo;t liable for hiring decisions, interview outcomes,
            job-listing accuracy, or anything that happens after you leave
            our site to apply.
          </p>
          <p>
            <Placeholder>
              founder and lawyer to set an actual liability cap and any
              carve-outs before launch — a specific figure needs to replace
              this placeholder, not another general sentence
            </Placeholder>
            .
          </p>
        </LegalSection>

        <LegalSection id="governing-law" title="10. Governing law">
          <p>
            These terms are governed by the laws of{" "}
            <Placeholder>
              founder to set: governing law and jurisdiction
            </Placeholder>
            , and any dispute will be handled in the courts of{" "}
            <Placeholder>
              founder to set: courts / venue
            </Placeholder>{" "}
            — to be finalized with legal counsel before launch.
          </p>
        </LegalSection>

        <LegalSection id="changes" title="11. Changes to these terms">
          <p>
            If we materially change these terms, we&rsquo;ll update the date
            above and show an in-app notice; continuing to use Munus after
            that counts as accepting the update. If you don&rsquo;t agree,
            you can delete your account instead.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="12. Contact">
          <p>
            Questions about these terms: email{" "}
            <Placeholder>founder to add: legal contact email</Placeholder>.
            Legal entity and registered address:{" "}
            <Placeholder>
              founder to add: legal entity name and registered address
            </Placeholder>
            .
          </p>
        </LegalSection>
      </div>
    </section>
  );
}
