import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartPoint } from '../../types';

interface ComparisonBarChartProps {
  data: ChartPoint[];
  dataKey: string;
  name: string;
  color?: string;
  emptyMessage?: string;
}

export function ComparisonBarChart({
  data,
  dataKey,
  name,
  color = '#f97316',
  emptyMessage = 'Revisa los valores ingresados para ver la comparación.',
}: ComparisonBarChartProps) {
  if (!data.length) {
    return (
      <div className="grid h-72 w-full place-items-center rounded-xl border border-dashed border-slate-700/70 bg-slate-950/40 px-6 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 28 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.24)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} interval={0} angle={-12} dy={14} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              borderRadius: 8,
              color: '#f1f5f9',
            }}
          />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
