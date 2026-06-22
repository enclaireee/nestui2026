import { Instagram, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full bg-[#0C342C] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-5 sm:flex-row sm:items-center sm:gap-4">
        {/* Brand */}
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
                  "linear-gradient(60deg, #0C342C 0%, #009477 22%, #009477 78%, #0C342C 100%)",
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

        {/* Socials + Contact */}
        <div className="flex flex-col items-center gap-4 sm:items-end sm:gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-300">
              Follow Our Socials
            </span>
            <Link
              href="https://instagram.com/nest_ui"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nest UI on Instagram"
              className="text-white transition-colors hover:text-emerald-300"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/nest-ui/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nest UI on LinkedIn"
              className="text-white transition-colors hover:text-emerald-300"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>

          <Link
            href="mailto:nestui.ft@gmail.com"
            className="flex items-center gap-2 text-xs font-semibold text-white transition-colors hover:text-emerald-300"
          >
            <Mail className="h-4 w-4 text-emerald-300" />
            nestui.ft@gmail.com
          </Link>
        </div>
      </div>
    </footer>
  );
}
