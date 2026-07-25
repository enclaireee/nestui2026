import type { Metadata } from "next";
import Image from "next/image";
import { Mail, Phone, Instagram, Linkedin, Handshake } from "lucide-react";
import { COMPETITIONS, COMPETITION_IDS } from "@/lib/registrations/config";
import { COMPETITION_CONTACTS, GENERAL_CONTACT, waLink } from "@/lib/contacts";
import { Reveal } from "@/components/reveal";
import { bgSvg } from "@/lib/bg-svg";
import { ParallaxFloat } from "@/components/parallax-float";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the NEST UI 2026 team — partnership enquiries and the contact person for each competition.",
  alternates: { canonical: "/branding/contact" },
};

const PARTNER_SUBJECT = "Partnership Inquiry — NEST UI 2026";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 transform-gpu [contain:paint] [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: bgSvg }}
      />
      <ParallaxFloat
        distance={80}
        className="pointer-events-none absolute left-0 top-0 -z-10 w-44 opacity-80 sm:w-64 md:w-80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG backdrop; next/image does not optimise SVG. */}
        <img src="/lefttopfloaterreg.svg" alt="" aria-hidden className="h-auto w-full" />
      </ParallaxFloat>
      <ParallaxFloat
        distance={120}
        className="pointer-events-none absolute right-0 top-1/4 -z-10 w-96 opacity-80 sm:w-90 md:w-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG backdrop; next/image does not optimise SVG. */}
        <img src="/rightfloaterreg.svg" alt="" aria-hidden className="h-auto w-full" />
      </ParallaxFloat>

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 pb-24 pt-28 md:px-8">
        <header className="text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">Contact</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-2 text-4xl font-bold text-gradient-brand drop-shadow-md sm:text-5xl md:text-6xl">
              Get in Touch
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Questions about a competition, or interested in partnering with NEST UI 2026? Reach
              the right person below.
            </p>
          </Reveal>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card delay={0.08}>
            <CardHead icon={Handshake} title="Partnership & Sponsorship" />
            <p className="text-sm leading-relaxed text-white/70">
              Collaborate with NEST UI 2026 — from multinational corporations to startups. Tell us
              what you have in mind and our partnership team will get back to you.
            </p>
            <a
              href={`mailto:${GENERAL_CONTACT.email}?subject=${encodeURIComponent(PARTNER_SUBJECT)}`}
              className="btn-brand mt-auto w-fit px-6 py-2.5 text-sm"
            >
              <Mail className="h-4 w-4" />
              Become our partner
            </a>
          </Card>

          <Card delay={0.16}>
            <CardHead icon={Mail} title="General & Socials" />
            <a
              href={`mailto:${GENERAL_CONTACT.email}`}
              className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-brand-lime"
            >
              <Mail className="h-4 w-4 text-brand-lime" />
              {GENERAL_CONTACT.email}
            </a>
            <a
              href={GENERAL_CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-brand-lime"
            >
              <Instagram className="h-4 w-4 text-brand-lime" />
              {GENERAL_CONTACT.instagramHandle}
            </a>
            <a
              href={GENERAL_CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-brand-lime"
            >
              <Linkedin className="h-4 w-4 text-brand-lime" />
              NEST UI on LinkedIn
            </a>
          </Card>
        </div>

        <section className="flex flex-col gap-4">
          <Reveal className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-lime/15">
              <Phone className="h-4 w-4 text-brand-lime" />
            </span>
            <h2 className="text-lg font-bold text-white">Competition Contact Persons</h2>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPETITION_IDS.map((id, i) => {
              const cfg = COMPETITIONS[id];
              return (
                <Card key={id} delay={i * 0.1}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0">
                      <Image
                        src={cfg.logo}
                        alt={`${cfg.name} logo`}
                        fill
                        sizes="44px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{cfg.name}</p>
                      <p className="text-xs text-white/50">{cfg.categoryLabel}</p>
                    </div>
                  </div>

                  <div className="mt-1 flex flex-col gap-2">
                    {COMPETITION_CONTACTS[id].map((c) => (
                      <a
                        key={c.name}
                        href={waLink(c.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 transition-colors hover:bg-white/10"
                      >
                        <span className="font-semibold text-white">{c.name}</span>
                        <span className="text-xs text-white/60">{c.phone}</span>
                      </a>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-white/40">Names link to WhatsApp.</p>
        </section>
      </div>
    </main>
  );
}

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    // The hover lift lives on an inner div: framer leaves an inline transform
    // on the Reveal element itself, which would override a CSS translate there.
    <Reveal delay={delay} className="flex">
      <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-brand-lime/30">
        {children}
      </div>
    </Reveal>
  );
}

function CardHead({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lime/15">
        <Icon className="h-4 w-4 text-brand-lime" />
      </span>
      <h2 className="text-base font-bold text-white">{title}</h2>
    </div>
  );
}
