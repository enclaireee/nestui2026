"use client";

import { Link as LinkIcon } from "lucide-react";

interface SubmissionProps {
  onNext: () => void;
  onBack: () => void;
}

export function Submission({ onNext, onBack }: SubmissionProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-brand-green">Payment</h2>
        <div className="text-xs font-bold text-brand-green leading-relaxed uppercase tracking-wider mb-2">
          <p>NAMA BANK</p>
          <p>NOMOR REKENING</p>
          <p>NAMA REKENING</p>
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
             className="flex min-h-[80px] w-full rounded-2xl border-none bg-white/90 py-3 pl-14 pr-4 text-sm text-brand-green placeholder:text-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime resize-none"
             placeholder={"Google Drive Link\nLine 2\nLine 3"}
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
             className="flex min-h-[80px] w-full rounded-2xl border-none bg-white/90 py-3 pl-14 pr-4 text-sm text-brand-green placeholder:text-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime resize-none"
             placeholder={"Google Drive Link\nLine 2\nLine 3"}
           />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={onBack}
          className="px-10 py-2.5 rounded-xl border-2 border-brand-lime text-brand-lime font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-brand-lime/10"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-10 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-brand-lime to-brand-cream text-brand-teal font-bold text-sm tracking-wide shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
