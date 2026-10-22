import React from 'react';
import { Clock, PlusCircle, ArrowRightLeft, Sparkles, AlertCircle } from 'lucide-react';
import type { Activity } from '../types/agent';

interface RecentActivityFeedProps {
  activities: Activity[];
  loading: boolean;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  loading,
}) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'REGISTERED':
        return <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />;
      case 'STATUS_CHANGE':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />;
      case 'AI_SUMMARY':
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'REGISTERED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'STATUS_CHANGE':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'AI_SUMMARY':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · ' +
        date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Recent Audit Activity</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">PostgreSQL Audit Log</span>
      </div>

      <div className="mt-4 space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {loading && activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading audit feed...</div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No activity events recorded yet.
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
              <div className="p-1.5 rounded-md bg-slate-100 mt-0.5 shrink-0">
                {getEventIcon(act.event_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getEventBadge(
                      act.event_type
                    )}`}
                  >
                    {act.event_type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {formatTimestamp(act.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed truncate">
                  {act.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
