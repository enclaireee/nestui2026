// Shared decorative background for the whole /admin area. Fixed behind content,
// dark enough to keep the white admin text readable, with soft brand-colored
// glow orbs so it isn't a flat fill.
export function AdminBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[#0A261F]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C342C] via-[#0A2A22] to-[#07160F]" />
      <div className="absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-lime/10 blur-[130px]" />
      <div className="absolute top-1/3 -right-28 h-[26rem] w-[26rem] rounded-full bg-brand-teal/25 blur-[130px]" />
      <div className="absolute -bottom-32 left-1/4 h-[24rem] w-[24rem] rounded-full bg-brand-lime/[0.06] blur-[130px]" />
    </div>
  );
}
