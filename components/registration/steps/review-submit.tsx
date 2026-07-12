"use client";

import Image from "next/image";
import { Link as LinkIcon } from "lucide-react";
import { COMPETITIONS } from "@/lib/registrations/config";
import type { RegistrationDraft } from "@/lib/registrations/types";

interface ReviewSubmitProps {
  draft: RegistrationDraft;
  submitting: boolean;
  error: string | null;
  onPaymentUrl: (v: string) => void;
  onSubmissionUrl: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewSubmit({
  draft,
  submitting,
  error,
  onPaymentUrl,
  onSubmissionUrl,
  onSubmit,
  onBack,
}: ReviewSubmitProps) {
  const cfg = draft.competition ? COMPETITIONS[draft.competition] : null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      {/* Payment + submission links */}
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-brand-green">Payment</h2>
        <div className="text-xs font-bold text-brand-green leading-relaxed uppercase tracking-wider">
          <p>BANK NAME: Bank Mandiri</p>
          <p>ACCOUNT NUMBER: 1670009815647</p>
          <p>ACCOUNT HOLDER NAME: CARLOS ADRIAN MARULI</p>
        </div>
        <LinkField
          placeholder="Payment proof Google Drive link"
          value={draft.paymentProofUrl}
          onChange={onPaymentUrl}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-brand-green">Submission</h2>
        <LinkField
          placeholder="Submission Google Drive link"
          value={draft.submissionUrl}
          onChange={onSubmissionUrl}
        />
      </div>

      {/* Read-only summary */}
      <div className="rounded-2xl bg-white/70 p-4 text-sm text-brand-green">
        <h3 className="mb-2 text-lg font-bold">Review</h3>
        {cfg && (
          <div className="mb-2 flex items-center gap-2 border-b border-brand-green/10 pb-2">
            <Image
              src={cfg.logo}
              alt={`${cfg.name} logo`}
              width={28}
              height={28}
              className="rounded-md bg-white object-contain p-0.5"
            />
            <span className="font-bold">{cfg.name}</span>
          </div>
        )}
        <SummaryRow label="Competition" value={cfg?.name ?? "—"} />
        <SummaryRow label="Team" value={draft.teamName} />
        <SummaryRow label="Team size" value={String(draft.teamSize ?? "—")} />
        <SummaryRow label="Leader" value={`${draft.leader.name} · ${draft.leader.email}`} />
        {draft.members.map((m, i) => (
          <SummaryRow key={i} label={`Member ${i + 1}`} value={`${m.name} · ${m.email}`} />
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="px-10 py-2.5 rounded-2xl border-2 border-brand-lime text-brand-lime font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-brand-lime/10 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="px-10 py-2.5 rounded-2xl bg-gradient-to-r from-brand-lime to-brand-cream text-brand-teal font-bold text-sm tracking-wide shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

function LinkField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <LinkIcon className="h-5 w-5" />
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-12 w-full rounded-xl border-none bg-white/90 py-2 pl-10 pr-4 text-sm text-brand-green placeholder:text-gray-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-brand-green/10 py-1 last:border-0">
      <span className="font-semibold text-brand-green/70">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
