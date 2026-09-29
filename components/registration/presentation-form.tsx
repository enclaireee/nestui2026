"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon } from "lucide-react";
import { submitPresentation } from "@/app/protected/actions";
import { RegistrationInput } from "@/components/registration/registration-input";

export function PresentationForm({
  registrationId,
  existing,
}: {
  registrationId: string;
  /** Prefilled when a presentation is already in — this form replaces it rather than adding another. */
  existing?: { pptUrl: string } | null;
}) {
  const [ppt, setPpt] = useState(existing?.pptUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await submitPresentation(registrationId, ppt);
    if (res.ok) {
      router.push("/protected?ppt=1");
      router.refresh();
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  const incomplete = !ppt.trim();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white/60">
        Make sure the presentation deck link (Google Drive / Google Slides) is shared so that{" "}
        <span className="font-semibold text-white/80">anyone with the link can view</span> it.
        A private link is the most common reason a submission cannot be evaluated by the judges.
      </p>

      <RegistrationInput
        tone="dark"
        icon={LinkIcon}
        type="url"
        required
        label="Presentation Deck (PPT / Slides)"
        placeholder="Google Drive / Google Slides link to your presentation"
        value={ppt}
        onChange={(e) => setPpt(e.target.value)}
      />

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300">
          {error}
        </p>
      )}

      {existing && (
        <p className="text-xs text-white/55">
          This replaces the presentation you already submitted, and updates your submission in the review queue.
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
        <button
          type="button"
          onClick={() => router.push("/protected")}
          disabled={submitting}
          className="btn-ghost-muted px-8 py-3 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || incomplete}
          className="btn-brand px-8 py-3 text-sm"
        >
          {submitting ? "Submitting…" : existing ? "Replace presentation" : "Submit presentation"}
        </button>
      </div>
    </form>
  );
}
