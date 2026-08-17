import { useMemo } from 'react';
import type { Mechanism, NewSimulation, SavedSimulation } from '../types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'thermalab:history';

const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `sim-${Date.now()}-${Math.round(Math.random() * 10000)}`;

export function useSimulationHistory() {
  const [simulations, setSimulations] = useLocalStorage<SavedSimulation[]>(STORAGE_KEY, []);

  const saveSimulation = (simulation: NewSimulation) => {
    const saved: SavedSimulation = {
      ...simulation,
      id: createId(),
      timestamp: new Date().toISOString(),
    };
    setSimulations((current) => [saved, ...current]);
    return saved;
  };

  const deleteSimulation = (id: string) => {
    setSimulations((current) => current.filter((simulation) => simulation.id !== id));
  };

  const updateSimulationName = (id: string, name: string) => {
    setSimulations((current) =>
      current.map((simulation) => (simulation.id === id ? { ...simulation, name } : simulation)),
    );
  };

  const duplicateSimulation = (id: string) => {
    const source = simulations.find((simulation) => simulation.id === id);
    if (!source) return null;
    return saveSimulation({
      name: `${source.name} (copia)`,
      module: source.module,
      practice: source.practice,
      parameters: source.parameters,
      results: source.results,
    });
  };

  const importSimulations = (incoming: SavedSimulation[]) => {
    const stamped = incoming.map((simulation) => ({
      ...simulation,
      id: createId(),
      timestamp: simulation.timestamp || new Date().toISOString(),
    }));
    setSimulations((current) => [...stamped, ...current]);
    return stamped.length;
  };

  const resetHistory = () => {
    setSimulations([]);
  };

  const stats = useMemo(() => {
    const last = simulations[0] ?? null;
    const practices = new Set(simulations.map((simulation) => simulation.practice).filter(Boolean));
    const modules = new Set<Mechanism>(simulations.map((simulation) => simulation.module));
    return {
      total: simulations.length,
      lastModule: last?.module ?? null,
      completedPractices: practices.size,
      activeModules: modules.size,
    };
  }, [simulations]);

  return {
    simulations,
    stats,
    saveSimulation,
    deleteSimulation,
    updateSimulationName,
    duplicateSimulation,
    importSimulations,
    resetHistory,
  };
}
