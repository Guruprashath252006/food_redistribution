import React from 'react';
import { cn } from '../../lib/cn';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20',
  secondary:
    'bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900',
  ghost:
    'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export default function Button({
  asChild = false,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) {
  const Comp = asChild ? 'span' : 'button';
  return (
    <Comp
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

