import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  total: number;
  icon: LucideIcon;
  variant: 'default' | 'active' | 'inactive' | 'error';
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  total,
  icon: Icon,
  variant,
  subtitle,
  onClick,
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const variantStyles = {
    default: {
      border: 'border-slate-200 hover:border-slate-300',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      iconBg: 'bg-indigo-500/10 text-indigo-600',
      progress: 'bg-indigo-600',
    },
    active: {
      border: 'border-emerald-200 hover:border-emerald-300',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      progress: 'bg-emerald-600',
    },
    inactive: {
      border: 'border-amber-200 hover:border-amber-300',
      badge: 'bg-amber-50 text-amber-700 border-amber-100',
      iconBg: 'bg-amber-500/10 text-amber-600',
      progress: 'bg-amber-500',
    },
    error: {
      border: 'border-rose-200 hover:border-rose-300',
      badge: 'bg-rose-50 text-rose-700 border-rose-100',
      iconBg: 'bg-rose-500/10 text-rose-600',
      progress: 'bg-rose-600',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border ${variantStyles.border} shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${variantStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
        {variant !== 'default' && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${variantStyles.badge}`}
          >
            {percentage}%
          </span>
        )}
      </div>

      {variant !== 'default' && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${variantStyles.progress}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
