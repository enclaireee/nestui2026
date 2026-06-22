import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/branding/mainpage" },
  { label: "About us", href: "/branding/aboutpage" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 sm:pt-4">
      <nav className="relative mx-auto flex h-12 max-w-4xl items-center justify-between rounded-full border border-white/15 bg-[#0C342C]/80 pl-4 pr-2 shadow-lg shadow-black/10 ring-1 ring-white/5 sm:pl-5">
        {/* Brand */}
        <Link href="/branding/mainpage" className="flex items-center gap-2">
          <Image
            src="/nestlogo.webp"
            alt="Nest UI logo"
            width={32}
            height={32}
            className="h-6 w-6 object-contain"
            priority
          />
          <span
            className="bg-clip-text text-sm font-semibold tracking-wide text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(60deg, #0C342C 0%, #009477 22%, #009477 78%, #0C342C 100%)",
            }}
          >
            NEST UI
          </span>
        </Link>

        {/* Center navigation */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 transition-colors hover:text-emerald-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Login */}
        <Link
          href="/auth/login"
          className="rounded-full bg-white/95 px-5 py-1.5 text-sm font-semibold text-[#0C342C] shadow-sm transition-colors hover:bg-white"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
