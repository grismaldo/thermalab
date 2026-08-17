import { ArrowRight, Flame, Play, ThermometerSun, Waves } from 'lucide-react';
import { HeroVisual } from '../components/charts/HeroVisual';
import { Badge } from '../components/ui/Badge';
import type { Mechanism, ViewId } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewId) => void;
  stats: {
    total: number;
    completedPractices: number;
    activeModules: number;
    lastModule: Mechanism | null;
  };
}

const cards = [
  {
    id: 'conduction' as const,
    title: 'Conducción',
    icon: Flame,
    tone: 'warm' as const,
    copy: 'Pared plana, multicapa, cilindro y esfera. Resistencias, perfiles y radio crítico.',
  },
  {
    id: 'convection' as const,
    title: 'Convección',
    icon: Waves,
    tone: 'cold' as const,
    copy: 'Placa o cilindro, caudal, Re/Nu/Pr, Biot y natural vs forzada.',
  },
  {
    id: 'radiation' as const,
    title: 'Radiación',
    icon: ThermometerSun,
    tone: 'rad' as const,
    copy: 'Cuerpo negro, Wien, superficies grises y balance emitido–absorbido–neto.',
  },
];

const steps = [
  { n: '01', title: 'Ajusta variables', copy: 'Materiales, fluidos, geometría y temperaturas en vivo.' },
  { n: '02', title: 'Observa el fenómeno', copy: 'Diagrama, fórmula sustituida y gráficos al instante.' },
  { n: '03', title: 'Guarda e informa', copy: 'Historial local, JSON, CSV e informe imprimible.' },
];

export function Dashboard({ onNavigate, stats }: DashboardProps) {
  return (
    <div className="space-y-10">
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge tone="neutral">Laboratorio virtual · UTM</Badge>
          <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-slate-50 md:text-6xl">
            ThermaLab
          </h2>
          <p className="mt-3 max-w-xl text-lg font-semibold text-cyan-100 md:text-xl">
            Ves el calor. No una hoja de cálculo.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
            Conducción, convección y radiación con física verificable — Fourier, Newton y Stefan-Boltzmann —
            listas para demostrar en clase.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => onNavigate(stats.lastModule ?? 'conduction')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300 active:scale-[0.98]"
            >
              <Play size={18} aria-hidden="true" />
              {stats.total > 0 ? 'Continuar práctica' : 'Empezar por conducción'}
            </button>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigate(card.id)}
              className="group lab-panel rounded-xl p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/35 active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-xl border border-slate-700/80 bg-slate-900 transition group-hover:border-cyan-300/30">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <Badge tone={card.tone}>{card.title}</Badge>
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-slate-50">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.copy}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-300 opacity-0 transition group-hover:opacity-100">
                Abrir módulo
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </section>

      <ol className="grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <li key={step.n}>
            <p className="font-mono-num text-xs font-bold tracking-widest text-cyan-300">{step.n}</p>
            <h3 className="mt-2 text-base font-extrabold text-slate-50">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{step.copy}</p>
          </li>
        ))}
      </ol>

      <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-800/80 pt-5 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Simulaciones</dt>
          <dd className="font-mono-num mt-1 text-xl font-bold text-slate-50">{stats.total}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prácticas distintas</dt>
          <dd className="font-mono-num mt-1 text-xl font-bold text-slate-50">{stats.completedPractices}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Módulos usados</dt>
          <dd className="font-mono-num mt-1 text-xl font-bold text-slate-50">{stats.activeModules}/3</dd>
        </div>
      </dl>
    </div>
  );
}
