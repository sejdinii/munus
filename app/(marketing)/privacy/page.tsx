/* Privacy — DRAFT stub. Static content only; no store/network dependency,
   so no loading/error state applies (CLAUDE.md's states rule targets
   screens with async data — this one has none, see final report). */

import { Topbar } from "@/components/ui/Topbar";
import { DraftBanner, LegalSection } from "../legal-shared";

export default function PrivacyPage() {
  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title="Privacy policy" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-2">
        <DraftBanner />
        <LegalSection title="Data we store">
          We store your account details, onboarding answers, and the facts
          extracted from your CV so we can match you to roles and tailor
          applications on your behalf.
        </LegalSection>
        <LegalSection title="Evidence store">
          Every fact used to write a CV or letter is kept with a record of
          where it came from, so we can show you the source of any claim and
          delete it precisely if you ask.
        </LegalSection>
        <LegalSection title="GDPR: export and delete">
          You will be able to export a full copy of your data or permanently
          delete your account from Settings; that mechanism is not built yet
          — it ships in Wave 5.
        </LegalSection>
        <LegalSection title="Payments">
          Plus and Pro payments are processed by Stripe; we do not store your
          card details ourselves.
        </LegalSection>
        <LegalSection title="Contact">
          A dedicated privacy contact address will be published here before
          launch.
        </LegalSection>
      </div>
    </section>
  );
}
