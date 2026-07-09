import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Flame,
  FolderOpen,
  History,
  Layers3,
  Play,
  Save,
  SlidersHorizontal,
  Trash2,
  Waves,
  ThermometerSun,
} from 'lucide-react';
import { Header } from './components/layout/Header';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { Badge } from './components/ui/Badge';
import { Card } from './components/ui/Card';
import { ExportButton } from './components/ui/ExportButton';
import { ConductionModule } from './features/conduction/ConductionModule';
import { ConvectionModule } from './features/convection/ConvectionModule';
import { RadiationModule } from './features/radiation/RadiationModule';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSimulationHistory } from './hooks/useSimulationHistory';
import type { Mechanism, NewSimulation, SavedSimulation, ViewId } from './types';

const moduleLabel: Record<Mechanism, string> = {
  conduction: 'Conducción',
  convection: 'Convección',
  radiation: 'Radiación',
};

const developers = 'Velazco De la Cruz Byron Esteban';

const moduleTone: Record<Mechanism, 'warm' | 'cold' | 'rad'> = {
  conduction: 'warm',
  convection: 'cold',
  radiation: 'rad',
};

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));

function Dashboard({
  onNavigate,
  stats,
}: {
  onNavigate: (view: ViewId) => void;
  stats: {
    total: number;
    completedPractices: number;
    activeModules: number;
    lastModule: Mechanism | null;
  };
}) {
  const cards = [
    {
      id: 'conduction' as const,
      title: 'Conducción',
      icon: Flame,
      tone: 'warm' as const,
      copy: 'Pared plana, multicapa, cilindro y esfera. Resistencias y perfiles térmicos.',
    },
    {
      id: 'convection' as const,
      title: 'Convección',
      icon: Waves,
      tone: 'cold' as const,
      copy: 'Placa o cilindro, caudal, Re/Nu/Pr y comparación natural vs forzada.',
    },
    {
      id: 'radiation' as const,
      title: 'Radiación',
      icon: ThermometerSun,
      tone: 'rad' as const,
      copy: 'Cuerpo negro, superficies grises y balance emitido–absorbido–neto.',
    },
  ];

  const steps = [
    {
      icon: SlidersHorizontal,
      title: 'Ajusta variables',
      copy: 'Materiales, fluidos, geometría y temperaturas en tiempo real.',
    },
    {
      icon: Play,
      title: 'Observa resultados',
      copy: 'Diagramas, fórmulas sustituidas y gráficos científicos al instante.',
    },
    {
      icon: Save,
      title: 'Guarda e informa',
      copy: 'Historial local, export JSON e informe imprimible para la entrega.',
    },
  ];

  return (
    <div className="space-y-5">
      <section className="lab-panel relative overflow-hidden rounded-2xl p-5 md:p-7">
        <div className="thermal-strip mb-5 h-1.5 rounded-full" />
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 size-48 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="relative">
          <Badge tone="neutral">Laboratorio virtual · UTM</Badge>
          <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-50 md:text-5xl">
            ThermaLab
          </h2>
          <p className="mt-2 text-lg font-semibold text-cyan-100/90 md:text-xl">
            Consola de transferencia de calor
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
            Conducción, convección y radiación con física verificable, diagramas animados y prácticas listas
            para demostrar en clase.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate(stats.lastModule ?? 'conduction')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300 active:scale-[0.98]"
            >
              <BarChart3 size={18} aria-hidden="true" />
              {stats.total > 0 ? 'Continuar práctica' : 'Iniciar práctica'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-600/70 bg-slate-900/70 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800/80 active:scale-[0.98]"
            >
              <History size={18} aria-hidden="true" />
              Ver historial
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Simulaciones', value: stats.total, icon: Layers3 },
          { label: 'Prácticas distintas', value: stats.completedPractices, icon: Play },
          { label: 'Módulos usados', value: `${stats.activeModules}/3`, icon: Flame },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="lab-panel rounded-xl px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <Icon size={16} className="text-slate-500" aria-hidden="true" />
              </div>
              <p className="font-mono-num mt-2 text-2xl font-bold text-slate-50">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="lab-panel rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="font-mono-num grid size-8 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-cyan-200">
                  {index + 1}
                </span>
                <Icon size={18} className="text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-100">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{step.copy}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigate(card.id)}
              className="group lab-panel rounded-xl p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:shadow-glow active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-xl border border-slate-700/80 bg-slate-900 transition group-hover:border-cyan-300/30">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <Badge tone={card.tone}>{card.title}</Badge>
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-50">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.copy}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-300 opacity-0 transition group-hover:opacity-100">
                Abrir módulo
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden border-cyan-300/25 bg-slate-950/78">
        <div className="thermal-strip -mx-5 -mt-5 mb-5 h-1.5 md:-mx-5" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-sm font-bold text-cyan-100">
              <Code2 size={16} aria-hidden="true" />
              Desarrollador
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed tracking-tight text-slate-100">
              {developers}
            </p>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            ThermaLab — instrumento educativo para visualizar mecanismos térmicos sin hojas de cálculo.
          </p>
        </div>
      </Card>
    </div>
  );
}

