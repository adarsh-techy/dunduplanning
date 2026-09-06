import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from './usersApiSlice';
import { selectCurrentUser } from '../auth/authSlice';
import AddAdminModal from './AddAdminModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import { MODULES } from '../../config/modules';

function RoleBadge({ role }) {
  const isSuperAdmin = role === 'superadmin';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isSuperAdmin
          ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300'
          : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
      }`}
    >
      {isSuperAdmin ? '👑 Super Admin' : 'Admin'}
    </span>
  );
}

export default function AdminUsersPage() {
  const currentUser = useSelector(selectCurrentUser);
  const { data: users, isLoading } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState('');

  const activeSuperAdminCount =
    users?.filter((u) => u.role === 'superadmin' && u.isActive).length ?? 0;

  const togglePermission = (user, moduleName) =>
    updateUser({
      id: user.id,
      permissions: { ...user.permissions, [moduleName]: !user.permissions[moduleName] },
    });

  const toggleActive = async (user) => {
    setActionError('');
    try {
      await updateUser({ id: user.id, isActive: !user.isActive }).unwrap();
    } catch (err) {
      setActionError(err?.data?.message || 'Could not update this user');
    }
  };

  const handleDelete = async () => {
    setActionError('');
    try {
      await deleteUser(deleteTarget.id).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      setActionError(err?.data?.message || 'Could not delete this user');
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {activeSuperAdminCount} active Super Admin{activeSuperAdminCount === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-brand-700 hover:to-fuchsia-700 sm:w-auto sm:py-2"
        >
          <FiPlus /> Add User
        </button>
      </div>

      {actionError && (
        <div className="mb-3 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800">
          {actionError}
        </div>
      )}

      {/* Mobile: one card per user instead of a 6-column table */}
      <div className="space-y-3 sm:hidden">
        {users?.map((user) => {
          const isSelf = user.id === currentUser?.id;
          const isSuperAdmin = user.role === 'superadmin';
          return (
            <div
              key={user.id}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                    {user.name}
                    {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                {!isSelf && (
                  <button
                    onClick={() => setDeleteTarget(user)}
                    title="Delete"
                    aria-label="Delete"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base text-rose-600 transition hover:bg-slate-100 dark:text-rose-400 dark:hover:bg-slate-700"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                <RoleBadge role={user.role} />
                <button
                  disabled={isSelf}
                  onClick={() => toggleActive(user)}
                  title={isSelf ? "You can't deactivate your own account" : undefined}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  } ${isSelf ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'}`}
                >
                  {user.isActive ? 'Active' : 'Deactivated'}
                </button>
              </div>

              {!isSuperAdmin && (
                <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Module Access
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {MODULES.map((m) => {
                      const granted = Boolean(user.permissions[m.key]);
                      return (
                        <button
                          key={m.key}
                          onClick={() => togglePermission(user, m.key)}
                          title={granted ? `Revoke ${m.label} access` : `Grant ${m.label} access`}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                            granted
                              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-500 dark:hover:bg-slate-600'
                          }`}
                        >
                          {m.icon} {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Module Access</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users?.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const isSuperAdmin = user.role === 'superadmin';
              return (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {user.name}
                    {isSelf && <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    {isSuperAdmin ? (
                      <span className="text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400">
                        Full access to everything
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {MODULES.map((m) => {
                          const granted = Boolean(user.permissions[m.key]);
                          return (
                            <button
                              key={m.key}
                              onClick={() => togglePermission(user, m.key)}
                              title={granted ? `Revoke ${m.label} access` : `Grant ${m.label} access`}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                                granted
                                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-500 dark:hover:bg-slate-600'
                              }`}
                            >
                              {m.icon} {m.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={isSelf}
                      onClick={() => toggleActive(user)}
                      title={isSelf ? "You can't deactivate your own account" : undefined}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      } ${isSelf ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'}`}
                    >
                      {user.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      {!isSelf && (
                        <button
                          onClick={() => setDeleteTarget(user)}
                          title="Delete"
                          aria-label="Delete"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-base text-rose-600 transition hover:bg-slate-100 dark:text-rose-400 dark:hover:bg-slate-700"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddAdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (form) => {
          await createUser(form).unwrap();
          setModalOpen(false);
        }}
        isSaving={isCreating}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmValue={deleteTarget?.name}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
