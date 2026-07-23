"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ActivityIcon,
  DiscoverIcon,
  ProfileIcon,
  SavedIcon,
} from "./icons";
import { useMunusStore } from "@/lib/mock/store";

const items: Array<{ href: string; label: string; icon: ReactNode }> = [
  { href: "/discover", label: "Discover", icon: <DiscoverIcon /> },
  { href: "/favorites", label: "Favorites", icon: <SavedIcon /> },
  { href: "/applications", label: "Applications", icon: <ActivityIcon /> },
  { href: "/profile", label: "Profile", icon: <ProfileIcon /> },
];

export function Tabbar() {
  const pathname = usePathname();
  const { favorites, applications } = useMunusStore();
  const favBadge = favorites.filter(
    (id) => !applications.some((a) => a.jobId === id),
  ).length;

  return (
    <nav
      aria-label="Main navigation"
      className="grid min-h-20 grid-cols-4 items-start border-t border-line bg-paper/95 px-1.5 pb-[18px] pt-2 backdrop-blur-lg"
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const showBadge = item.href === "/favorites" && favBadge > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`grid justify-items-center gap-[3px] p-0.5 text-[9px] font-[620] ${
              active ? "text-rose" : "text-[#8c8488]"
            } [&_svg]:size-[21px]`}
          >
            <span className="relative">
              {item.icon}
              {showBadge ? (
                <span className="absolute -right-2.5 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-lg bg-rose px-[3px] text-[8px] font-extrabold text-white">
                  {favBadge}
                </span>
              ) : null}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
