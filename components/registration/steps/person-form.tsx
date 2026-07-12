"use client";

import { User, IdCard, Building, BookOpen, Mail, Phone, Link as LinkIcon } from "lucide-react";
import { RegistrationInput } from "../registration-input";
import type { CompetitionConfig } from "@/lib/registrations/config";
import type { PersonDraft } from "@/lib/registrations/types";
import type { FieldErrors } from "@/lib/registrations/validate";

interface PersonFormProps {
  title: string;
  person: PersonDraft;
  cfg: CompetitionConfig;
  errors: FieldErrors;
  onChange: (field: keyof PersonDraft, value: string) => void;
}

// Reusable form for the leader and every member — the only difference between
// competitions (major field, ID/institution labels) comes from `cfg`.
export function PersonForm({ title, person, cfg, errors, onChange }: PersonFormProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xl font-bold text-brand-green">{title}</h3>

      <Field error={errors.name}>
        <RegistrationInput
          icon={User}
          placeholder="Full Name"
          value={person.name}
          aria-invalid={!!errors.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </Field>
      <Field error={errors.email}>
        <RegistrationInput
          icon={Mail}
          type="email"
          placeholder="Email"
          value={person.email}
          aria-invalid={!!errors.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </Field>
      <Field error={errors.phone}>
        <RegistrationInput
          icon={Phone}
          type="tel"
          placeholder="Telephone Number"
          value={person.phone}
          aria-invalid={!!errors.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </Field>
      <Field error={errors.studentId}>
        <RegistrationInput
          icon={IdCard}
          placeholder={cfg.studentIdLabel}
          value={person.studentId}
          aria-invalid={!!errors.studentId}
          onChange={(e) => onChange("studentId", e.target.value)}
        />
      </Field>
      <Field error={errors.institution}>
        <RegistrationInput
          icon={Building}
          placeholder={cfg.institutionLabel}
          value={person.institution}
          aria-invalid={!!errors.institution}
          onChange={(e) => onChange("institution", e.target.value)}
        />
      </Field>
      {cfg.hasMajor && (
        <Field error={errors.major}>
          <RegistrationInput
            icon={BookOpen}
            placeholder="Major"
            value={person.major}
            aria-invalid={!!errors.major}
            onChange={(e) => onChange("major", e.target.value)}
          />
        </Field>
      )}

      <div className="rounded-xl bg-brand-green/5 px-3 py-2.5 text-xs leading-relaxed text-brand-green/80">
        <p className="font-semibold">
          Submit one Google Drive folder containing all of the following:
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>Scan of your {cfg.studentIdLabel}</li>
          <li>
            Proof of following{" "}
            <a
              href="https://instagram.com/nest_ui"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-teal underline decoration-brand-lime underline-offset-2 hover:text-brand-green"
            >
              @nest_ui
            </a>{" "}
            on Instagram
          </li>
          <li>Proof of posting the NEST UI 2026 twibbon</li>
        </ul>
      </div>
      <Field error={errors.confirmationUrl}>
        <RegistrationInput
          icon={LinkIcon}
          type="url"
          placeholder="Confirmation Google Drive Link"
          value={person.confirmationUrl}
          aria-invalid={!!errors.confirmationUrl}
          onChange={(e) => onChange("confirmationUrl", e.target.value)}
        />
      </Field>
    </div>
  );
}

function Field({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {children}
      {error && <p className="pl-1 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
