/* Munus wordmark — shared brand mark (promoted from app/onboarding after
   wave 1 duplicated it; duplication = foundation signal per protocol). */
export function Wordmark() {
  return (
    <div className="flex items-center gap-[9px] text-[17px] font-[790] tracking-[-0.02em]">
      <span className="relative size-5 -rotate-12">
        <span className="absolute bottom-[5px] left-0 right-[5px] top-0 rounded-[50%_50%_50%_7px] bg-rose" />
        <span className="absolute bottom-0 left-[7px] right-0 top-[6px] rounded-[50%_50%_50%_7px] bg-rose opacity-[0.42]" />
      </span>
      Munus
    </div>
  );
}
