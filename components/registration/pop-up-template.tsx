"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface PopUpTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
}

export function PopUpTemplate({
  isOpen,
  onClose,
  title = "Pop Up Title",
  content = "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      {/* Pop up container with dark green background and yellow border */}
      <div className="relative w-full max-w-xl p-8 md:p-12 bg-[#0A261F] border-4 border-[#F3F962] rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#F3F962] hover:scale-110 transition-transform focus:outline-none"
          aria-label="Close pop up"
        >
          <X className="w-8 h-8 stroke-[3]" />
        </button>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#F3F962] mb-8 mt-2">
          {title}
        </h2>

        {/* Content */}
        <p className="text-[#F3F962] text-center text-lg md:text-xl font-bold leading-relaxed max-w-sm mx-auto">
          {content}
        </p>
      </div>
    </div>
  );
}
