import React from 'react';
import { cn } from '../../lib/cn';

export default function Brand({ className, size = 'md', showText = true }) {
  const sizes = {
    sm: { img: 'h-7 w-7', text: 'text-sm' },
    md: { img: 'h-8 w-8', text: 'text-base' },
    lg: { img: 'h-10 w-10', text: 'text-lg' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      <div className="shrink-0 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm p-1.5">
        <img
          src="/logo.svg"
          alt="HungerXchange Logo"
          className={cn(s.img, 'object-contain')}
          loading="eager"
          decoding="async"
        />
      </div>
      {showText ? (
        <div className="min-w-0 leading-tight">
          <p className={cn('font-black tracking-tight text-slate-900 dark:text-white', s.text)}>
            HungerXchange
          </p>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            Food Redistribution
          </p>
        </div>
      ) : null}
    </div>
  );
}

