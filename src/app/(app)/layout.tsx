// App surfaces (Operate mode) live in the phone-width frame; the marketing
// landing at / is full-width and owns its own composition.
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="app-frame">{children}</div>;
}
