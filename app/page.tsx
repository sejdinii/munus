import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

/* Welcome — prototype screen 01, pink theme (orbit art hidden per theme
   override). Guest preview kept per FEATURES.md D16. */


export default function WelcomePage() {
  return (
    <section className="screen-in flex flex-1 flex-col justify-between bg-paper px-[27px] pb-[30px] pt-[46px]">
      <Wordmark />
      <div className="mb-[50px] mt-auto">
        <p className="mb-2 text-[11px] font-[760] uppercase tracking-[0.1em] text-rose-ink">
          Your job search, focused
        </p>
        <h1 className="m-0 max-w-[315px] text-[49px] leading-[0.98] tracking-[-0.065em]">
          Find the roles worth <em className="not-italic text-rose">your time.</em>
        </h1>
        <p className="mt-5 max-w-[303px] text-base leading-[1.45] text-muted">
          Fresh jobs from company sites and overlooked boards, ranked around the
          work you actually want.
        </p>
      </div>
      <div>
        <p className="mb-3.5 flex items-center gap-2 text-xs text-muted">
          <span className="grid size-[21px] place-items-center rounded-[7px] bg-rose-soft text-rose-ink">
            ✓
          </span>
          <span>You review every application before it is sent</span>
        </p>
        <div className="grid gap-[9px]">
          <Link
            href="/onboarding"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[15px] border border-rose bg-rose px-[18px] font-[710] text-white transition-transform hover:-translate-y-px"
          >
            Build my job profile
          </Link>
          <Link
            href="/discover"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[15px] border border-transparent bg-transparent px-[18px] font-[710]"
          >
            Preview with sample data
          </Link>
        </div>
      </div>
    </section>
  );
}
