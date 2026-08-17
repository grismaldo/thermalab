import { GLOSSARY, KEYBOARD_SHORTCUTS } from '../lib/glossary';

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
}

export function HelpPanel({ open, onClose }: HelpPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/55 backdrop-blur-sm" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="flex h-full w-full max-w-md flex-col border-l border-slate-700/70 bg-slate-950/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <h2 id="help-title" className="text-lg font-extrabold text-slate-50">
            Guía de laboratorio
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-slate-50"
          >
            Cerrar
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-300">
            ThermaLab es un laboratorio virtual: cambia una variable y ves al instante Q, el diagrama y la
            fórmula con números sustituidos.
          </p>
          <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-slate-400">Atajos</h3>
          <ul className="mt-2 space-y-2">
            {KEYBOARD_SHORTCUTS.map((item) => (
              <li key={item.keys} className="flex gap-3 text-sm text-slate-300">
                <kbd className="font-mono-num shrink-0 rounded-md bg-slate-800 px-2 py-0.5 text-cyan-100">
                  {item.keys}
                </kbd>
                <span>{item.action}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-slate-400">Glosario</h3>
          <dl className="mt-3 space-y-4">
            {GLOSSARY.map((item) => (
              <div key={item.term}>
                <dt className="font-bold text-slate-100">
                  {item.term}
                  {item.symbol ? (
                    <span className="font-mono-num ml-2 text-xs font-medium text-cyan-200">{item.symbol}</span>
                  ) : null}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-300">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
