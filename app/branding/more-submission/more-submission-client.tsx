"use client";

import { GlassCard } from "@/components/registration/glass-card";
import { Submission } from "@/components/registration/steps/submission";

export function MoreSubmissionClient() {
  return (
    <GlassCard>
      <div className="flex flex-col items-center w-full px-2 py-4">
        <Submission
          onNext={() => {
            console.log("Submit clicked");
          }}
          onBack={() => {
            console.log("Back clicked");
          }}
        />
      </div>
    </GlassCard>
  );
}
