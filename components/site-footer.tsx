import { Instagram, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GENERAL_CONTACT } from "@/lib/contacts";

export function SiteFooter() {
  return (
    <footer className="w-full bg-brand-green text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/nestlogo.webp"
            alt="Nest UI logo"
            width={56}
            height={56}
            className="h-11 w-11 object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span
              className="bg-clip-text text-lg font-semibold tracking-wide text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(60deg, rgb(var(--brand-green)) 0%, rgb(var(--brand-emerald-bright)) 22%, rgb(var(--brand-emerald-bright)) 78%, rgb(var(--brand-green)) 100%)",
              }}
            >
              NEST UI 2026
            </span>
            <span className="text-xs font-semibold text-white">
              National Electrical Summit
            </span>
            <Image
              src="/tagline.webp"
              alt="#Inclusive Innovation"
              width={251}
              height={70}
              className="mt-1 h-6 w-auto self-start"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:items-end sm:gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-brand-lime">
              Follow Our Socials
            </span>
            {/* Plain <a>, not next/link: Link's client router intercepts the
                click and can't handle mailto:/external schemes. */}
            <a
              href={GENERAL_CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nest UI on Instagram"
              className="text-white transition-colors duration-150 hover:text-brand-lime"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={GENERAL_CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nest UI on LinkedIn"
              className="text-white transition-colors duration-150 hover:text-brand-lime"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          <a
            href={`mailto:${GENERAL_CONTACT.email}`}
            className="flex items-center gap-2 text-xs font-semibold text-white transition-colors duration-150 hover:text-brand-lime"
          >
            <Mail className="h-4 w-4 text-brand-lime" />
            {GENERAL_CONTACT.email}
          </a>

          <Link
            href="/branding/privacy"
            className="text-xs font-semibold text-white/60 transition-colors duration-150 hover:text-brand-lime"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
