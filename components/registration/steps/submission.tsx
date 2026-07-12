"use client";

import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";

interface SubmissionProps {
  onNext: () => void;
  onBack: () => void;
  category?: "mahasiswa" | "sma";
}

export function Submission({ onNext, onBack }: SubmissionProps) {
  const [showError, setShowError] = useState(false);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!e.currentTarget.checkValidity()) {
          setShowError(true);
          return;
        }
        setShowError(false);
        onNext();
      }}
      className="flex flex-col gap-6 w-full max-w-md"
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-brand-green">Payment</h2>
        <div className="text-xs font-bold text-brand-green leading-relaxed uppercase tracking-wider mb-2">
          <p>BANK NAME</p>
          <p>ACCOUNT NUMBER</p>
          <p>ACCOUNT HOLDER NAME</p>
        </div>

        <div className="text-xs font-bold text-brand-green/90 mb-1">
          Please upload your proof of payment.
        </div>
        
        {/* Upload Box 1 */}
        <div className="relative mb-4">
           <div className="absolute left-3 top-4 text-gray-400">
             <LinkIcon className="h-8 w-8" />
           </div>
           <textarea
             required
             className="flex min-h-[80px] w-full rounded-2xl border-none bg-white/90 py-3 pl-14 pr-4 text-sm text-brand-green placeholder:text-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime resize-none [&:user-invalid]:ring-2 [&:user-invalid]:ring-red-400"
             placeholder="Google Drive Link"
           />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-brand-green">Submission</h2>
        
        <div className="text-xs font-bold text-brand-green/90 mb-1">
          Please upload your submission here.<br/>
          <a href="#" className="text-brand-lime-soft hover:underline">
              Example
          </a>
        </div>
        
        {/* Upload Box 2 */}
        <div className="relative">
           <div className="absolute left-3 top-4 text-gray-400">
             <LinkIcon className="h-8 w-8" />
           </div>
           <textarea
             required
             className="flex min-h-[80px] w-full rounded-2xl border-none bg-white/90 py-3 pl-14 pr-4 text-sm text-brand-green placeholder:text-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime resize-none [&:user-invalid]:ring-2 [&:user-invalid]:ring-red-400"
             placeholder="Google Drive Link"
           />
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 mt-6">
        {showError && (
          <p className="text-sm text-red-500">Please fill in all required fields.</p>
        )}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-10 py-2.5 rounded-xl border-2 border-brand-lime text-brand-lime font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-brand-lime/10"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-10 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-brand-lime to-brand-cream text-brand-teal font-bold text-sm tracking-wide shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}
