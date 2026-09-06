import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useGetPurchasesQuery } from './purchasesApiSlice';
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

const cardShellClass =
  'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800';
const sectionTitleClass = 'text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400';

export default function PurchaseDashboardPage() {
  const { data: purchases, isLoading } = useGetPurchasesQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const list = purchases || [];
  const totalSpend = list.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  const totalProducts = list.reduce((sum, p) => sum + (p.items?.length || 0), 0);
  const avgPerPurchase = list.length ? totalSpend / list.length : 0;

  // By payment method
  const byMethod = {};
  list.forEach((p) => {
    const key = p.paymentMethod || 'other';
    byMethod[key] = byMethod[key] || { count: 0, total: 0 };
    byMethod[key].count += 1;
    byMethod[key].total += p.totalCost || 0;
  });
  const methodRows = Object.entries(byMethod).sort((a, b) => b[1].total - a[1].total);

  // Top vendors
  const byVendor = {};
  list.forEach((p) => {
    const key = p.vendorName || 'Unknown';
    byVendor[key] = byVendor[key] || { count: 0, total: 0 };
    byVendor[key].count += 1;
    byVendor[key].total += p.totalCost || 0;
  });
  const topVendors = Object.entries(byVendor)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6);

  // Recent purchases
  const recent = [...list]
    .sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt))
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Purchase Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete purchase spend across every vendor, payment method and month.
        </p>
      </div>

      {/* Summary -- a quiet letterhead-style card: one true headline figure,
          a thin brand rule to mark it as the report's cover, and the
          supporting counts laid out plainly beneath a single divider. */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="h-1 bg-gradient-to-r from-brand-600 to-fuchsia-600" />
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Total Spend
          </p>
          <p className="mt-2 text-4xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            {formatCurrency(totalSpend)}
          </p>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            across {list.length} purchase{list.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 dark:divide-slate-700 dark:border-slate-700">
          {[
            ['Purchases', list.length],
            ['Products', totalProducts],
            ['Avg / Purchase', formatCurrency(avgPerPurchase)],
          ].map(([label, value]) => (
            <div key={label} className="px-4 py-4 text-center sm:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-800 dark:text-slate-100 sm:text-xl">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={cardShellClass}>
          <h2 className={`${sectionTitleClass} mb-4`}>By Payment Method</h2>
          {methodRows.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No purchases yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {methodRows.map(([method, data]) => (
                  <tr key={method}>
                    <td className="py-2.5 pr-3 font-medium text-slate-700 dark:text-slate-200">
                      {PAYMENT_LABELS[method] || method}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-slate-400 dark:text-slate-500">
                      {data.count} purchase{data.count === 1 ? '' : 's'}
                    </td>
                    <td className="py-2.5 text-right font-bold tabular-nums text-slate-800 dark:text-slate-100">
                      {formatCurrency(data.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={cardShellClass}>
          <h2 className={`${sectionTitleClass} mb-4`}>Top Vendors</h2>
          {topVendors.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No purchases yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {topVendors.map(([vendor, data]) => (
                  <tr key={vendor}>
                    <td className="py-2.5 pr-3 font-medium text-slate-700 dark:text-slate-200">
                      <span className="block max-w-[12rem] truncate sm:max-w-none">{vendor}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right text-slate-400 dark:text-slate-500">
                      {data.count} purchase{data.count === 1 ? '' : 's'}
                    </td>
                    <td className="py-2.5 text-right font-bold tabular-nums text-slate-800 dark:text-slate-100">
                      {formatCurrency(data.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className={sectionTitleClass}>Recent Purchases</h2>
          <Link
            to="/finance"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all in Finance <FiArrowRight />
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Vendor</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Payment</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                    No purchases yet.
                  </td>
                </tr>
              )}
              {recent.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3">
                    <Link
                      to={`/purchases/${p._id}`}
                      className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      {p.vendorName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(p.purchaseDate)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {PAYMENT_LABELS[p.paymentMethod] || '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-800 dark:text-slate-100">
                    {formatCurrency(p.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
