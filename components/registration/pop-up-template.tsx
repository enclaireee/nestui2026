"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface PopUpTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  /** Optional footer content (e.g. confirm/cancel buttons) rendered below the body text. */
  children?: React.ReactNode;
}

/**
 * ponytail: a native <dialog> opened with showModal(), not a hand-rolled
 * overlay. The platform then provides — for free and correctly — the focus
 * trap, Esc-to-close, inert background, top-layer stacking (no z-index
 * arithmetic) and focus restored to whatever opened it. The previous div
 * version had none of those: keyboard users could tab out of the modal into
 * the content hidden behind the scrim.
 */
export function PopUpTemplate({
  isOpen,
  onClose,
  title,
  content,
  children,
}: PopUpTemplateProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isOpen && !el.open) {
      el.showModal();
      // showModal() makes the background inert but does not stop it scrolling.
      document.body.style.overflow = "hidden";
    } else if (!isOpen && el.open) {
      el.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="popup-title"
      // Esc fires `cancel` then `close`. Routing that back through onClose keeps
      // React state in sync with what the platform already did to the DOM.
      onClose={onClose}
      // A click lands on the <dialog> element itself only when it hits the
      // backdrop — the panel below covers everything else.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="max-w-sm rounded-[2rem] border border-white/15 bg-brand-green/95 p-8 text-left text-white shadow-2xl ring-1 ring-white/5 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full text-white/60 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
        aria-label="Close pop up"
      >
        <X className="h-5 w-5" />
      </button>

      <h2
        id="popup-title"
        className="mb-3 mt-1 text-center text-2xl font-bold text-gradient-brand"
      >
        {title}
      </h2>

      <p className="text-center text-sm leading-relaxed text-white/70">{content}</p>

      {children && <div className="mt-8 flex justify-center gap-3">{children}</div>}
    </dialog>
  );
}
