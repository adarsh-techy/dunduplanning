import { useEffect, useState } from 'react';
import { useGetUsersBasicQuery } from '../users/usersApiSlice';

const EMPTY = {
  title: '',
  category: '',
  description: '',
  who: '',
  date: '',
  renewalDate: '',
  cost: 0,
  status: 'pending',
  notes: '',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

export default function DeploymentFormModal({ open, item, categoryOptions = [], onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(EMPTY);
  const { data: users } = useGetUsersBasicQuery(undefined, { skip: !open });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        category: item.category || '',
        description: item.description || '',
        who: item.who || '',
        date: toDateInput(item.date),
        renewalDate: toDateInput(item.renewalDate),
        cost: item.cost || 0,
        status: item.status || 'pending',
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
      date: form.date || null,
      renewalDate: form.renewalDate || null,
      cost: Number(form.cost) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {item ? 'Edit Service' : 'Add Service'}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className={labelClass}>Service Name</label>
            <input required value={form.title} onChange={handleChange('title')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Section</label>
            <input
              list="deployment-category-suggestions"
              value={form.category}
              onChange={handleChange('category')}
              placeholder="e.g. Hosting, Domain & SSL, Database"
              className={inputClass}
            />
            <datalist id="deployment-category-suggestions">
              {categoryOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Who</label>
              <input
                type="text"
                list="deployment-who-suggestions"
                placeholder="Who manages this"
                value={form.who}
                onChange={handleChange('who')}
                className={inputClass}
              />
              <datalist id="deployment-who-suggestions">
                {users?.map((u) => (
                  <option key={u.id} value={u.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={handleChange('status')} className={inputClass}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={form.date} onChange={handleChange('date')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Renewal Date</label>
              <input
                type="date"
                value={form.renewalDate}
                onChange={handleChange('renewalDate')}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={handleChange('cost')}
              className={inputClass}
            />
          </div>

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
              {item ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
