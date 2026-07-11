"use client";

import { useState } from "react";
import { StepIndicator } from "./step-indicator";
import { GlassCard } from "./glass-card";
import { TeamRegistration } from "./steps/team-registration";
import { LeaderRegistration } from "./steps/leader-registration";
import { MemberRegistration } from "./steps/member-registration";
import { Submission } from "./steps/submission";
import { ThankYou } from "./steps/thank-you";
import { AnimatePresence, motion } from "framer-motion";

const STEPS = [
  "Team Registration",
  "Leader Registration",
  "Member Registration",
  "Submission"
];

export function RegistrationClient() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="relative flex flex-col min-h-screen w-full items-center justify-center pt-24 pb-24 px-4 md:px-8">
      <h1 className="text-6xl md:text-7xl font-bold text-gradient-brand drop-shadow-md pb-3">
        {STEPS[currentStep]}
      </h1>
      {currentStep < 4 ? (
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 md:gap-24 items-start justify-center">
          {/* Left Sidebar */}
          <div className="w-full md:w-1/3 pt-8 md:pt-8 pl-4 md:pl-0 flex justify-start md:justify-end">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Right Form Area */}
          <div className="w-full md:w-2/3 max-w-2xl">
            <div className="mb-8 text-center md:text-left">

            </div>

            <GlassCard>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 0 && <TeamRegistration onNext={nextStep} />}
                  {currentStep === 1 && <LeaderRegistration onNext={nextStep} onBack={prevStep} />}
                  {currentStep === 2 && <MemberRegistration onNext={nextStep} onBack={prevStep} />}
                  {currentStep === 3 && <Submission onNext={nextStep} onBack={prevStep} />}
                </motion.div>
              </AnimatePresence>
            </GlassCard>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="thank-you"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ThankYou />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
