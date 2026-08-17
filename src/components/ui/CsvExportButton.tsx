import { FileSpreadsheet } from 'lucide-react';
import { downloadTextFile, recordsToCsv } from '../../lib/csv';
import type { SimulationValue } from '../../types';

interface CsvExportButtonProps {
  filename: string;
  records: Array<Record<string, SimulationValue>>;
}

export function CsvExportButton({ filename, records }: CsvExportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadTextFile(filename, recordsToCsv(records), 'text/csv;charset=utf-8')}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-500/50 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400/60 hover:bg-slate-700/70 active:scale-[0.98]"
    >
      <FileSpreadsheet size={16} aria-hidden="true" />
      <span>CSV</span>
    </button>
  );
}
