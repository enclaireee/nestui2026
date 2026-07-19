"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { PopUpTemplate } from "@/components/registration/pop-up-template";
import { deleteRegistration } from "@/app/admin/actions";

export function DeleteTeamButton({
  id,
  teamName,
  memberCount = 0,
}: {
  id: string;
  teamName: string;
  /** Members deleted along with the team by the ON DELETE CASCADE. */
  memberCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-red-400/40 px-3 py-1.5 text-sm font-semibold text-red-300 transition-colors duration-150 hover:bg-red-500/15"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>

      <PopUpTemplate
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete this team?"
        content={`Deletes "${teamName}"${
          memberCount ? ` and its ${memberCount} member${memberCount === 1 ? "" : "s"}` : ""
        }, including their submission and payment links. This cannot be undone — there is no way to restore it and the team would have to register again.`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="btn-ghost px-8 py-2.5 text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => startTransition(() => deleteRegistration(id))}
          disabled={pending}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-500 px-8 py-2.5 text-sm font-bold tracking-wide text-white shadow-md transition-all duration-150 hover:scale-[1.02] hover:bg-red-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60 disabled:pointer-events-none"
        >
          <Trash2 className="h-4 w-4" />
          {pending ? "Deleting..." : "Delete"}
        </button>
      </PopUpTemplate>
    </>
  );
}
