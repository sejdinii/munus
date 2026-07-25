"use client";

/* The five-button action row under the deck — prototype .deck-actions with
   the pink-theme save override (solid rose, white heart). Buttons are the
   swipe-free path: full parity, always available. */

import {
  HeartIcon,
  InfoIcon,
  StarIcon,
  UndoIcon,
  XIcon,
} from "@/components/ui/icons";

function RoundAction({
  label,
  onClick,
  disabled = false,
  large = false,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  large?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid place-items-center rounded-full border border-line bg-paper shadow-[0_5px_13px_rgba(31,32,38,0.07)] disabled:opacity-[.32] disabled:shadow-none ${
        large ? "size-14" : "size-[46px]"
      } [&_svg]:size-[22px] ${className}`}
    >
      {children}
    </button>
  );
}

export function DeckActions({
  canUndo,
  disabledAll = false,
  onUndo,
  onPass,
  onStar,
  onSave,
  onInfo,
}: {
  canUndo: boolean;
  /** Coach overlay open: nothing under it may act (critic W2 finding 7). */
  disabledAll?: boolean;
  onUndo: () => void;
  onPass: () => void;
  onStar: () => void;
  onSave: () => void;
  onInfo: () => void;
}) {
  return (
    <div className="grid grid-cols-[46px_56px_46px_56px_46px] items-center justify-center gap-2.5 px-2.5 pb-2 pt-3.5">
      <RoundAction
        label="Undo last decision"
        onClick={onUndo}
        disabled={disabledAll || !canUndo}
      >
        <UndoIcon />
      </RoundAction>
      <RoundAction label="Pass on this job" onClick={onPass} large disabled={disabledAll}>
        <XIcon />
      </RoundAction>
      <RoundAction
        label="Star: save and tailor now"
        onClick={onStar}
        className="text-rose-ink"
        disabled={disabledAll}
      >
        <StarIcon />
      </RoundAction>
      <RoundAction
        label="Save this job"
        onClick={onSave}
        large
        className="!border-rose !bg-rose text-white"
        disabled={disabledAll}
      >
        <HeartIcon />
      </RoundAction>
      <RoundAction label="View job details" onClick={onInfo} disabled={disabledAll}>
        <InfoIcon />
      </RoundAction>
    </div>
  );
}
