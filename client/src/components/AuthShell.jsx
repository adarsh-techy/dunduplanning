// Shared gradient hero + card frame for Login and Signup so the two stay
// visually consistent.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 dark:bg-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-fuchsia-600 opacity-90 dark:opacity-70" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg ring-1 ring-white/20 backdrop-blur">
            🗂️
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Dundu Planning</h1>
          <p className="mt-1 text-sm text-white/80">Track every step. Know every cost.</p>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
