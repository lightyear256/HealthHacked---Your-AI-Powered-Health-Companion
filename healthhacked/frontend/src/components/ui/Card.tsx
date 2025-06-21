import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={clsx('bg-gradient-to-br from-slate-800/50 to-slate-900/50  rounded-lg backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300', className)}>
      {children}
    </div>
  );
}