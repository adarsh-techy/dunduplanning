import { useGetSummaryQuery } from './dashboardApiSlice';
import Spinner from '../../components/Spinner';
import { MODULES } from '../../modules';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0
  );

const COLORS = {
  amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-800',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-800',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:ring-fuchsia-800',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800',
};

function Card({ icon, label, value, sub, color = 'brand' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ring-1 ${COLORS[color]}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

function ChecklistSection({ label, icon, data }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon} {label}
      </h2>
      <div className="mb-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
          style={{ width: `${data.percentComplete}%` }}
        />
      </div>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-slate-900 dark:text-slate-100">{data.complete}</span> of{' '}
        {data.total} items complete ({data.percentComplete}%)
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card icon="⏳" label="Pending" value={data.pending} color="amber" />
        <Card icon="🔄" label="In Progress" value={data.inProgress} color="sky" />
        <Card icon="✅" label="Complete" value={data.complete} color="emerald" />
        <Card
          icon="💰"
          label="Actual Cost"
          value={formatCurrency(data.actualCost)}
          sub={`Estimated: ${formatCurrency(data.estimatedCost)}`}
          color="fuchsia"
        />
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useGetSummaryQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <p className="rounded-lg bg-rose-50 px-4 py-3 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800">
        Could not load the dashboard summary.
      </p>
    );
  }

  const { purchase, grandTotalCost } = summary;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Here's where the business stands today.</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 p-5 text-white shadow-card sm:p-6">
        <p className="text-sm font-medium text-white/80">Grand Total Cost</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">
          {formatCurrency(grandTotalCost)}
        </p>
        <p className="mt-1 text-xs text-white/70">Across every module you have access to</p>
      </div>

      {MODULES.filter((m) => m.key !== 'purchase' && summary[m.key]).map((m) => (
        <ChecklistSection key={m.key} label={m.label} icon={m.icon} data={summary[m.key]} />
      ))}

      {purchase && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            🛒 Purchases
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card icon="🗓️" label="Planned" value={purchase.planned} color="amber" />
            <Card icon="📦" label="Ordered" value={purchase.ordered} color="sky" />
            <Card icon="✅" label="Received" value={purchase.received} color="emerald" />
            <Card icon="💰" label="Total Cost" value={formatCurrency(purchase.totalCost)} color="rose" />
          </div>
        </section>
      )}
    </div>
  );
}
