"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "./icons";
import { IconButton } from "./IconButton";

export function Topbar({ title, backHref }: { title: string; backHref?: string }) {
  const router = useRouter();
  return (
    <header className="grid min-h-[58px] grid-cols-[44px_1fr_44px] items-center px-3">
      <IconButton
        label="Back"
        onClick={() => (backHref ? router.push(backHref) : router.back())}
      >
        <BackIcon />
      </IconButton>
      <h1 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-center text-base font-[720]">
        {title}
      </h1>
      <span />
    </header>
  );
}
