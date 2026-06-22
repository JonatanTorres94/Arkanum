import type { SupportTicketNote } from "@/features/support/domain/support-ticket-note.types";

export function SupportTicketNoteList({ notes }: { notes: SupportTicketNote[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-admin-text-faint">Todavía no hay notas internas.</p>;
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-3"
        >
          <p className="whitespace-pre-wrap text-sm text-admin-text break-words">{note.content}</p>
          <p className="mt-2 text-xs text-admin-text-faint">
            {note.createdBy ?? "Administrador"}
            {" · "}
            {new Date(note.createdAt).toLocaleString("es-AR")}
          </p>
        </div>
      ))}
    </div>
  );
}
