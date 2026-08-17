interface PracticeBannerProps {
  name: string;
  objective: string;
}

export function PracticeBanner({ name, objective }: PracticeBannerProps) {
  return (
    <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/8 px-4 py-3">
      <p className="text-sm font-bold text-slate-100">{name}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-300">{objective}</p>
    </div>
  );
}
