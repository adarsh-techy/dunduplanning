import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { MODULES } from '../../config/modules';

const EMPTY_PERMISSIONS = MODULES.reduce((acc, m) => ({ ...acc, [m.key]: false }), {});
const EMPTY = { name: '', email: '', password: '', role: 'admin', ...EMPTY_PERMISSIONS };

export default function AddAdminModal({ open, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.key]: form[m.key] }), {}),
      });
      setForm(EMPTY);
    } catch (err) {
      setError(err?.data?.message || 'Could not create user');
    }
  };

  const isSuperAdmin = form.role === 'superadmin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add User</h3>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Create an admin or another super admin.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input
              required
              value={form.name}
              onChange={handleChange('name')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Account password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The user will use this password to sign in from any device or browser (min 6 chars).
            </p>
          </div>

          <div>
            <p className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label
                className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium transition ${
                  form.role === 'admin'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={form.role === 'admin'}
                  onChange={handleChange('role')}
                  className="hidden"
                />
                Admin
              </label>
              <label
                className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium transition ${
                  form.role === 'superadmin'
                    ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-500 dark:bg-fuchsia-900/30 dark:text-fuchsia-300'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="superadmin"
                  checked={form.role === 'superadmin'}
                  onChange={handleChange('role')}
                  className="hidden"
                />
                Super Admin
              </label>
            </div>
          </div>

          {isSuperAdmin ? (
            <p className="rounded-lg bg-fuchsia-50 px-3 py-2 text-xs text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">
              Super Admins have full access to everything — every module and Admin Users —
              and can manage other accounts.
            </p>
          ) : (
            <div>
              <p className="block text-sm font-medium text-slate-700 dark:text-slate-300">Module Access</p>
              <div className="mt-2 space-y-1.5">
                {MODULES.map((m) => (
                  <label
                    key={m.key}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={form[m.key]}
                      onChange={handleChange(m.key)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700"
                    />
                    {m.label} ({m.hint})
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
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
              Create {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
