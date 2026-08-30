"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon } from "lucide-react";
import { submitPaper } from "@/app/protected/actions";
import { RegistrationInput } from "@/components/registration/registration-input";

export function PaperForm({
  registrationId,
  video,
  existing,
}: {
  registrationId: string;
  /** Healthineer collects a video link alongside the paper; Healthynovation doesn't. */
  video: boolean;
  /** Prefilled when a paper is already in — this form replaces it rather than adding another. */
  existing?: { paperUrl: string; videoUrl: string | null } | null;
}) {
  const [paper, setPaper] = useState(existing?.paperUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await submitPaper(registrationId, paper, videoUrl);
    if (res.ok) {
      router.push("/protected?paper=1");
      router.refresh();
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  // Video is only required where it's collected, so an empty box must not block
  // Healthynovation's submit button.
  const incomplete = !paper.trim() || (video && !videoUrl.trim());

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white/60">
        Make sure the Drive link is shared so that{" "}
        <span className="font-semibold text-white/80">anyone with the link can view</span> it.
        A private link is the most common reason a submission gets rejected.
      </p>

      <RegistrationInput
        tone="dark"
        icon={LinkIcon}
        type="url"
        required
        label="Full paper"
        placeholder="Google Drive link to your full paper"
        value={paper}
        onChange={(e) => setPaper(e.target.value)}
      />

      {video && (
        <RegistrationInput
          tone="dark"
          icon={LinkIcon}
          type="url"
          required
          label="Video"
          placeholder="Google Drive link to your video"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      )}

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300">
          {error}
        </p>
      )}

      {existing && (
        <p className="text-xs text-white/55">
          This replaces the paper you already submitted, and puts it back in the
          review queue.
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
          {submitting ? "Submitting…" : existing ? "Replace paper" : "Submit paper"}
        </button>
      </div>
    </form>
  );
}
