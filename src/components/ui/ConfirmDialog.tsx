import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="lab-panel w-full max-w-md rounded-2xl p-5 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-lg font-extrabold text-slate-50">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-500/50 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700/70"
          >
            Cancelar
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-10 items-center rounded-lg border border-red-400/40 bg-red-500/18 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/28"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
