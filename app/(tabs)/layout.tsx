import type { ReactNode } from "react";
import { Tabbar } from "@/components/ui/Tabbar";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <div className="sticky bottom-0">
        <Tabbar />
      </div>
    </>
  );
}
