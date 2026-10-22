import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Activity as ActivityIcon,
  PauseCircle,
  AlertTriangle,
  Server,
  Database,
  Cpu,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { StatusChart } from '../components/StatusChart';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { AgentTable } from '../components/AgentTable';
import { AgentModal } from '../components/AgentModal';
import { AgentDetailModal } from '../components/AgentDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Toast } from '../components/Toast';

import type {
  Agent,
  AgentStatus,
  HealthStatus,
  DashboardStats,
  ToastMessage,
} from '../types/agent';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'agents' | 'health'>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    inactive: 0,
    error: 0,
    recent_activities: [],
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [healthData, statsData, agentsData] = await Promise.all([
        api.getHealth(),
        api.getStats().catch(() => ({
          total: 0,
          active: 0,
          inactive: 0,
          error: 0,
          recent_activities: [],
        })),
        api.getAgents(search, statusFilter).catch(() => []),
      ]);

      setHealth(healthData);
      setStats(statsData);
      setAgents(agentsData);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      addToast('error', 'Failed to synchronize telemetry with backend.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Periodic health check ping every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      api.getHealth().then(setHealth).catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleRegisterAgent = async (data: { name: string; description?: string }) => {
    const newAgent = await api.createAgent(data);
    addToast('success', `Agent '${newAgent.name}' successfully registered.`);
    fetchData();
  };

  const handleUpdateStatus = async (agent: Agent, newStatus: AgentStatus) => {
    try {
      const updated = await api.updateAgentStatus(agent.id, newStatus);
      addToast('info', `Status for '${updated.name}' changed to '${newStatus}'.`);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      addToast('error', msg);
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    try {
      await api.deleteAgent(agent.id);
      addToast('success', `Agent '${agent.name}' deleted.`);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      addToast('error', msg);
    }
  };

  const handleInspect = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (agent: Agent) => {
    setAgentToDelete(agent);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Dark Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        agentCount={stats.total}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          health={health}
          loading={loading}
          onRefresh={fetchData}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Tab 1: Overview Dashboard */}
          {currentTab === 'dashboard' && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Registered"
                  value={stats.total}
                  total={stats.total}
                  icon={Bot}
                  variant="default"
                  subtitle="Active registry pool"
                  onClick={() => setStatusFilter('all')}
                />
                <StatCard
                  title="Active Fleet"
                  value={stats.active}
                  total={stats.total}
                  icon={ActivityIcon}
                  variant="active"
                  subtitle="Processing workloads"
                  onClick={() => setStatusFilter('active')}
                />
                <StatCard
                  title="Inactive / Paused"
                  value={stats.inactive}
                  total={stats.total}
                  icon={PauseCircle}
                  variant="inactive"
                  subtitle="Dormant or scheduled"
                  onClick={() => setStatusFilter('inactive')}
                />
                <StatCard
                  title="Error Flagged"
                  value={stats.error}
                  total={stats.total}
                  icon={AlertTriangle}
                  variant="error"
                  subtitle="Requiring operator review"
                  onClick={() => setStatusFilter('error')}
                />
              </div>

              {/* Status Visual Chart & Recent Audit Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusChart
                  total={stats.total}
                  active={stats.active}
                  inactive={stats.inactive}
                  error={stats.error}
                />
                <RecentActivityFeed
                  activities={stats.recent_activities}
                  loading={loading}
                />
              </div>

              {/* Live Filterable Agent Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Registered AI Agents</h3>
                  <span className="text-xs text-slate-500">
                    Live updates from Supabase PostgreSQL
                  </span>
                </div>
                <AgentTable
                  agents={agents}
                  loading={loading}
                  search={search}
                  onSearchChange={setSearch}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onViewDetails={handleInspect}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteAgent={handleOpenDelete}
                  onOpenRegister={() => setIsRegisterOpen(true)}
                />
              </div>
            </>
          )}

          {/* Tab 2: Registered Agents Dedicated View */}
          {currentTab === 'agents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Agent Fleet Directory</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive catalog of all agents with granular controls and AI assessment.
                  </p>
                </div>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                >
                  + Add Agent
                </button>
              </div>

              <AgentTable
                agents={agents}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onViewDetails={handleInspect}
                onUpdateStatus={handleUpdateStatus}
                onDeleteAgent={handleOpenDelete}
                onOpenRegister={() => setIsRegisterOpen(true)}
              />
            </div>
          )}

          {/* Tab 3: System Health & Diagnostics */}
          {currentTab === 'health' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">System Diagnostics & Topology</h3>
                <p className="text-xs text-slate-500">
                  Real-time health verification across backend runtime, cloud database, and AI service layers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Backend Diagnostics */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Backend Service
                    </span>
                    <Server className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">FastAPI Online</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Running Uvicorn ASGI server on port 8000 with CORS and Pydantic validation.
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                    <div>Status Code: 200 OK</div>
                    <div>Docs: <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-indigo-600 underline">/docs</a></div>
                  </div>
                </div>

                {/* Database Diagnostics */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Database Layer
                    </span>
                    <Database className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    {health?.database === 'connected' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-slate-900 text-sm">Supabase Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600" />
                        <span className="font-bold text-slate-900 text-sm">Database Offline</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    PostgreSQL 17 hosted on Supabase (ap-northeast-2 pooler, SSL encrypted).
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                    <div>Type: {health?.database_type || 'PostgreSQL 17'}</div>
                    <div>State: {health?.database || 'Unknown'}</div>
                  </div>
                </div>

                {/* AI Service Diagnostics */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      AI Reasoning Engine
                    </span>
                    <Cpu className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-slate-900 text-sm">OpenAI + Resilient Fallback</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Configured for model <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">gpt-4o-mini</code> with deterministic rule-based failover.
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                    <div>Integration: OpenAI Python SDK</div>
                    <div>Failover: Active</div>
                  </div>
                </div>
              </div>

              {/* Health Diagnostic Details Card */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">Real-time Telemetry Ping</h4>
                  <button
                    onClick={fetchData}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Run Live Check</span>
                  </button>
                </div>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
                  <div>// Raw response from GET /health</div>
                  <div>{JSON.stringify(health, null, 2)}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AgentModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegisterAgent}
      />

      <AgentDetailModal
        agent={selectedAgent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusChanged={(_agent, newStatus) => {
          setSelectedAgent((prev) => (prev ? { ...prev, status: newStatus } : null));
          fetchData();
        }}
      />

      <DeleteConfirmModal
        agent={agentToDelete}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAgent}
      />

      {/* Toast Manager */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
