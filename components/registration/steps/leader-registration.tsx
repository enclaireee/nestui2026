"use client";

import { User, IdCard, Building, BookOpen, Mail, Phone, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { RegistrationInput } from "../registration-input";

interface LeaderRegistrationProps {
  onNext: () => void;
  onBack: () => void;
  isMember?: boolean;
  category?: "mahasiswa" | "sma";
}

export function LeaderRegistration({ onNext, onBack, isMember = false, category = "mahasiswa" }: LeaderRegistrationProps) {
  const title = isMember ? "Team Member 1" : "Team Leader Name";
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
      <h2 className="text-2xl font-bold text-brand-green mb-2">{title}</h2>

      <div className="flex flex-col gap-3">
        <RegistrationInput icon={User} placeholder={isMember ? "Member Name" : "Team Leader Name"} required />
        <RegistrationInput icon={IdCard} placeholder={category === "sma" ? "NISN (Nomor Induk Siswa Nasional)" : "NIM (Nomor Induk Mahasiswa)"} required />
        <RegistrationInput icon={Building} placeholder={category === "sma" ? "Sekolah" : "University"} required />
        {category === "mahasiswa" && <RegistrationInput icon={BookOpen} placeholder="Major / Jurusan" required />}
        {!isMember && <RegistrationInput icon={Mail} placeholder="Email" type="email" required />}
        <RegistrationInput icon={Phone} placeholder="Telephone Number" type="tel" required />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <h3 className="text-xl font-bold text-brand-green">Confirmation</h3>
        <div className="text-xs font-semibold text-brand-green/80 leading-tight">
          <p>Please Upload a PDF File or a Folder Containing:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Proof of Following @nest_ui on Instagram</li>
            <li>Proof of Twibbon Posting</li>
            <li>{category === "sma" ? "Kartu Pelajar" : "KTM / Kartu Tanda Mahasiswa"}</li>
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
            className="px-10 py-2.5 rounded-2xl border-2 border-brand-lime text-brand-lime font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-brand-lime/10"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-10 py-2.5 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-r from-brand-lime to-brand-cream text-brand-teal font-bold text-sm tracking-wide shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
}
