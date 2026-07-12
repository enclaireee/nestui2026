"use client";

import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StepIndicator } from "./step-indicator";
import { GlassCard } from "./glass-card";
import { TeamSetup } from "./steps/team-setup";
import { PersonForm } from "./steps/person-form";
import { ReviewSubmit } from "./steps/review-submit";
import { ThankYou } from "./steps/thank-you";
import { submitRegistration } from "@/app/branding/registration/actions";
import {
  COMPETITIONS,
  type Category,
  type CompetitionId,
} from "@/lib/registrations/config";
import {
  emptyDraft,
  emptyPerson,
  type PersonDraft,
  type RegistrationDraft,
} from "@/lib/registrations/types";
import {
  hasDuplicateEmails,
  validatePerson,
  type FieldErrors,
} from "@/lib/registrations/validate";

type StepKey = "team" | "leader" | "members" | "review";

const STEP_LABELS: Record<StepKey, string> = {
  team: "Team Registration",
  leader: "Leader Registration",
  members: "Member Registration",
  review: "Submission",
};

// Fixed timeline position per step so the StepIndicator image stays correct
// even when the Member step is skipped (team size 1).
const TIMELINE_INDEX: Record<StepKey, number> = {
  team: 0,
  leader: 1,
  members: 2,
  review: 3,
};

function activeSteps(teamSize: number | null): StepKey[] {
  const steps: StepKey[] = ["team", "leader"];
  if ((teamSize ?? 1) > 1) steps.push("members");
  steps.push("review");
  return steps;
}

interface WizardState {
  draft: RegistrationDraft;
  stepIndex: number;
  leaderErrors: FieldErrors;
  memberErrors: FieldErrors[];
  formError: string | null;
  submitting: boolean;
  submitError: string | null;
  submittedCode: string | null;
}

type Action =
  | { type: "SET_COMPETITION"; id: CompetitionId }
  | { type: "SET_TEAM_SIZE"; size: number }
  | { type: "SET_TEAM_NAME"; value: string }
  | { type: "UPDATE_LEADER"; field: keyof PersonDraft; value: string }
  | { type: "UPDATE_MEMBER"; index: number; field: keyof PersonDraft; value: string }
  | { type: "SET_PAYMENT_URL"; value: string }
  | { type: "SET_SUBMISSION_URL"; value: string }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "LEADER_ERRORS"; errors: FieldErrors }
  | { type: "MEMBER_ERRORS"; errors: FieldErrors[]; formError: string | null }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "SUBMIT_SUCCESS"; code: string };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_COMPETITION":
      return {
        ...state,
        draft: { ...state.draft, competition: action.id, teamSize: null, members: [] },
      };
    case "SET_TEAM_SIZE": {
      const n = action.size - 1;
      const members = Array.from({ length: n }, (_, i) => state.draft.members[i] ?? emptyPerson());
      return { ...state, draft: { ...state.draft, teamSize: action.size, members } };
    }
    case "SET_TEAM_NAME":
      return { ...state, draft: { ...state.draft, teamName: action.value } };
    case "UPDATE_LEADER":
      return {
        ...state,
        draft: { ...state.draft, leader: { ...state.draft.leader, [action.field]: action.value } },
        leaderErrors: { ...state.leaderErrors, [action.field]: "" },
      };
    case "UPDATE_MEMBER": {
      const members = state.draft.members.map((m, i) =>
        i === action.index ? { ...m, [action.field]: action.value } : m,
      );
      const memberErrors = state.memberErrors.map((e, i) =>
        i === action.index ? { ...e, [action.field]: "" } : e,
      );
      return { ...state, draft: { ...state.draft, members }, memberErrors };
    }
    case "SET_PAYMENT_URL":
      return { ...state, draft: { ...state.draft, paymentProofUrl: action.value }, submitError: null };
    case "SET_SUBMISSION_URL":
      return { ...state, draft: { ...state.draft, submissionUrl: action.value }, submitError: null };
    case "NEXT":
      return { ...state, stepIndex: state.stepIndex + 1, formError: null };
    case "BACK":
      return { ...state, stepIndex: Math.max(0, state.stepIndex - 1), formError: null, submitError: null };
    case "LEADER_ERRORS":
      return { ...state, leaderErrors: action.errors };
    case "MEMBER_ERRORS":
      return { ...state, memberErrors: action.errors, formError: action.formError };
    case "SUBMIT_START":
      return { ...state, submitting: true, submitError: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, submitError: action.error };
    case "SUBMIT_SUCCESS":
      return { ...state, submitting: false, submittedCode: action.code };
    default:
      return state;
  }
}

