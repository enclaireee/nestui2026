"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { PopUpTemplate } from "@/components/registration/pop-up-template";
import { deleteRegistration } from "@/app/admin/actions";

export function DeleteTeamButton({ id, teamName }: { id: string; teamName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-red-400/40 px-3 py-1.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/15"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>

      <PopUpTemplate
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete Team?"
        content={`This permanently deletes "${teamName}" and all of its members. This cannot be undone.`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="rounded-xl border-2 border-brand-lime px-8 py-2.5 text-sm font-bold tracking-wide text-brand-lime transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-brand-lime/10 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => startTransition(() => deleteRegistration(id))}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-red-500 px-8 py-2.5 text-sm font-bold tracking-wide text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-red-600 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          {pending ? "Deleting..." : "Delete"}
        </button>
      </PopUpTemplate>
    </>
  );
}
