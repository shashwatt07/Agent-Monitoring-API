import React from 'react';
import {
  Activity,
  Bot,
  LayoutDashboard,
  ShieldCheck,
  FileCode,
  Sparkles,
  Database,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'agents' | 'health';
  onTabChange: (tab: 'dashboard' | 'agents' | 'health') => void;
  agentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, agentCount }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight tracking-tight">
            Agent Monitor
          </h1>
          <p className="text-xs text-indigo-400 font-medium">Live Observability API</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 space-y-1.5">
        <div className="px-3 py-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Monitoring
        </div>

        <button
          onClick={() => onTabChange('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </div>
        </button>

        <button
          onClick={() => onTabChange('agents')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'agents'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bot className="w-4 h-4" />
            <span>Registered Agents</span>
          </div>
          {agentCount > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                currentTab === 'agents'
                  ? 'bg-indigo-800 text-indigo-100'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {agentCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('health')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'health'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4" />
            <span>Health & Diagnostics</span>
          </div>
        </button>

        <div className="pt-6 px-3 py-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Resources
        </div>

        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
        >
          <div className="flex items-center gap-3">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>FastAPI Docs</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
        </a>

        <div className="p-4 mt-6 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stack Architecture</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-sky-400" /> Supabase
              </span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-sky-300 font-mono">
                PostgreSQL 17
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Backend
              </span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
                FastAPI
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" /> AI Insights
              </span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-purple-300 font-mono">
                OpenAI SDK
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* College Project Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-300">
        <p className="font-semibold text-slate-300">College Full-Stack AI Project</p>
        <p className="mt-0.5">Production-ready API architecture</p>
      </div>
    </aside>
  );
};
