import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Header } from './components/layout/Header';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSimulationHistory } from './hooks/useSimulationHistory';
import type { NewSimulation, SavedSimulation, ViewId } from './types';
import { Dashboard } from './views/Dashboard';
import { HelpPanel } from './views/HelpPanel';
import { HistoryView } from './views/HistoryView';

const ConductionModule = lazy(() =>
  import('./features/conduction/ConductionModule').then((mod) => ({ default: mod.ConductionModule })),
);
const ConvectionModule = lazy(() =>
  import('./features/convection/ConvectionModule').then((mod) => ({ default: mod.ConvectionModule })),
);
const RadiationModule = lazy(() =>
  import('./features/radiation/RadiationModule').then((mod) => ({ default: mod.RadiationModule })),
);

const developers = 'Grismaldo Bope';

function ModuleFallback() {
  return (
    <div className="lab-panel grid min-h-64 place-items-center rounded-xl text-sm text-slate-300">
      Cargando módulo…
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useLocalStorage<ViewId>('thermalab:view', 'dashboard');
  const [loadedSimulation, setLoadedSimulation] = useState<SavedSimulation | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const {
    simulations,
    stats,
    saveSimulation,
    deleteSimulation,
    updateSimulationName,
    duplicateSimulation,
    importSimulations,
  } = useSimulationHistory();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleLoaded = useCallback(() => {
    setLoadedSimulation(null);
  }, []);

  const handleSave = useCallback(
    (simulation: NewSimulation) => {
      const saved = saveSimulation(simulation);
      setNotice(`Guardado: ${saved.name}`);
    },
    [saveSimulation],
  );

  const handleLoad = useCallback((simulation: SavedSimulation) => {
    setLoadedSimulation(simulation);
    setActiveView(simulation.module);
    setNotice(`Cargado: ${simulation.name}`);
  }, [setActiveView]);

  const handleDuplicate = useCallback(
    (id: string) => {
      const copy = duplicateSimulation(id);
      if (copy) setNotice(`Duplicado: ${copy.name}`);
    },
    [duplicateSimulation],
  );

  useKeyboardShortcuts({
    onNavigate: setActiveView,
    onToggleHelp: () => setHelpOpen((open) => !open),
    onCloseHelp: () => setHelpOpen(false),
  });

  const content = useMemo(() => {
    if (activeView === 'conduction') {
      return (
        <Suspense fallback={<ModuleFallback />}>
          <ConductionModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />
        </Suspense>
      );
    }
    if (activeView === 'convection') {
      return (
        <Suspense fallback={<ModuleFallback />}>
          <ConvectionModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />
        </Suspense>
      );
    }
    if (activeView === 'radiation') {
      return (
        <Suspense fallback={<ModuleFallback />}>
          <RadiationModule loadedSimulation={loadedSimulation} onLoaded={handleLoaded} onSave={handleSave} />
        </Suspense>
      );
    }
    if (activeView === 'history') {
      return (
        <HistoryView
          simulations={simulations}
          onLoad={handleLoad}
          onDelete={deleteSimulation}
          onDuplicate={handleDuplicate}
          onNameChange={updateSimulationName}
          onImport={importSimulations}
          onNotice={setNotice}
        />
      );
    }
    return <Dashboard onNavigate={setActiveView} stats={stats} />;
  }, [
    activeView,
    deleteSimulation,
    handleDuplicate,
    handleLoad,
    handleLoaded,
    handleSave,
    importSimulations,
    loadedSimulation,
    simulations,
    stats,
    updateSimulationName,
    setActiveView,
  ]);

  return (
    <div className="min-h-screen">
      <a href="#contenido" className="skip-link no-print">
        Saltar al contenido
      </a>
      <Header activeView={activeView} onNavigate={setActiveView} onOpenHelp={() => setHelpOpen(true)} />
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="no-print animate-fade-in-up fixed right-4 top-24 z-40 flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 backdrop-blur-sm"
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          {notice}
        </div>
      )}
      <main id="contenido" className="mx-auto max-w-7xl px-4 pb-28 pt-5 md:px-6 md:pb-5">
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
      <footer className="no-print mx-auto max-w-7xl px-4 pb-6 text-xs text-slate-400 md:px-6">
        <span>ThermaLab — Transferencia de calor · {developers}</span>
      </footer>
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
