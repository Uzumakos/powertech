"use client";

import { Trash2 } from "lucide-react";

/** Submits a delete action after a confirmation prompt. */
export function DeleteButton({ action, label, confirmText }: { action: () => Promise<void>; label: string; confirmText?: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmText ?? "Supprimer définitivement ? Cette action est irréversible.")) event.preventDefault();
      }}
    >
      <button type="submit" className="btn border border-crimson/40 bg-white text-crimson hover:bg-crimson/5">
        <Trash2 className="size-4" />
        {label}
      </button>
    </form>
  );
}
