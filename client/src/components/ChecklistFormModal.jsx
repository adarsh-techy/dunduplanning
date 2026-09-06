import { useEffect, useState } from 'react';
import { useGetUsersBasicQuery } from '../features/users/usersApiSlice';

const EMPTY = {
  title: '',
  category: '',
  description: '',
  status: 'pending',
  estimatedCost: 0,
  actualCost: 0,
  dueDate: '',
  completedDate: '',
  completedBy: '',
  notes: '',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

// datetime-local wants "YYYY-MM-DDTHH:mm" in the viewer's local time.
const toDateTimeInput = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
const completionInputClass =
  'mt-1 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-emerald-800 dark:bg-slate-700 dark:text-slate-100';

// Shared add/edit form for every checklist-style module (Planning, Marketing,
// Features, Delivery, Deployment). `itemLabel` customizes the heading/button
// text and `titleLabel` customizes what the "Title" field is called.
export default function ChecklistFormModal({
  open,
  item,
  onClose,
  onSubmit,
  isSaving,
  itemLabel = 'Item',
  titleLabel = 'Title',
  dateLabel = 'Due Date',
  costLabel = 'Actual Cost',
  showEstimatedCost = true,
  showCost = true,
  showCategory = false,
  categoryOptions = [],
  showDoneBy = true,
  showDate = true,
}) {
  const [form, setForm] = useState(EMPTY);
  const { data: users } = useGetUsersBasicQuery(undefined, { skip: !open });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        category: item.category || '',
        description: item.description || '',
        status: item.status || 'pending',
        estimatedCost: item.estimatedCost || 0,
        actualCost: item.actualCost || 0,
        dueDate: toDateInput(item.dueDate),
        completedDate: toDateTimeInput(item.completedDate),
        completedBy: item.completedBy || '',
        notes: item.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [item, open]);

  if (!open) return null;

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      estimatedCost: Number(form.estimatedCost) || 0,
      actualCost: Number(form.actualCost) || 0,
      dueDate: form.dueDate || null,
      completedDate: form.status === 'complete' && form.completedDate ? form.completedDate : null,
      completedBy: form.status === 'complete' ? form.completedBy || null : null,
    });
  };

  const isComplete = form.status === 'complete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {item ? `Edit ${itemLabel}` : `Add ${itemLabel}`}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className={showCategory ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : ''}>
            <div>
              <label className={labelClass}>{titleLabel}</label>
              <input required value={form.title} onChange={handleChange('title')} className={inputClass} />
            </div>
            {showCategory && (
              <div>
                <label className={labelClass}>Section</label>
                <input
                  list="checklist-category-suggestions"
                  value={form.category}
                  onChange={handleChange('category')}
                  placeholder="e.g. Deployment"
                  className={inputClass}
                />
                <datalist id="checklist-category-suggestions">
                  {categoryOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className={showDate && !isComplete ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : ''}>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={handleChange('status')} className={inputClass}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            {showDate && !isComplete && (
              <div>
                <label className={labelClass}>{dateLabel}</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange('dueDate')}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {isComplete && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Completion</p>
              <div className={showDoneBy ? 'mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2' : 'mt-3'}>
                {showDoneBy && (
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Done By
                    </label>
                    <input
                      type="text"
                      list="checklist-done-by-suggestions"
                      placeholder="Your name (default: you)"
                      value={form.completedBy}
                      onChange={handleChange('completedBy')}
                      className={completionInputClass}
                    />
                    <datalist id="checklist-done-by-suggestions">
                      {users?.map((u) => (
                        <option key={u.id} value={u.name} />
                      ))}
                    </datalist>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Completed On
                  </label>
                  <input
                    type="datetime-local"
                    value={form.completedDate}
                    onChange={handleChange('completedDate')}
                    className={completionInputClass}
                  />
                </div>
              </div>
              <p className="mt-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                Leave {showDoneBy ? 'either field' : 'it'} on its default to use {showDoneBy ? 'you and ' : ''}the current date/time.
              </p>
            </div>
          )}

          {showCost && (
            <div className={showEstimatedCost ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : ''}>
              {showEstimatedCost && (
                <div>
                  <label className={labelClass}>Estimated Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedCost}
                    onChange={handleChange('estimatedCost')}
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label className={labelClass}>{costLabel}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.actualCost}
                  onChange={handleChange('actualCost')}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes} onChange={handleChange('notes')} rows={2} className={inputClass} />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-brand-700 hover:to-fuchsia-700 disabled:opacity-60"
            >
              {item ? 'Save Changes' : `Add ${itemLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
