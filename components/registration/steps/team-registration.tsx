"use client";

import { User } from "lucide-react";
import { RegistrationInput } from "../registration-input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamRegistrationProps {
  onNext: () => void;
}

export function TeamRegistration({ onNext }: TeamRegistrationProps) {
  const [competitionType, setCompetitionType] = useState<string | null>(null);
  
  const competitionTypes = [
    { id: "type1", label: "Type 1" }, // Adjust labels based on actual needs
    { id: "type2", label: "Type 2" },
    { id: "type3", label: "Type 3" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-md">
      {/* Team Name */}
      <div className="flex flex-col gap-2">
        <label className="text-xl font-bold text-brand-green">Team Name</label>
        <RegistrationInput icon={User} placeholder="Team Name" />
      </div>

      {/* Competition Type */}
      <div className="flex flex-col gap-4">
        <label className="text-xl font-bold text-brand-green">Competition Type</label>
        <div className="flex gap-4">
          {competitionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setCompetitionType(type.id)}
              className={cn(
                "w-16 h-16 rounded-full border-2 transition-all flex items-center justify-center bg-white/80",
                competitionType === type.id
                  ? "border-brand-lime ring-2 ring-brand-lime shadow-md"
                  : "border-transparent hover:border-brand-lime/50"
              )}
              aria-label={`Select ${type.label}`}
            />
          ))}
        </div>
      </div>

      {/* Total Number of Members */}
      <div className="flex flex-col gap-2">
        <label className="text-xl font-bold text-brand-green">
          Total Number of Members
          <span className="block text-xs font-semibold text-brand-green/80 mt-1">
            Including Team Leader
          </span>
        </label>
        {/* Simple select inside our styled pill */}
        <div className="relative">
          <select defaultValue="" className="flex h-12 w-full appearance-none rounded-full border-none bg-white/90 px-4 py-2 text-sm text-brand-green shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime">
            <option value="" disabled>Team Name</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          {/* Custom Dropdown Arrow */}
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="#0C342C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onNext}
          className="px-8 py-2 rounded-full bg-gradient-to-b from-brand-cream to-[#D1D1D1] text-brand-teal font-bold shadow-md hover:brightness-105 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
