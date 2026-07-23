/* Terms — DRAFT stub. Static content only; no store/network dependency, so
   no loading/error state applies (see privacy/page.tsx for the same note). */

import { Topbar } from "@/components/ui/Topbar";
import { DraftBanner, LegalSection } from "../legal-shared";

export default function TermsPage() {
  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title="Terms of service" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-2">
        <DraftBanner />
        <LegalSection title="The service">
          Munus surfaces fresh roles and helps you prepare an honest,
          evidence-based application; you always review and submit it
          yourself on the employer&rsquo;s own listing — we never submit on
          your behalf on Free or Plus.
        </LegalSection>
        <LegalSection title="Accounts">
          You need an account to save roles, generate documents, or apply;
          you are responsible for keeping your login secure.
        </LegalSection>
        <LegalSection title="Evidence store">
          Documents we generate are built only from facts you gave us and the
          job description — nothing is invented, and unverifiable claims are
          dropped before you ever see them.
        </LegalSection>
        <LegalSection title="Subscriptions and payments">
          Plus is a recurring subscription billed by Stripe that you can
          cancel any time; Pro (automated applying) is waitlist-only until it
          ships.
        </LegalSection>
        <LegalSection title="Acceptable use and termination">
          Automated scraping of our deck, credential sharing, and abuse of
          fair-use limits are grounds for suspension; we will detail the full
          policy before launch.
        </LegalSection>
        <LegalSection title="Contact">
          A dedicated legal contact address will be published here before
          launch.
        </LegalSection>
      </div>
    </section>
  );
}
