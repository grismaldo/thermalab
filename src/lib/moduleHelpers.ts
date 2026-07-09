import type { SimulationValue } from '../types';

export const selectClass =
  'h-11 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 pr-10 text-sm font-semibold text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30';

export const inputClass =
  'h-11 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 text-sm text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30';

export const numberFrom = (value: SimulationValue | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const stringFrom = (value: SimulationValue | undefined, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

export const INVALID = '—';
export const INPUT_ERROR = 'Revisa los valores ingresados.';
