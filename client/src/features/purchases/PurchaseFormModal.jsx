import { useEffect, useRef, useState } from 'react';
import { FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { useGetUsersBasicQuery } from '../users/usersApiSlice';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

const EMPTY_ITEM = { productName: '', quantity: 1, totalAmount: 0 };

const EMPTY = {
  vendorName: '',
  location: '',
  purchaseDate: '',
  purchasedBy: '',
  paymentMethod: 'cash',
  items: [{ ...EMPTY_ITEM }],
  notes: '',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

// `onSubmit` receives the form fields plus `billFile` (a File or null) --
// the parent creates/updates the purchase first, then uploads the file as
// an attachment against the resulting id, since there's no purchase to
// attach to yet while this modal is still open for a new one.
export default function PurchaseFormModal({ open, purchase, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(EMPTY);
  const [billFile, setBillFile] = useState(null);
  const fileInputRef = useRef(null);
  const { data: users } = useGetUsersBasicQuery(undefined, { skip: !open });

  useEffect(() => {
    if (purchase) {
      setForm({
        vendorName: purchase.vendorName || '',
        location: purchase.location || '',
        purchaseDate: toDateInput(purchase.purchaseDate),
        purchasedBy: purchase.purchasedBy || '',
        paymentMethod: purchase.paymentMethod || 'cash',
        items: purchase.items?.length ? purchase.items.map((i) => ({ ...i })) : [{ ...EMPTY_ITEM }],
        notes: purchase.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
    setBillFile(null);
  }, [purchase, open]);

  if (!open) return null;

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateItem = (index, field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (index) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(
      {
        ...form,
        purchaseDate: form.purchaseDate || null,
        items: form.items
          .filter((i) => i.productName.trim())
          .map((i) => ({ ...i, quantity: Number(i.quantity) || 0, totalAmount: Number(i.totalAmount) || 0 })),
      },
      billFile
    );
  };

  const grandTotal = form.items.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {purchase ? 'Edit Purchase' : 'Add Purchase'}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Vendor Name</label>
              <input required value={form.vendorName} onChange={handleChange('vendorName')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input value={form.location} onChange={handleChange('location')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={handleChange('purchaseDate')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Who</label>
              <input
                type="text"
                list="purchase-who-suggestions"
                placeholder="Who made this purchase"
                value={form.purchasedBy}
                onChange={handleChange('purchasedBy')}
                className={inputClass}
              />
              <datalist id="purchase-who-suggestions">
                {users?.map((u) => (
                  <option key={u.id} value={u.name} />
                ))}
              </datalist>
            </div>
          </div>

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

          {/* Products -- one or more line items making up this purchase */}
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Products</p>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50"
              >
                <FiPlus /> Add Product
              </button>
            </div>

            <div className="mt-3 space-y-3 sm:space-y-2">
              {form.items.map((item, index) => {
                // Column headers only make sense once things are aligned in
                // a row (sm+); stacked on mobile, every product needs its
                // own labels since there's no shared header above it.
                const labelClass = `block text-xs font-medium text-slate-500 dark:text-slate-400 ${
                  index === 0 ? '' : 'sm:hidden'
                }`;
                return (
                  <div
                    key={index}
                    className="flex flex-col gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-700 sm:flex-row sm:items-end sm:border-0 sm:pb-0"
                  >
                    <div className="flex-1">
                      <label className={labelClass}>Product Name</label>
                      <input
                        required
                        placeholder="Product name"
                        value={item.productName}
                        onChange={updateItem(index, 'productName')}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/2 sm:w-20">
                        <label className={labelClass}>Qty</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.quantity}
                          onChange={updateItem(index, 'quantity')}
                          className={inputClass}
                        />
                      </div>
                      <div className="w-1/2 sm:w-32">
                        <label className={labelClass}>Total Amount</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.totalAmount}
                          onChange={updateItem(index, 'totalAmount')}
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={form.items.length === 1}
                        title="Remove product"
                        aria-label="Remove product"
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30 dark:text-rose-400 dark:hover:bg-rose-900/30"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 rounded-lg bg-fuchsia-50 px-3 py-1.5 text-xs font-medium text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">
              Grand Total: {formatCurrency(grandTotal)}
            </p>
          </div>

          <div>
            <label className={labelClass}>Bill (document or photo)</label>
            {billFile ? (
              <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700">
                <span className="truncate text-slate-700 dark:text-slate-200">{billFile.name}</span>
                <button
                  type="button"
                  onClick={() => setBillFile(null)}
                  aria-label="Remove selected file"
                  className="shrink-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
              >
                <FiUpload /> Add bill / receipt
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              className="hidden"
              onChange={(e) => setBillFile(e.target.files?.[0] || null)}
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
              {purchase ? 'Save Changes' : 'Add Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
