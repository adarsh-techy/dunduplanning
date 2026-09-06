import { useEffect, useState } from 'react';
import { useGetStepItemsQuery } from '../steps/stepsApiSlice';

const EMPTY = {
  itemName: '',
  category: '',
  quantity: 1,
  unitCost: 0,
  vendor: '',
  purchaseDate: '',
  status: 'planned',
  notes: '',
  linkedStep: '',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function PurchaseFormModal({ open, purchase, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(EMPTY);
  const { data: steps } = useGetStepItemsQuery(undefined, { skip: !open });

  useEffect(() => {
    if (purchase) {
      setForm({
        itemName: purchase.itemName || '',
        category: purchase.category || '',
        quantity: purchase.quantity ?? 1,
        unitCost: purchase.unitCost || 0,
        vendor: purchase.vendor || '',
        purchaseDate: toDateInput(purchase.purchaseDate),
        status: purchase.status || 'planned',
        notes: purchase.notes || '',
        linkedStep: purchase.linkedStep?._id || purchase.linkedStep || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [purchase, open]);

  if (!open) return null;

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      quantity: Number(form.quantity) || 0,
      unitCost: Number(form.unitCost) || 0,
      purchaseDate: form.purchaseDate || null,
      linkedStep: form.linkedStep || null,
    });
  };

  const estimatedTotal = (Number(form.quantity) || 0) * (Number(form.unitCost) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {purchase ? 'Edit Purchase' : 'Add Purchase'}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Item Name</label>
            <input
              required
              value={form.itemName}
              onChange={handleChange('itemName')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <input
                value={form.category}
                onChange={handleChange('category')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vendor</label>
              <input
                value={form.vendor}
                onChange={handleChange('vendor')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange('quantity')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit Cost</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={handleChange('unitCost')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
          <p className="rounded-lg bg-fuchsia-50 px-3 py-1.5 text-xs font-medium text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">
            Total: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(estimatedTotal)}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={form.status}
                onChange={handleChange('status')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              >
                <option value="planned">Planned</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Purchase Date</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={handleChange('purchaseDate')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Linked Planning Step (optional)</label>
            <select
              value={form.linkedStep}
              onChange={handleChange('linkedStep')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            >
              <option value="">None</option>
              {steps?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
            <textarea
              value={form.notes}
              onChange={handleChange('notes')}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
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
              {purchase ? 'Save Changes' : 'Add Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
