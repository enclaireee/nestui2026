"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Wallet, Copy, Check } from "lucide-react";
import { addSubmission } from "@/app/protected/actions";
import { PAYMENT_INFO } from "@/lib/payment";

export function ResubmitForm({ registrationId }: { registrationId: string }) {
  const [payment, setPayment] = useState("");
  const [submission, setSubmission] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await addSubmission(registrationId, payment, submission);
    if (res.ok) {
      router.push("/protected");
      router.refresh();
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  function copyAccount() {
    navigator.clipboard?.writeText(PAYMENT_INFO.accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Payment destination */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-lime">
          <Wallet className="h-4 w-4" />
          Pay the registration fee to
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-white/45">Bank</dt>
          <dd className="font-medium text-white">{PAYMENT_INFO.bank}</dd>
          <dt className="text-white/45">Account</dt>
          <dd className="flex items-center gap-2 font-mono font-medium text-white">
            {PAYMENT_INFO.accountNumber}
            <button
              type="button"
              onClick={copyAccount}
              className="text-white/40 transition-colors hover:text-brand-lime"
              aria-label="Copy account number"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </dd>
          <dt className="text-white/45">Holder</dt>
          <dd className="font-medium text-white">{PAYMENT_INFO.accountHolder}</dd>
        </dl>
      </div>

      <Field label="Payment proof">
        <UrlInput
          placeholder="Google Drive link to your transfer receipt"
          value={payment}
          onChange={setPayment}
        />
      </Field>

      <Field label="Submission">
        <UrlInput
          placeholder="Google Drive link to your submission"
          value={submission}
          onChange={setSubmission}
        />
      </Field>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/protected")}
          disabled={submitting}
          className="rounded-2xl border-2 border-white/20 px-8 py-2.5 text-sm font-bold tracking-wide text-white/80 transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !payment.trim() || !submission.trim()}
          className="rounded-2xl bg-gradient-to-r from-brand-lime to-brand-cream px-8 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? "Submitting…" : "Submit entry"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      {children}
    </div>
  );
}

function UrlInput({
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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
        <LinkIcon className="h-5 w-5" />
      </div>
      <input
        type="url"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/35 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
      />
    </div>
  );
}
