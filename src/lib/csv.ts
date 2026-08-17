import type { SimulationValue } from '../types';

const escapeCell = (value: SimulationValue): string => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

export const recordsToCsv = (records: Array<Record<string, SimulationValue>>): string => {
  const keys = Array.from(new Set(records.flatMap((record) => Object.keys(record))));
  const header = keys.join(',');
  const rows = records.map((record) => keys.map((key) => escapeCell(record[key] ?? null)).join(','));
  return [header, ...rows].join('\n');
};

export const downloadTextFile = (filename: string, contents: string, mime = 'text/plain'): void => {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
