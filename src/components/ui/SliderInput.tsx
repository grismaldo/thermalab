interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  error?: string | null;
  hint?: string;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  error,
  hint,
}: SliderInputProps) {
  const id = label.replace(/\s+/g, '-').toLowerCase();

  return (
    <label className="block" htmlFor={`${id}-number`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-200">{label}</span>
        <span className="rounded-md bg-slate-800/80 px-2 py-0.5 font-mono text-xs text-slate-300">{unit}</span>
      </div>
      <div className="grid grid-cols-[1fr_112px] items-center gap-3">
        <input
          id={`${id}-range`}
          className={`thermal-slider ${error ? 'thermal-slider-error' : ''}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : min}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={`${label} (control deslizante)`}
          aria-invalid={Boolean(error)}
        />
        <input
          id={`${id}-number`}
          className="h-10 rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 text-right font-mono text-sm text-slate-100 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-invalid={Boolean(error)}
        />
      </div>
      {hint && !error && <p className="mt-2 font-mono-num text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-2 text-xs font-medium text-red-300">{error}</p>}
    </label>
  );
}
