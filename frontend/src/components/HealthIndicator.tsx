import React from 'react';
import { Database, Server, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { HealthStatus } from '../types/agent';

interface HealthIndicatorProps {
  health: HealthStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ health, loading, onRefresh }) => {
  const isHealthy = health?.status === 'healthy' && health.database === 'connected';
  const isDegraded = health?.status === 'degraded' || (health && health.database !== 'connected');
  const isOffline = !health || health.status === 'offline';

  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm text-xs">
      {/* Backend API Status */}
      <div className="flex items-center gap-1.5" title={`FastAPI Backend: ${isOffline ? 'Offline' : 'Online'}`}>
        <Server className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-medium text-slate-700">API:</span>
        <span className="flex items-center gap-1 font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              isOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
            }`}
          />
          <span className={isOffline ? 'text-rose-600' : 'text-emerald-700'}>
            {isOffline ? 'Offline' : 'Online'}
          </span>
        </span>
      </div>

      <div className="w-px h-3.5 bg-slate-200" />

      {/* Database Status */}
      <div
        className="flex items-center gap-1.5"
        title={`Database: ${health?.database || 'disconnected'} (${health?.database_type || 'Supabase'})`}
      >
        <Database className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-medium text-slate-700">DB:</span>
        <span className="flex items-center gap-1 font-semibold">
          {isHealthy && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          {isDegraded && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
          {isOffline && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
          <span
            className={
              isHealthy
                ? 'text-emerald-700'
                : isDegraded
                ? 'text-amber-600'
                : 'text-rose-600'
            }
          >
            {isHealthy ? 'Supabase Connected' : isDegraded ? 'DB Degraded' : 'Disconnected'}
          </span>
        </span>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="ml-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
        title="Refresh health status"
      >
        <span className={loading ? 'inline-block animate-spin' : ''}>↻</span>
      </button>
    </div>
  );
};