export function RegistrationClient({ category }: { category?: Category }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    draft: emptyDraft(),
    stepIndex: 0,
    leaderErrors: {},
    memberErrors: [],
    formError: null,
    submitting: false,
    submitError: null,
    submittedCode: null,
  }));

  const { draft } = state;
  const steps = activeSteps(draft.teamSize);
  const step = steps[state.stepIndex];
  const cfg = draft.competition ? COMPETITIONS[draft.competition] : null;

  function goNext() {
    if (step === "leader" && cfg) {
      const errs = validatePerson(draft.leader, cfg);
      if (Object.keys(errs).length) return dispatch({ type: "LEADER_ERRORS", errors: errs });
    }
    if (step === "members" && cfg) {
      const errs = draft.members.map((m) => validatePerson(m, cfg));
      if (errs.some((e) => Object.keys(e).length))
        return dispatch({ type: "MEMBER_ERRORS", errors: errs, formError: null });
      if (hasDuplicateEmails(draft))
        return dispatch({
          type: "MEMBER_ERRORS",
          errors: errs,
          formError: "Each participant must use a different email.",
        });
    }
    dispatch({ type: "NEXT" });
  }

  async function handleSubmit() {
    dispatch({ type: "SUBMIT_START" });
    const result = await submitRegistration(draft);
    if (result.ok) dispatch({ type: "SUBMIT_SUCCESS", code: result.code });
    else dispatch({ type: "SUBMIT_ERROR", error: result.error });
  }

  return (
    <div className="relative flex flex-col min-h-screen w-full items-center justify-center pt-24 pb-24 px-4 md:px-8">
      <h1 className="text-6xl md:text-7xl font-bold text-gradient-brand drop-shadow-md pb-3">
        {state.submittedCode ? "Thank You" : STEP_LABELS[step]}
      </h1>

      {state.submittedCode ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="thank-you"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ThankYou code={state.submittedCode} />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 md:gap-24 items-start justify-center">
          <div className="w-full md:w-1/3 pt-8 pl-4 md:pl-0 flex justify-start md:justify-end">
            <StepIndicator
              steps={steps.map((s) => STEP_LABELS[s])}
              currentStep={TIMELINE_INDEX[step]}
            />
          </div>

          <div className="w-full md:w-2/3 max-w-2xl">
            <GlassCard>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === "team" && (
                    <TeamSetup
                      category={category}
                      competition={draft.competition}
                      teamName={draft.teamName}
                      teamSize={draft.teamSize}
                      onSelectCompetition={(id) => dispatch({ type: "SET_COMPETITION", id })}
                      onTeamName={(value) => dispatch({ type: "SET_TEAM_NAME", value })}
                      onSelectSize={(size) => dispatch({ type: "SET_TEAM_SIZE", size })}
                      onNext={goNext}
                    />
                  )}

                  {step === "leader" && cfg && (
                    <div className="flex flex-col gap-6 w-full max-w-md">
                      <PersonForm
                        title="Team Leader"
                        person={draft.leader}
                        cfg={cfg}
                        errors={state.leaderErrors}
                        onChange={(field, value) => dispatch({ type: "UPDATE_LEADER", field, value })}
                      />
                      <NavButtons onBack={() => dispatch({ type: "BACK" })} onNext={goNext} />
                    </div>
                  )}

                  {step === "members" && cfg && (
                    <div className="flex flex-col gap-6 w-full max-w-md">
                      {draft.members.map((m, i) => (
                        <PersonForm
                          key={i}
                          title={`Team Member ${i + 1}`}
                          person={m}
                          cfg={cfg}
                          errors={state.memberErrors[i] ?? {}}
                          onChange={(field, value) =>
                            dispatch({ type: "UPDATE_MEMBER", index: i, field, value })
                          }
                        />
                      ))}
                      {state.formError && (
                        <p className="text-sm font-semibold text-red-500">{state.formError}</p>
                      )}
                      <NavButtons onBack={() => dispatch({ type: "BACK" })} onNext={goNext} />
                    </div>
                  )}

                  {step === "review" && (
                    <ReviewSubmit
                      draft={draft}
                      submitting={state.submitting}
                      error={state.submitError}
                      onPaymentUrl={(value) => dispatch({ type: "SET_PAYMENT_URL", value })}
                      onSubmissionUrl={(value) => dispatch({ type: "SET_SUBMISSION_URL", value })}
                      onSubmit={handleSubmit}
                      onBack={() => dispatch({ type: "BACK" })}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButtons({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex justify-end gap-4">
      <button
        type="button"
        onClick={onBack}
        className="px-10 py-2.5 rounded-2xl border-2 border-brand-lime text-brand-lime font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-brand-lime/10"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="px-10 py-2.5 rounded-2xl bg-gradient-to-r from-brand-lime to-brand-cream text-brand-teal font-bold text-sm tracking-wide shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
      >
        Next
      </button>
    </div>
  );
}
