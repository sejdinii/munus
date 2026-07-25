import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { MunusStoreProvider } from "@/lib/mock/store";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Munus — find the roles worth your time",
  description:
    "Fresh jobs from company sites and overlooked boards, ranked around the work you actually want.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f8f6f6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MunusStoreProvider>
          <ToastProvider>
            <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-phone">
              {children}
            </div>
          </ToastProvider>
        </MunusStoreProvider>
      </body>
    </html>
  );
}
