"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface PopUpTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
  /** Optional footer content (e.g. confirm/cancel buttons) rendered below the body text. */
  children?: React.ReactNode;
}

export function PopUpTemplate({
  isOpen,
  onClose,
  title = "Pop Up Title",
  content = "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
  children,
}: PopUpTemplateProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Dark glass panel — same surface as the header's mobile menu dropdown,
          radius matches GlassCard, so it reads consistently over any page bg. */}
      <div className="relative w-full max-w-sm rounded-[2rem] border border-white/15 bg-[#0C342C]/95 p-8 shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/60 transition-colors hover:text-white focus:outline-none"
          aria-label="Close pop up"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-gradient-brand text-center mb-3 mt-1">
          {title}
        </h2>

        <p className="text-white/70 text-center text-sm leading-relaxed">
          {content}
        </p>

        {children && <div className="mt-8 flex justify-center gap-3">{children}</div>}
      </div>
    </div>
  );
}
