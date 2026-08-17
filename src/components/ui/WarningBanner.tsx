import { AlertTriangle, Info } from 'lucide-react';

interface WarningBannerProps {
  message: string | null;
  tone?: 'warn' | 'info';
}

export function WarningBanner({ message, tone = 'warn' }: WarningBannerProps) {
  if (!message) return null;

  const Icon = tone === 'info' ? Info : AlertTriangle;
  const classes =
    tone === 'info'
      ? 'border-cyan-300/35 bg-cyan-400/10 text-cyan-100'
      : 'border-red-400/40 bg-red-500/12 text-red-100';

  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm leading-relaxed ${classes}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
