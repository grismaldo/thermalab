import { Printer } from 'lucide-react';
import { formatNumber } from '../../lib/calculations';
import type { SimulationValue } from '../../types';

interface PrintReportButtonProps {
  title: string;
  module: string;
  practice: string;
  parameters: Record<string, SimulationValue>;
  results: Record<string, SimulationValue>;
  formula?: string;
  substituted?: string;
  interpretation?: string;
}

const formatValue = (value: SimulationValue): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return formatNumber(value, 4);
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
};

export function PrintReportButton({
  title,
  module,
  practice,
  parameters,
  results,
  formula,
  substituted,
  interpretation,
}: PrintReportButtonProps) {
  const handlePrint = () => {
    const container = document.getElementById('thermalab-print-report');
    if (!container) return;

    const paramRows = Object.entries(parameters)
      .map(([key, value]) => `<tr><td>${key}</td><td>${formatValue(value)}</td></tr>`)
      .join('');
    const resultRows = Object.entries(results)
      .map(([key, value]) => `<tr><td>${key}</td><td>${formatValue(value)}</td></tr>`)
      .join('');

    container.innerHTML = `
      <article style="font-family: 'Rethink Sans', sans-serif; padding: 24px; color: #0f172a;">
        <h1 style="font-size: 22px; margin: 0 0 4px;">ThermaLab — Informe de práctica</h1>
        <p style="margin: 0 0 16px; color: #475569;">Universidad Técnica de Manabí · Transferencia de calor</p>
        <h2 style="font-size: 18px; margin: 0 0 8px;">${title}</h2>
        <p style="margin: 0 0 4px;"><strong>Módulo:</strong> ${module}</p>
        <p style="margin: 0 0 16px;"><strong>Práctica:</strong> ${practice}</p>
        <h3 style="font-size: 15px; margin: 16px 0 8px;">Parámetros</h3>
        <table style="width:100%; border-collapse: collapse; font-size: 13px;">
          <thead><tr><th style="text-align:left; border-bottom:1px solid #cbd5e1; padding:6px;">Variable</th><th style="text-align:left; border-bottom:1px solid #cbd5e1; padding:6px;">Valor</th></tr></thead>
          <tbody>${paramRows}</tbody>
        </table>
        <h3 style="font-size: 15px; margin: 16px 0 8px;">Resultados</h3>
        <table style="width:100%; border-collapse: collapse; font-size: 13px;">
          <thead><tr><th style="text-align:left; border-bottom:1px solid #cbd5e1; padding:6px;">Magnitud</th><th style="text-align:left; border-bottom:1px solid #cbd5e1; padding:6px;">Valor</th></tr></thead>
          <tbody>${resultRows}</tbody>
        </table>
        ${
          formula
            ? `<h3 style="font-size: 15px; margin: 16px 0 8px;">Fórmula</h3><pre style="background:#f1f5f9; padding:12px; border-radius:8px; white-space:pre-wrap;">${formula}</pre>`
            : ''
        }
        ${
          substituted
            ? `<pre style="background:#fff7ed; padding:12px; border-radius:8px; white-space:pre-wrap;">${substituted}</pre>`
            : ''
        }
        ${interpretation ? `<p style="margin-top:16px; font-size:13px;">${interpretation}</p>` : ''}
        <p style="margin-top:24px; font-size:11px; color:#64748b;">Generado con ThermaLab · ${new Date().toLocaleString('es-EC')}</p>
      </article>
    `;

    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-500/50 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400/60 hover:bg-slate-700/70 active:scale-[0.98]"
    >
      <Printer size={16} aria-hidden="true" />
      <span>Informe PDF</span>
    </button>
  );
}
