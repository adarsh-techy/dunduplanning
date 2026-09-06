import { useEffect, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

// A destructive-action confirmation dialog. Pass `confirmValue` (e.g. the
// item's name) to require the user to type it exactly before the Delete
// button is enabled -- a safeguard against misclicks on irreversible actions.
export default function ConfirmDialog({ open, title, message, confirmValue, onConfirm, onCancel }) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;

  const requiresTyping = Boolean(confirmValue);
  const canConfirm = !requiresTyping || typed === confirmValue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-lg text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
          <FiAlertTriangle />
        </div>
        <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{message}</p>

        {requiresTyping && (
          <div className="mt-3">
            <label className="block text-xs text-slate-500 dark:text-slate-400">
              Type <span className="font-semibold text-slate-800 dark:text-slate-100">{confirmValue}</span> to confirm
            </label>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) onConfirm();
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
