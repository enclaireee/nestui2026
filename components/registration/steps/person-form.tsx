"use client";

import { User, IdCard, Building, BookOpen, Mail, Phone, Link as LinkIcon, Upload, FileSignature } from "lucide-react";
import { RegistrationInput } from "../registration-input";
import { SectionLabel } from "../section-label";
import { GENERAL_CONTACT } from "@/lib/contacts";
import type { CompetitionConfig } from "@/lib/registrations/config";
import type { PersonDraft } from "@/lib/registrations/types";
import type { FieldErrors } from "@/lib/registrations/validate";

interface PersonFormProps {
  title: string;
  person: PersonDraft;
  cfg: CompetitionConfig;
  errors: FieldErrors;
  onChange: (field: keyof PersonDraft, value: string) => void;
  /**
   * Leader step only. The letter of originality is one document per team, so it
   * lives on the draft rather than in PersonDraft — it renders here because the
   * leader is the one who signs and submits it.
   */
  originality?: {
    value: string;
    error?: string;
    onChange: (value: string) => void;
  };
}

// Reusable form for the leader and every member — the only difference between
// competitions (major field, ID/institution labels) comes from `cfg`.
export function PersonForm({
  title,
  person,
  cfg,
  errors,
  onChange,
  originality,
}: PersonFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-lime to-brand-cream text-brand-teal shadow-sm">
          <User className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-xl font-bold leading-tight text-brand-cream">{title}</h3>
          <p className="text-xs font-medium text-brand-cream/50">Personal &amp; contact details</p>
        </div>
      </div>

      {/* Identity fields. autoComplete lets the browser fill a member's own
          details in one tap — the difference between 7 fields and 2 on a phone.
          The leader and each member are separate people, so these stay the
          plain field names rather than a section-scoped token. */}
      <div className="flex flex-col gap-4">
        <RegistrationInput
          tone="dark"
          icon={User}
          label="Full name"
          placeholder="e.g. Budi Santoso"
          autoComplete="name"
          value={person.name}
          error={errors.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <RegistrationInput
          tone="dark"
          icon={Mail}
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          value={person.email}
          error={errors.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
        <RegistrationInput
          tone="dark"
          icon={Phone}
          type="tel"
          label="Phone number"
          placeholder="08xxxxxxxxxx"
          autoComplete="tel"
          inputMode="tel"
          hint="WhatsApp number — this is how we reach you about your submission."
          value={person.phone}
          error={errors.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
        <RegistrationInput
          tone="dark"
          icon={IdCard}
          label={cfg.studentIdLabel}
          placeholder={cfg.studentIdLabel}
          value={person.studentId}
          error={errors.studentId}
          onChange={(e) => onChange("studentId", e.target.value)}
        />
        <RegistrationInput
          tone="dark"
          icon={Building}
          label={cfg.institutionLabel}
          placeholder={`Your ${cfg.institutionLabel.toLowerCase()}`}
          autoComplete="organization"
          value={person.institution}
          error={errors.institution}
          onChange={(e) => onChange("institution", e.target.value)}
        />
        {cfg.hasMajor && (
          <RegistrationInput
            tone="dark"
            icon={BookOpen}
            label="Major / Jurusan"
            placeholder="e.g. Electrical Engineering"
            value={person.major}
            error={errors.major}
            onChange={(e) => onChange("major", e.target.value)}
          />
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-brand-green/10 pt-4">
        <SectionLabel icon={Upload}>Confirmation</SectionLabel>
        <div className="rounded-xl bg-brand-cream/[0.05] px-3 py-2.5 text-xs leading-relaxed text-brand-cream/65 border border-brand-cream/15">
          <p className="font-semibold">
            Submit one Google Drive folder containing all of the following:
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>Scan of your {cfg.studentIdLabel}</li>
            <li>
              Proof of following{" "}
              <a
                href={GENERAL_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-lime underline decoration-brand-lime underline-offset-2 hover:text-brand-lime"
              >
                {GENERAL_CONTACT.instagramHandle}
              </a>{" "}
              on Instagram
            </li>
            <li>Proof of posting the NEST UI 2026 twibbon</li>
          </ul>
        </div>
        <RegistrationInput
          tone="dark"
          icon={LinkIcon}
          type="url"
          label="Confirmation folder link"
          placeholder="https://drive.google.com/..."
          hint="Make sure the folder is shared as “Anyone with the link can view”."
          value={person.confirmationUrl}
          error={errors.confirmationUrl}
          onChange={(e) => onChange("confirmationUrl", e.target.value)}
        />
      </div>

      {originality && (
        <div className="flex flex-col gap-3 border-t border-brand-green/10 pt-4">
          <SectionLabel icon={FileSignature}>Letter of Originality</SectionLabel>
          <div className="rounded-xl bg-brand-cream/[0.05] px-3 py-2.5 text-xs leading-relaxed text-brand-cream/65 border border-brand-cream/15">
            <p>
              Open the {cfg.name} template below, copy it, fill and sign it, then upload
              the signed copy to Google Drive and paste the link here. One letter per
              team — the leader signs on the team&rsquo;s behalf.
            </p>
            <a
              href={cfg.originalityTemplateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block font-semibold text-brand-lime underline decoration-brand-lime underline-offset-2 hover:text-brand-lime"
            >
              Open the {cfg.name} letter of originality template →
            </a>
          </div>
          <RegistrationInput
            tone="dark"
            icon={LinkIcon}
            type="url"
            label="Letter of originality link"
            placeholder="https://drive.google.com/..."
            hint="Make sure the file is shared as “Anyone with the link can view”."
            value={originality.value}
            error={originality.error}
            onChange={(e) => originality.onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
