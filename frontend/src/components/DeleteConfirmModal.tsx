import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { Agent } from '../types/agent';

interface DeleteConfirmModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (agent: Agent) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  agent,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !agent) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onConfirm(agent);
      onClose();
    } catch (err: unknown) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
              <p className="text-xs text-rose-600 font-medium">Irreversible database action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-xs text-slate-600 space-y-3">
          <p>
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 font-bold font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              {agent.name}
            </strong>{' '}
            (ID: #{agent.id})?
          </p>
          <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200/80 text-rose-900">
            <p className="font-medium">
              This will remove the agent and cascade delete all associated audit activities from
              Supabase PostgreSQL.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {deleting ? (
              <>
                <span className="inline-block animate-spin">↻</span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Agent</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
