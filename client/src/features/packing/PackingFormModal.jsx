import { useEffect, useState } from 'react';
import { useGetUsersBasicQuery } from '../users/usersApiSlice';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

const EMPTY = {
  title: '',
  description: '',
  brandName: '',
  location: '',
  date: '',
  who: '',
  paymentMethod: 'cash',
  itemQty: 1,
  cost: 0,
  status: 'pending',
  notes: '',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

export default function PackingFormModal({ open, item, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(EMPTY);
  const { data: users } = useGetUsersBasicQuery(undefined, { skip: !open });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        description: item.description || '',
        brandName: item.brandName || '',
        location: item.location || '',
        date: toDateInput(item.date),
        who: item.who || '',
        paymentMethod: item.paymentMethod || 'cash',
        itemQty: item.itemQty ?? 1,
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
      itemQty: Number(form.itemQty) || 0,
      cost: Number(form.cost) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {item ? 'Edit Item' : 'Add Item'}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className={labelClass}>Title</label>
            <input required value={form.title} onChange={handleChange('title')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={handleChange('description')} rows={2} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Brand Name</label>
              <input value={form.brandName} onChange={handleChange('brandName')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input value={form.location} onChange={handleChange('location')} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={form.date} onChange={handleChange('date')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Who</label>
              <input
                type="text"
                list="packing-who-suggestions"
                placeholder="Who handled this"
                value={form.who}
                onChange={handleChange('who')}
                className={inputClass}
              />
              <datalist id="packing-who-suggestions">
                {users?.map((u) => (
                  <option key={u.id} value={u.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Payment Method</label>
              <select value={form.paymentMethod} onChange={handleChange('paymentMethod')} className={inputClass}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Item Qty</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.itemQty}
                onChange={handleChange('itemQty')}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={handleChange('status')} className={inputClass}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>
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
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
