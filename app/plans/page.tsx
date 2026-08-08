"use client";

/* Plans — prototype renderPlans(), pixel-matched per CONTRACTS §4. Rendered
   WITHOUT the tabbar (route lives outside the (tabs) group) with a Topbar
   back to /discover. Pricing is verbatim from FEATURES.md D9; Pro is a
   waitlist button per D5/D8 — never checkout. */

import Link from "next/link";
import { Topbar } from "@/components/ui/Topbar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { PlanCard } from "./PlanCard";

export default function PlansPage() {
  const { showToast } = useToast();

  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title="Plans" backHref="/discover" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10">
        <div className="pb-[18px] pt-2.5">
          <h1 className="m-0 text-[34px] tracking-[-0.055em]">Simple plans</h1>
          <p className="mt-[5px] text-xs text-muted">
            Three brackets, one number each. Cancel or pause the moment you are
            hired.
          </p>
        </div>

        <PlanCard
          name="Free"
          price="€0"
          sub="Taste it — no card, no catch"
          features={[
            { mark: "✓", text: "20 swipes per week" },
            {
              mark: "✓",
              text: "Free tailored CV + letter on every saved job",
            },
            {
              mark: "✓",
              text: "2 AI polish tries per job · typing always free",
            },
            { mark: "✓", text: "Apply via the official listing" },
            { mark: "—", text: "Automated applying", na: true },
          ]}
        />

        <PlanCard
          name="Plus"
          price="€14.99"
          period="/month"
          sub='"Stop slowing me down" · €6.99/week · €34.99/quarter'
          featured
          flag="Most popular"
          features={[
            { mark: "✓", text: <strong>Unlimited swipes</strong> },
            {
              mark: "✓",
              text: (
                <>
                  <strong>Unlimited AI tries</strong> on every job
                </>
              ),
            },
            { mark: "✓", text: "Everything in Free" },
            { mark: "—", text: "Automated applying", na: true },
          ]}
          action={
            <Button
              variant="primary"
              onClick={() => showToast("Stripe checkout arrives in W5")}
            >
              Get Plus
            </Button>
          }
        />

        <PlanCard
          name="Pro"
          price="€34.99"
          period="/month"
          sub='"Apply while I sleep" · €12.99/week · €79.99/quarter'
          features={[
            { mark: "✓", text: "Everything in Plus" },
            {
              mark: "✓",
              text: (
                <>
                  <strong>Automated applying — up to 1,000/month</strong>, no
                  daily cap
                </>
              ),
            },
            {
              mark: "✓",
              text: "Human-paced submissions protect your accounts",
            },
            {
              mark: "✓",
              text: "Receipt for every application: exact documents sent",
            },
          ]}
          action={
            <Button
              variant="dark"
              onClick={() =>
                showToast(
                  "Waitlist opens before launch — nothing is saved yet",
                )
              }
            >
              Join the Pro waitlist
            </Button>
          }
        />

        <p className="m-0 text-left text-[10px] leading-[1.35] text-muted">
          Fair use applies to unlimited features: limits are set far above any
          human job hunt and exist only to stop scripts. Same price for
          everyone in the same country — no personal pricing, ever.
        </p>
        <p className="mb-0 mt-3 text-left text-[10px] text-muted">
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>
        </p>
      </div>
    </section>
  );
}
