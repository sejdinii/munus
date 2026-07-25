"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "./icons";
import { IconButton } from "./IconButton";

export function Topbar({ title, backHref }: { title: string; backHref?: string }) {
  const router = useRouter();
  /* Prefer real history when we arrived from inside the app (avoids the
     back-forward loop a hard-wired push creates); backHref is the fallback
     for deep links with no same-origin referrer. */
  const goBack = () => {
    const cameFromApp =
      typeof document !== "undefined" &&
      document.referrer.startsWith(window.location.origin);
    if (cameFromApp || !backHref) router.back();
    else router.push(backHref);
  };
  return (
    <header className="grid min-h-[58px] grid-cols-[44px_1fr_44px] items-center px-3">
      <IconButton label="Back" onClick={goBack}>
        <BackIcon />
      </IconButton>
      <h1 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-center text-base font-[720]">
        {title}
      </h1>
      <span />
    </header>
  );
}
