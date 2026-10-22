import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Calendar,
  Clock,
  AlertCircle,
  Lightbulb,
  Cpu,
  RotateCw,
} from 'lucide-react';
import type { Agent, AgentDetail, AgentStatus, AgentSummary, Activity } from '../types/agent';
import { api } from '../services/api';

interface AgentDetailModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged: (agent: Agent, newStatus: AgentStatus) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  isOpen,
  onClose,
  onStatusChanged,
}) => {
  const [details, setDetails] = useState<AgentDetail | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<AgentSummary | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (agent && isOpen) {
      loadAgentData(agent.id);
      setSummary(null);
      setSummaryError(null);
    }
  }, [agent, isOpen]);

  const loadAgentData = async (agentId: number) => {
    try {
      setLoadingDetails(true);
      const [detailData, activityData] = await Promise.all([
        api.getAgent(agentId),
        api.getAgentActivity(agentId),
      ]);
      setDetails(detailData);
      setActivities(activityData);
    } catch (err: unknown) {
      console.error('Failed to load agent details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!agent) return;
    try {
      setGeneratingSummary(true);
      setSummaryError(null);
      const res = await api.getAgentSummary(agent.id);
      setSummary(res);
      // Reload activities to reflect the new AI_SUMMARY event
      const updatedActs = await api.getAgentActivity(agent.id);
      setActivities(updatedActs);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSummaryError(err.message);
      } else {
        setSummaryError('Failed to generate AI health summary.');
      }
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleStatusChange = async (newStatus: AgentStatus) => {
    if (!agent) return;
    try {
      setUpdatingStatus(true);
      const updated = await api.updateAgentStatus(agent.id, newStatus);
      setDetails((prev) => (prev ? { ...prev, status: updated.status } : null));
      onStatusChanged(agent, newStatus);
      // Reload activities
      const updatedActs = await api.getAgentActivity(agent.id);
      setActivities(updatedActs);
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen || !agent) return null;

  const currentStatus = details?.status || agent.status;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{agent.name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                  #{agent.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                {agent.description || 'No description provided.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status & Timing Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status Control */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Operational Status
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  disabled={updatingStatus}
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value as AgentStatus)}
                  className={`w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border transition-all cursor-pointer ${
                    currentStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : currentStatus === 'inactive'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  <option value="active">🟢 Active</option>
                  <option value="inactive">🟡 Inactive</option>
                  <option value="error">🔴 Error State</option>
                </select>
              </div>
            </div>

            {/* Registered At */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Registered
              </span>
              <div className="flex items-center gap-2 text-slate-700 font-medium font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{formatDate(agent.created_at)}</span>
              </div>
            </div>

            {/* Last Updated */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Last Activity
              </span>
              <div className="flex items-center gap-2 text-slate-700 font-medium font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{formatDate(details?.updated_at || agent.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* AI Health Summary Section */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">AI-Powered Health Summary</h4>
                  <p className="text-[11px] text-slate-500">
                    Evaluates live database state and history via OpenAI SDK.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {generatingSummary ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Health Summary</span>
                  </>
                )}
              </button>
            </div>

            {summaryError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{summaryError}</span>
              </div>
            )}

            {summary ? (
              <div className="space-y-3 pt-2">
                {/* Source Badge */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">Assessment Result</span>
                  <div className="flex items-center gap-1.5">
                    {summary.source === 'openai' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        <Cpu className="w-3 h-3 text-blue-600" />
                        OpenAI ({summary.model})
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                        title="Returned rule-based assessment because OpenAI quota/rate limit was encountered"
                      >
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Rule-Based Fallback Engine
                      </span>
                    )}
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 leading-relaxed shadow-sm font-medium">
                  {summary.summary}
                </div>

                {/* Suggested Action Box */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-950 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider mb-0.5">
                      Recommended Next Step
                    </span>
                    <span className="text-xs leading-relaxed">{summary.suggested_action}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-indigo-200 bg-white/70 text-center text-slate-500">
                Click <strong>Generate Health Summary</strong> to inspect this agent's telemetry with AI.
              </div>
            )}
          </div>

          {/* Activity Log Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Agent Activity History</h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {activities.length} event(s) logged
              </span>
            </div>

            <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-4 py-1">
              {loadingDetails && activities.length === 0 ? (
                <div className="text-slate-400 py-4">Loading activity logs...</div>
              ) : activities.length === 0 ? (
                <div className="text-slate-400 py-2">No activity records found for this agent.</div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="relative group">
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {act.event_type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(act.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
