import React from 'react';
import { Plus, RotateCw } from 'lucide-react';
import { HealthIndicator } from './HealthIndicator';
import type { HealthStatus } from '../types/agent';

interface NavbarProps {
  health: HealthStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  loading,
  onRefresh,
  onOpenRegister,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Agent Monitoring API
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Live telemetry, status governance, and AI-assisted health evaluations.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <HealthIndicator health={health} loading={loading} onRefresh={onRefresh} />

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh All Data"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          onClick={onOpenRegister}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer hover:shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Register Agent</span>
        </button>
      </div>
    </header>
  );
};
