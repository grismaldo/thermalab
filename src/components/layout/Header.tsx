import { CircleHelp, Flame } from 'lucide-react';
import type { ViewId } from '../../types';
import { NAV_ITEMS } from './navigation';

interface HeaderProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  onOpenHelp: () => void;
}

export function Header({ activeView, onNavigate, onOpenHelp }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="thermal-strip h-1 w-full" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-orange-300/45 bg-orange-500/16 text-orange-300">
            <Flame size={25} fill="currentColor" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black text-slate-50 md:text-2xl">ThermaLab</h1>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-300">
              Laboratorio virtual de transferencia de calor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <nav className="hidden shrink-0 items-center gap-1 md:flex" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  title={`${item.label} (${item.shortcut})`}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition active:scale-[0.97] ${
                    active
                      ? 'bg-cyan-400/18 text-cyan-100 ring-1 ring-cyan-300/45'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-50'
                  }`}
                >
                  <Icon size={17} strokeWidth={active ? 2.6 : 2.2} aria-hidden="true" />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={onOpenHelp}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800/80 hover:text-slate-50"
            aria-label="Abrir guía de laboratorio"
            title="Guía (?)"
          >
            <CircleHelp size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Guía</span>
          </button>
        </div>
      </div>
    </header>
  );
}
