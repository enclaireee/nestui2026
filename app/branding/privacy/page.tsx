import type { Metadata } from "next";
import {
  ShieldCheck,
  Database,
  Cog,
  Share2,
  Clock,
  Lock,
  UserCheck,
  Baby,
  Cookie,
  RefreshCw,
  Mail,
} from "lucide-react";
import { GENERAL_CONTACT } from "@/lib/contacts";
import { Reveal } from "@/components/reveal";
import { bgSvg } from "@/lib/bg-svg";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How NEST UI 2026 collects, uses, stores, and protects the personal data of competition participants.",
  alternates: { canonical: "/branding/privacy" },
};

// Keep this in step with any real change to what the app collects or who
// processes it. The registration flow (app/branding/registration) and the
// admin panel are the source of truth for the "what we collect" section.
const LAST_UPDATED = "July 22, 2026";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 transform-gpu [contain:paint] [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: bgSvg }}
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pb-24 pt-28 md:px-8">
        <header className="text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
              Legal
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-2 text-4xl font-bold text-gradient-brand drop-shadow-md sm:text-5xl md:text-6xl">
              Privacy Policy
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              This policy explains what personal data we collect when you register for a
              NEST UI 2026 competition, why we collect it, and the choices you have.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-2 text-xs text-white/40">Last updated: {LAST_UPDATED}</p>
          </Reveal>
        </header>

        <div className="flex flex-col gap-4">
          <Section icon={ShieldCheck} title="Who we are">
            <p>
              NEST UI 2026 (National Electrical Summit, Faculty of Engineering, Universitas
              Indonesia) organises the MedHack, Healthineer, and Healthynovation competitions.
              This website is where you create an account and submit your team&rsquo;s
              registration. In this policy, &ldquo;we&rdquo; and &ldquo;us&rdquo; refer to the
              NEST UI 2026 committee.
            </p>
          </Section>

          <Section icon={Database} title="Information we collect">
            <p>We only collect what we need to run the competition:</p>
            <ul className="ml-4 list-disc space-y-1.5 marker:text-brand-lime">
              <li>
                <strong className="text-white">Account details</strong> — the email address and
                password you use to sign in. Passwords are handled by our authentication
                provider and are never stored by us in readable form.
              </li>
              <li>
                <strong className="text-white">Participant details</strong> — for each team member
                (leader and members): full name, email, phone number, student ID number, institution
                (university or school), and, where applicable, field of study.
              </li>
              <li>
                <strong className="text-white">Team &amp; submission details</strong> — team name,
                chosen competition and team size, and the links you provide to your letter of
                originality, proof of payment, submission files, and account-confirmation.
              </li>
              <li>
                <strong className="text-white">Technical data</strong> — your IP address and basic
                request information, used to protect the registration form against spam and abuse.
              </li>
            </ul>
          </Section>

          <Section icon={Cog} title="How we use your information">
            <ul className="ml-4 list-disc space-y-1.5 marker:text-brand-lime">
              <li>To create and manage your account and team registration.</li>
              <li>To verify eligibility and confirm your payment.</li>
              <li>To contact you about your registration, the event, and its results.</li>
              <li>To review and judge submissions.</li>
              <li>To keep the platform secure and prevent abuse.</li>
            </ul>
            <p>
              We do not sell your personal data, and we do not use it for third-party advertising.
            </p>
          </Section>

          <Section icon={Share2} title="How we share information">
            <p>
              Your data is accessible to the NEST UI 2026 committee and judges involved in running
              the competition. We also rely on service providers that process data on our behalf:
            </p>
            <ul className="ml-4 list-disc space-y-1.5 marker:text-brand-lime">
              <li>
                <strong className="text-white">Supabase</strong> — database, authentication, and
                storage of your registration data.
              </li>
              <li>
                <strong className="text-white">Vercel</strong> — hosting and delivery of this website.
              </li>
              <li>
                <strong className="text-white">Google</strong> — some materials (originality letter,
                submission files) are shared by you as Google Docs/Drive links, subject to
                Google&rsquo;s own terms.
              </li>
            </ul>
            <p>
              We may also disclose information where required by law or to protect the rights and
              safety of participants and the event.
            </p>
          </Section>

          <Section icon={Clock} title="How long we keep it">
            <p>
              We keep your registration data for the duration of NEST UI 2026 and for a reasonable
              period afterwards for reporting, verification, and record-keeping. After that, or on a
              valid deletion request, we remove data we no longer need.
            </p>
          </Section>

          <Section icon={Lock} title="How we protect it">
            <p>
              Access is served over HTTPS, restricted by authentication, and the admin panel is
              limited to authorised committee members. No system is perfectly secure, but we take
              reasonable measures to guard your data against unauthorised access.
            </p>
          </Section>

          <Section icon={UserCheck} title="Your rights">
            <p>
              You may ask us to access, correct, or delete your personal data, or to withdraw your
              consent. To do so, contact us using the details below. We may need to verify your
              identity before acting on a request.
            </p>
          </Section>

          <Section icon={Baby} title="High-school participants">
            <p>
              The Healthynovation competition is open to high-school students, some of whom may be
              minors. If you are under the age of majority, please register only with the knowledge
              and consent of a parent or guardian. A parent or guardian may contact us to review or
              remove a minor&rsquo;s data.
            </p>
          </Section>

          <Section icon={Cookie} title="Cookies">
            <p>
              We use only the cookies needed to keep you signed in and to secure the admin area. We
              do not use advertising or third-party tracking cookies.
            </p>
          </Section>

          <Section icon={RefreshCw} title="Changes to this policy">
            <p>
              We may update this policy as the competition or our practices change. When we do, we
              will revise the &ldquo;Last updated&rdquo; date at the top of this page.
            </p>
          </Section>

          <Section icon={Mail} title="Contact us">
            <p>Questions about this policy or your data? Reach us at:</p>
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${GENERAL_CONTACT.email}`}
                className="flex w-fit items-center gap-2 text-sm text-white/80 transition-colors hover:text-brand-lime"
              >
                <Mail className="h-4 w-4 text-brand-lime" />
                {GENERAL_CONTACT.email}
              </a>
              <a
                href={GENERAL_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-sm text-white/80 transition-colors hover:text-brand-lime"
              >
                {GENERAL_CONTACT.instagramHandle} on Instagram
              </a>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-lime/15">
          <Icon className="h-4 w-4 text-brand-lime" />
        </span>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-white/70">{children}</div>
    </Reveal>
  );
}
