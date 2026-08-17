import type { Mechanism, SavedSimulation, SimulationValue } from '../types';

const MECHANISMS: Mechanism[] = ['conduction', 'convection', 'radiation'];

const isSimulationValue = (value: unknown): value is SimulationValue =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValueRecord = (value: unknown): value is Record<string, SimulationValue> =>
  isRecord(value) && Object.values(value).every(isSimulationValue);

export const isSavedSimulation = (value: unknown): value is SavedSimulation => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    MECHANISMS.includes(value.module as Mechanism) &&
    typeof value.practice === 'string' &&
    typeof value.timestamp === 'string' &&
    isValueRecord(value.parameters) &&
    isValueRecord(value.results)
  );
};

export const parseImportedSimulations = (raw: string): SavedSimulation[] => {
  const parsed: unknown = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    const valid = parsed.filter(isSavedSimulation);
    if (valid.length === 0) throw new Error('El archivo no contiene simulaciones de ThermaLab.');
    return valid;
  }
  if (isSavedSimulation(parsed)) return [parsed];
  throw new Error('El archivo no contiene simulaciones de ThermaLab.');
};
