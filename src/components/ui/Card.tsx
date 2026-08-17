import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <section className={`lab-panel rounded-xl p-4 md:p-5 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4 border-b border-slate-800/80 pb-4">
          {title && <h2 className="text-lg font-bold tracking-tight text-slate-50">{title}</h2>}
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
