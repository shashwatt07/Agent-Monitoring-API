import React from 'react';
import { PieChart, ShieldAlert } from 'lucide-react';

interface StatusChartProps {
  total: number;
  active: number;
  inactive: number;
  error: number;
}

export const StatusChart: React.FC<StatusChartProps> = ({
  total,
  active,
  inactive,
  error,
}) => {
  if (total === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[220px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <PieChart className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Agent Telemetry</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Register your first agent to view real-time fleet health and distribution metrics.
        </p>
      </div>
    );
  }

  const activePct = Math.round((active / total) * 100);
  const inactivePct = Math.round((inactive / total) * 100);
  const errorPct = Math.round((error / total) * 100);

  // SVG circular gauge math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const activeStroke = (active / total) * circumference;
  const inactiveStroke = (inactive / total) * circumference;
  const errorStroke = (error / total) * circumference;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Fleet Status Distribution</h3>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
          {total} Total
        </span>
      </div>

      <div className="py-4 flex items-center justify-around gap-6">
        {/* SVG Donut */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active (Emerald) */}
            {active > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#10b981"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${activeStroke} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )}
            {/* Inactive (Amber) */}
            {inactive > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#f59e0b"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${inactiveStroke} ${circumference}`}
                strokeDashoffset={`-${activeStroke}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )}
            {/* Error (Rose) */}
            {error > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#ef4444"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${errorStroke} ${circumference}`}
                strokeDashoffset={`-${activeStroke + inactiveStroke}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )}
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-extrabold text-slate-900 leading-none">
              {activePct}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Active</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{active}</span>
              <span className="text-slate-400 text-[11px]">({activePct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-medium text-slate-700">Inactive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{inactive}</span>
              <span className="text-slate-400 text-[11px]">({inactivePct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="font-medium text-slate-700">Error State</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{error}</span>
              <span className="text-slate-400 text-[11px]">({errorPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {error > 0 && (
        <div className="mt-2 p-2.5 bg-rose-50 rounded-lg border border-rose-100 flex items-center gap-2 text-xs text-rose-700">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>
            {error} agent(s) currently flagged with errors. Immediate action required.
          </span>
        </div>
      )}
    </div>
  );
};
