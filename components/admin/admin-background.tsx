// Shared decorative background for the whole /admin area. Fixed behind content,
// dark enough to keep the white admin text readable, with soft brand-colored
// glow orbs so it isn't a flat fill.
export function AdminBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[#0A261F]">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-green via-[#0A2A22] to-[#07160F]" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_15%_10%,rgb(var(--brand-lime)/0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_40%_at_90%_38%,rgb(var(--brand-teal)/0.22),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_40%_at_30%_95%,rgb(var(--brand-lime)/0.06),transparent_70%)]" />
    </div>
  );
}
