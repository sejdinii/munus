import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scout — find the roles worth your time",
  description:
    "Fresh jobs from company sites and overlooked boards, ranked around the work you actually want.",
};

export const viewport: Viewport = {
  themeColor: "#f8f6f6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
