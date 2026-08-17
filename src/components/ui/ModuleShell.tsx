import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Badge } from './Badge';

interface PracticeAction {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  tone?: 'warm' | 'cold' | 'rad';
}

interface ModuleShellProps {
  badge: string;
  badgeTone: 'warm' | 'cold' | 'rad' | 'neutral';
  title: string;
  description: string;
  practices: PracticeAction[];
  children: ReactNode;
}

const toneClass: Record<NonNullable<PracticeAction['tone']>, string> = {
  warm: 'border-orange-300/40 bg-orange-400/12 text-orange-100 hover:bg-orange-400/20',
  cold: 'border-cyan-300/40 bg-cyan-400/12 text-cyan-100 hover:bg-cyan-400/20',
  rad: 'border-fuchsia-300/40 bg-fuchsia-400/12 text-fuchsia-100 hover:bg-fuchsia-400/20',
};

export function ModuleShell({
  badge,
  badgeTone,
  title,
  description,
  practices,
  children,
}: ModuleShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="space-y-5"
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge tone={badgeTone}>{badge}</Badge>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-50 md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {practices.map((practice) => (
            <button
              key={practice.label}
              type="button"
              onClick={practice.onClick}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                toneClass[practice.tone ?? 'cold']
              }`}
            >
              {practice.icon}
              {practice.label}
            </button>
          ))}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
