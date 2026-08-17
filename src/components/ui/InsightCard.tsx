interface InsightCardProps {
  title: string;
  value: string;
  unit?: string;
  note: string;
}

export function InsightCard({ title, value, unit, note }: InsightCardProps) {
  return (
    <article className="rounded-xl border border-[color:var(--thermal-border)] bg-slate-950/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="font-mono-num mt-2 text-xl font-bold text-slate-50">
        {value}
        {unit ? <span className="ml-1.5 text-sm font-semibold text-slate-300">{unit}</span> : null}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{note}</p>
    </article>
  );
}
