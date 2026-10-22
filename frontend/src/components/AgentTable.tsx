import React from 'react';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Bot,
  AlertCircle,
  PauseCircle,
  X,
} from 'lucide-react';
import type { Agent, AgentStatus } from '../types/agent';

interface AgentTableProps {
  agents: Agent[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onViewDetails: (agent: Agent) => void;
  onUpdateStatus: (agent: Agent, newStatus: AgentStatus) => void;
  onDeleteAgent: (agent: Agent) => void;
  onOpenRegister: () => void;
}

export const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onViewDetails,
  onUpdateStatus,
  onDeleteAgent,
  onOpenRegister,
}) => {
  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <PauseCircle className="w-3 h-3 text-amber-500" />
            Inactive
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Error
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const hasFilters = search.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search agents by name or description..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onStatusFilterChange('active')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onStatusFilterChange('inactive')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-white text-amber-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => onStatusFilterChange('error')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'error'
                  ? 'bg-white text-rose-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Error
            </button>
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                onSearchChange('');
                onStatusFilterChange('all');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 w-20">ID</th>
              <th className="py-3 px-4">Agent Name & Description</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 w-44">Registered Date</th>
              <th className="py-3 px-4 w-44 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && agents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="inline-block animate-spin mr-2">↻</div>
                  Loading agents from Supabase PostgreSQL...
                </td>
              </tr>
            ) : agents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {hasFilters ? 'No agents match your criteria' : 'No agents registered yet'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      {hasFilters
                        ? 'Try adjusting your search query or status filter.'
                        : 'Register an AI agent to begin live monitoring, telemetry logging, and AI health summaries.'}
                    </p>
                    {hasFilters ? (
                      <button
                        onClick={() => {
                          onSearchChange('');
                          onStatusFilterChange('all');
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button
                        onClick={onOpenRegister}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        Register First Agent
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-semibold">
                      #{agent.id}
                    </span>
                  </td>

                  {/* Name and Description */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-semibold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors"
                          onClick={() => onViewDetails(agent)}
                        >
                          {agent.name}
                        </div>
                        {agent.description ? (
                          <p className="text-slate-500 text-xs truncate max-w-md mt-0.5">
                            {agent.description}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            No description provided
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status & Quick Switcher */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(agent.status)}
                      <select
                        aria-label={`Update status for ${agent.name}`}
                        value={agent.status}
                        onChange={(e) => onUpdateStatus(agent, e.target.value as AgentStatus)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 cursor-pointer hover:border-slate-300"
                        title="Quick change status"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </td>

                  {/* Created At */}
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {formatDate(agent.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(agent)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200/50"
                        title="View details & generate AI health summary"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & AI</span>
                      </button>

                      <button
                        onClick={() => onDeleteAgent(agent)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {agents.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{agents.length}</strong> registered agent(s)
          </span>
          <span className="font-mono text-[11px]">Live Database Query</span>
        </div>
      )}
    </div>
  );
};
