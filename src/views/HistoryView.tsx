import { useMemo, useRef, useState } from 'react';
import { Copy, FolderOpen, History, Search, Trash2, Upload } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ExportButton } from '../components/ui/ExportButton';
import { parseImportedSimulations } from '../lib/simulationGuard';
import type { Mechanism, SavedSimulation } from '../types';

const moduleLabel: Record<Mechanism, string> = {
  conduction: 'Conducción',
  convection: 'Convección',
  radiation: 'Radiación',
};

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

interface HistoryViewProps {
  simulations: SavedSimulation[];
  onLoad: (simulation: SavedSimulation) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onNameChange: (id: string, name: string) => void;
  onImport: (simulations: SavedSimulation[]) => void;
  onNotice: (message: string) => void;
}

export function HistoryView({
  simulations,
  onLoad,
  onDelete,
  onDuplicate,
  onNameChange,
  onImport,
  onNotice,
}: HistoryViewProps) {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<Mechanism | 'all'>('all');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<SavedSimulation | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return simulations.filter((simulation) => {
      if (moduleFilter !== 'all' && simulation.module !== moduleFilter) return false;
      if (!needle) return true;
      return (
        simulation.name.toLowerCase().includes(needle) ||
        simulation.practice.toLowerCase().includes(needle)
      );
    });
  }, [moduleFilter, query, simulations]);

  const compared = simulations.filter((simulation) => compareIds.includes(simulation.id)).slice(0, 2);

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) return [current[1], id];
      return [...current, id];
    });
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseImportedSimulations(text);
      if (imported.length === 0) {
        onNotice('No se encontraron simulaciones válidas.');
        return;
      }
      onImport(imported);
      onNotice(`Importadas: ${imported.length}`);
    } catch {
      onNotice('No se pudo leer el JSON.');
    }
  };

  if (simulations.length === 0) {
    return (
      <Card title="Historial de prácticas" subtitle="Aún no hay simulaciones guardadas.">
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 p-6 text-center">
          <History size={36} className="text-slate-500" aria-hidden="true" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            Guarda una práctica desde cualquier módulo para cargarla, duplicarla o exportar sus resultados.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/12 px-3 py-2 text-sm font-semibold text-cyan-100"
          >
            <Upload size={16} aria-hidden="true" />
            Importar JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImportFile(file);
              event.target.value = '';
            }}
          />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="neutral">Prácticas guardadas</Badge>
        <h2 className="mt-3 text-2xl font-extrabold text-slate-50">Historial de prácticas</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Filtra, compara dos corridas, duplica o importa un JSON exportado antes.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-500" aria-hidden="true" />
          <input
            className="h-11 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 pl-9 pr-3 text-sm text-slate-100"
            placeholder="Buscar por nombre o práctica"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar simulaciones"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'conduction', 'convection', 'radiation'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setModuleFilter(id)}
              className={`min-h-10 rounded-lg px-3 text-sm font-semibold ${
                moduleFilter === id
                  ? 'bg-cyan-400/18 text-cyan-100 ring-1 ring-cyan-300/45'
                  : 'bg-slate-800/70 text-slate-300'
              }`}
            >
              {id === 'all' ? 'Todas' : moduleLabel[id]}
            </button>
          ))}
          <ExportButton filename="thermalab-historial.json" data={simulations} label="Exportar todo" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-500/50 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-100"
          >
            <Upload size={16} aria-hidden="true" />
            Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImportFile(file);
              event.target.value = '';
            }}
          />
        </div>
      </div>

      {compared.length === 2 && (
        <Card title="Comparación" subtitle="Dos corridas lado a lado">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th className="pb-2 pr-3 font-semibold">Magnitud</th>
                  {compared.map((item) => (
                    <th key={item.id} className="pb-2 pr-3 font-semibold text-slate-200">
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(compared.flatMap((item) => Object.keys(item.results)))).map((key) => (
                  <tr key={key} className="border-t border-slate-800">
                    <td className="py-2 pr-3 font-mono-num text-slate-400">{key}</td>
                    {compared.map((item) => (
                      <td key={item.id} className="font-mono-num py-2 pr-3 text-slate-100">
                        {String(item.results[key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {filtered.map((simulation) => (
          <article key={simulation.id} className="lab-panel rounded-xl p-4 transition hover:border-slate-600">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge tone={moduleTone[simulation.module]}>{moduleLabel[simulation.module]}</Badge>
                  <span className="text-xs font-semibold text-slate-400">{formatDate(simulation.timestamp)}</span>
                  <label className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <input
                      type="checkbox"
                      checked={compareIds.includes(simulation.id)}
                      onChange={() => toggleCompare(simulation.id)}
                    />
                    Comparar
                  </label>
                </div>
                <input
                  className="h-11 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 text-sm font-bold text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                  value={simulation.name}
                  onChange={(event) => onNameChange(simulation.id, event.target.value)}
                  aria-label="Nombre de la simulación"
                />
                <p className="mt-2 text-sm text-slate-300">{simulation.practice}</p>
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
                <button
                  type="button"
                  onClick={() => onDuplicate(simulation.id)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-500/50 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700/70"
                >
                  <Copy size={16} aria-hidden="true" />
                  Duplicar
                </button>
                <ExportButton filename={`${simulation.name || 'simulacion'}.json`} data={simulation} />
                <button
                  type="button"
                  onClick={() => setPendingDelete(simulation)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-400/40 bg-red-500/12 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 active:scale-[0.98]"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar simulación"
        message={`¿Eliminar «${pendingDelete?.name ?? ''}» del historial local? Esta acción no se puede deshacer.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
