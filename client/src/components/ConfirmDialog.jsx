import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';

// General-purpose confirmation dialog. Pass `confirmValue` (e.g. an item's
// name) to require the user to type it exactly before confirming can be
// pressed -- used for irreversible actions like delete. `tone` picks the
// icon/button color and a sensible default `confirmLabel`; override
// `confirmLabel` for wording that isn't just the tone's default verb.
const TONES = {
  danger: { icon: FiAlertTriangle, badge: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400', button: 'bg-rose-600 hover:bg-rose-700', label: 'Delete' },
  success: { icon: FiCheckCircle, badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400', button: 'bg-emerald-600 hover:bg-emerald-700', label: 'Confirm' },
  warning: { icon: FiRotateCcw, badge: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400', button: 'bg-amber-600 hover:bg-amber-700', label: 'Confirm' },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmValue,
  confirmLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;

  const requiresTyping = Boolean(confirmValue);
  const canConfirm = !requiresTyping || typed === confirmValue;
  const { icon: Icon, badge, button, label } = TONES[tone] || TONES.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${badge}`}>
          <Icon />
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
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40 ${button}`}
          >
            {confirmLabel || label}
          </button>
        </div>
      </div>
    </div>
  );
}