function HistoryView({
  simulations,
  onLoad,
  onDelete,
  onNameChange,
}: {
  simulations: SavedSimulation[];
  onLoad: (simulation: SavedSimulation) => void;
  onDelete: (id: string) => void;
  onNameChange: (id: string, name: string) => void;
}) {
  if (simulations.length === 0) {
    return (
      <Card title="Historial de prácticas" subtitle="Aún no hay simulaciones guardadas.">
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 p-6 text-center">
          <History size={36} className="text-slate-500" aria-hidden="true" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Guarda una práctica desde cualquier módulo para cargarla o exportar sus resultados después.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="neutral">Prácticas guardadas</Badge>
        <h2 className="mt-3 text-2xl font-black text-slate-50">Historial de prácticas</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Edita nombres, carga parámetros previos, elimina registros o exporta resultados.
        </p>
      </div>
      <div className="grid gap-4">
        {simulations.map((simulation) => (
          <article
            key={simulation.id}
            className="lab-panel rounded-xl p-4 transition hover:border-slate-600"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge tone={moduleTone[simulation.module]}>{moduleLabel[simulation.module]}</Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatDate(simulation.timestamp)}
                  </span>
                </div>
                <input
                  className="h-11 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 text-sm font-bold text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                  value={simulation.name}
                  onChange={(event) => onNameChange(simulation.id, event.target.value)}
                  aria-label="Nombre de la simulación"
                />
                <p className="mt-2 text-sm text-slate-400">{simulation.practice}</p>
                <div className="mt-3 grid gap-2 font-mono-num text-xs text-slate-300 md:grid-cols-3">
                  {Object.entries(simulation.results)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <span key={key} className="truncate rounded-md bg-slate-900/80 px-2 py-1">
                        {key}: {String(value)}
                      </span>
                    ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => onLoad(simulation)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/12 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 active:scale-[0.98]"
                >
                  <FolderOpen size={16} aria-hidden="true" />
                  Cargar
                </button>
                <ExportButton filename={`${simulation.name || 'simulacion'}.json`} data={simulation} />
                <button
                  type="button"
                  onClick={() => onDelete(simulation.id)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-300/40 bg-red-400/12 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-400/20 active:scale-[0.98]"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useLocalStorage<ViewId>('thermalab:view', 'dashboard');
  const [loadedSimulation, setLoadedSimulation] = useState<SavedSimulation | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    simulations,
    stats,
    saveSimulation,
    deleteSimulation,
    updateSimulationName,
  } = useSimulationHistory();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleLoaded = useCallback(() => {
    setLoadedSimulation(null);
  }, []);

  const handleSave = (simulation: NewSimulation) => {
    const saved = saveSimulation(simulation);
    setNotice(`Guardado: ${saved.name}`);
  };

  const handleLoad = (simulation: SavedSimulation) => {
    setLoadedSimulation(simulation);
    setActiveView(simulation.module);
    setNotice(`Cargado: ${simulation.name}`);
  };

  const content = useMemo(() => {
    if (activeView === 'conduction') {
      return <ConductionModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />;
    }
    if (activeView === 'convection') {
      return <ConvectionModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />;
    }
    if (activeView === 'radiation') {
      return <RadiationModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />;
    }
    if (activeView === 'history') {
      return (
        <HistoryView
          simulations={simulations}
          onLoad={handleLoad}
          onDelete={deleteSimulation}
          onNameChange={updateSimulationName}
        />
      );
    }
    return <Dashboard onNavigate={setActiveView} stats={stats} />;
  }, [
    activeView,
    deleteSimulation,
    handleLoaded,
    loadedSimulation,
    simulations,
    stats,
    updateSimulationName,
  ]);

  return (
    <div className="min-h-screen">
      <Header activeView={activeView} onNavigate={setActiveView} />
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="no-print animate-fade-in-up fixed right-4 top-24 z-40 flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-glow backdrop-blur-sm"
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          {notice}
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 md:px-6 md:pb-5">
        <AnimatePresence mode="wait">
          <motion.section
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="min-w-0"
          >
            {content}
          </motion.section>
        </AnimatePresence>
      </main>
      <div id="thermalab-print-report" className="print-report" aria-hidden="true" />
      <BottomTabBar activeView={activeView} onNavigate={setActiveView} />
      <footer className="no-print mx-auto max-w-7xl px-4 pb-6 text-xs text-slate-500 md:px-6">
        <span>ThermaLab — Transferencia de calor</span>
      </footer>
    </div>
  );
}
