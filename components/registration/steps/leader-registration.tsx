"use client";

import { User, IdCard, Building, BookOpen, Mail, Phone, Link as LinkIcon } from "lucide-react";
import { RegistrationInput } from "../registration-input";

interface LeaderRegistrationProps {
  onNext: () => void;
  onBack: () => void;
  isMember?: boolean;
}

export function LeaderRegistration({ onNext, onBack, isMember = false }: LeaderRegistrationProps) {
  const title = isMember ? "Team Member 1" : "Team Leader Name";

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <h2 className="text-2xl font-bold text-brand-green mb-2">{title}</h2>
      
      <div className="flex flex-col gap-3">
        <RegistrationInput icon={User} placeholder={isMember ? "Member Name" : "Team Leader Name"} />
        <RegistrationInput icon={IdCard} placeholder="NIM (Nomor Induk Mahasiswa)" />
        <RegistrationInput icon={Building} placeholder="University" />
        <RegistrationInput icon={BookOpen} placeholder="Major / Jurusan" />
        {!isMember && <RegistrationInput icon={Mail} placeholder="Email" type="email" />}
        <RegistrationInput icon={Phone} placeholder="Telephone Number" type="tel" />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <h3 className="text-xl font-bold text-brand-green">Confirmation</h3>
        <div className="text-xs font-semibold text-brand-green/80 leading-tight">
          <p>Please Upload a PDF File or a Folder Containing:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Proof of Following @nest_ui on Instagram</li>
            <li>Proof of Twibbon Posting</li>
            <li>KTM / Kartu Tanda Mahasiswa</li>
          </ul>
          <p className="mt-1">
            To Google Drive and Submit The Link Below{" "}
            <a href="#" className="text-brand-lime-soft hover:underline">
              Example
            </a>
          </p>
        </div>
        
        {/* Multiline/Large input looking box with a link icon */}
        <div className="relative mt-2">
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
          className="px-8 py-2 rounded-full border-2 border-brand-lime-soft text-brand-cream font-bold hover:bg-brand-lime-soft/10 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-2 rounded-full bg-gradient-to-b from-brand-cream to-[#D1D1D1] text-brand-teal font-bold shadow-md hover:brightness-105 transition-all"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
