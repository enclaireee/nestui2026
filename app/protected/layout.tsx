export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center bg-[#0C342C] bg-top bg-no-repeat bg-[length:100%_auto] pt-24 pb-16 px-4 sm:pt-28 md:px-8"
      style={{ backgroundImage: "url('/aboutbackground.webp')" }}
    >
      {/* Darkening veil so the glass panels stay readable over the artwork. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0C342C]/40" />
      <div className="relative flex-1 w-full max-w-4xl flex flex-col">{children}</div>
    </main>
  );
}
