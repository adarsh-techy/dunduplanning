import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiDownload, FiFileText } from 'react-icons/fi';
import { useGetPurchasesQuery } from '../purchases/purchasesApiSlice';
import { downloadPurchasesCsv } from '../../utils/purchaseExport';
import Spinner from '../../components/Spinner';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0
  );
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

const PAYMENT_LABELS = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  other: 'Other',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const monthKey = (d) => (d ? new Date(d).toISOString().slice(0, 7) : null);
const monthLabel = (key) => {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

// A read-only, filterable record of every purchase -- editing stays on the
// Purchase page; this is the "look up what we spent" view.
export default function FinancePage() {
  const { data: purchases, isLoading } = useGetPurchasesQuery();
  const [month, setMonth] = useState('all');
  const [date, setDate] = useState('');

  const monthOptions = useMemo(() => {
    const keys = new Set();
    (purchases || []).forEach((p) => {
      const key = monthKey(p.purchaseDate || p.createdAt);
      if (key) keys.add(key);
    });
    return [...keys].sort().reverse();
  }, [purchases]);

  const filtered = useMemo(() => {
    return (purchases || []).filter((p) => {
      const raw = p.purchaseDate || p.createdAt;
      if (month !== 'all' && monthKey(raw) !== month) return false;
      if (date && toDateInput(raw) !== date) return false;
      return true;
    });
  }, [purchases, month, date]);

  const filteredTotal = filtered.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  const filteredProducts = filtered.reduce((sum, p) => sum + (p.items?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const exportFilename =
    month === 'all' && !date
      ? 'finance-all-time'
      : `finance-${date || month}`.replace(/[^a-z0-9-]/gi, '-');

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Finance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every purchase on record — filter by month or an exact date to see what was spent.
          </p>
        </div>
        <button
          onClick={() => downloadPurchasesCsv(filtered, exportFilename)}
          disabled={!filtered.length}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto sm:py-2"
        >
          <FiDownload /> Download Excel
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="sm:w-auto">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 sm:w-auto"
            >
              <option value="all">All time</option>
              {monthOptions.map((key) => (
                <option key={key} value={key}>
                  {monthLabel(key)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-auto">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Exact date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 sm:w-auto"
            />
          </div>
          {(month !== 'all' || date) && (
            <button
              onClick={() => {
                setMonth('all');
                setDate('');
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-between gap-3 border-t border-slate-100 pt-3 text-sm dark:border-slate-700 sm:mt-3 sm:justify-end sm:gap-6 sm:border-0 sm:pt-0">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Purchases</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{filtered.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Products</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{filteredProducts}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Total</p>
            <p className="font-bold text-brand-600 dark:text-brand-400">{formatCurrency(filteredTotal)}</p>
          </div>
        </div>
      </div>

      {/* Mobile: one card per purchase instead of an 8-column table */}
      <div className="space-y-3 sm:hidden">
        {filtered.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No purchases match this filter.
          </p>
        )}
        {filtered.map((p, index) => (
          <div
            key={p._id}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {index + 1}. {p.vendorName}
              </p>
              <p className="shrink-0 font-bold tabular-nums text-slate-800 dark:text-slate-100">
                {formatCurrency(p.totalCost)}
              </p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-700">
              <div>
                <dt className="text-slate-400 dark:text-slate-500">Products</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {p.items?.length ? `${p.items.length} item${p.items.length > 1 ? 's' : ''}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 dark:text-slate-500">Who</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{p.purchasedBy || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 dark:text-slate-500">Payment</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {PAYMENT_LABELS[p.paymentMethod] || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 dark:text-slate-500">Date</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{formatDate(p.purchaseDate)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-3 dark:border-slate-700">
              <Link
                to={`/purchases/${p._id}`}
                title="View"
                aria-label="View"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <FiEye />
              </Link>
              <button
                onClick={() => import('../../utils/purchaseInvoice').then((m) => m.downloadPurchaseInvoice(p))}
                title="Download Invoice"
                aria-label="Download Invoice"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <FiFileText />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="w-12 px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">#</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Vendor</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Products</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Who</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Payment</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Total</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No purchases match this filter.
                </td>
              </tr>
            )}
            {filtered.map((p, index) => (
              <tr key={p._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{p.vendorName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {p.items?.length ? `${p.items.length} item${p.items.length > 1 ? 's' : ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.purchasedBy || '—'}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {PAYMENT_LABELS[p.paymentMethod] || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(p.purchaseDate)}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                  {formatCurrency(p.totalCost)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/purchases/${p._id}`}
                      title="View"
                      aria-label="View"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                    >
                      <FiEye />
                    </Link>
                    <button
                      onClick={() => import('../../utils/purchaseInvoice').then((m) => m.downloadPurchaseInvoice(p))}
                      title="Download Invoice"
                      aria-label="Download Invoice"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                    >
                      <FiFileText />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
