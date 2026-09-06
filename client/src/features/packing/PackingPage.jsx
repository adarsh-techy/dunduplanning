import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiDownload, FiPaperclip, FiPlus } from 'react-icons/fi';
import { resolveFileUrl } from '../../config/env';
import {
  useGetPackingItemsQuery,
  useCreatePackingItemMutation,
  useUpdatePackingItemMutation,
  useDeletePackingItemMutation,
  useUploadPackingAttachmentMutation,
  useDeletePackingAttachmentMutation,
} from './packingApiSlice';
import PackingFormModal from './PackingFormModal';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import FileUploadInput from '../../components/FileUploadInput';
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

const iconButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-slate-100 dark:hover:bg-slate-700';

export default function PackingPage() {
  const { data: items, isLoading } = useGetPackingItemsQuery();
  const [createItem, { isLoading: isCreating }] = useCreatePackingItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdatePackingItemMutation();
  const [deleteItem] = useDeletePackingItemMutation();
  const [uploadAttachment] = useUploadPackingAttachmentMutation();
  const [deleteAttachment] = useDeletePackingAttachmentMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const openAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    if (editingItem) {
      await updateItem({ id: editingItem._id, ...form });
    } else {
      await createItem(form);
    }
    setModalOpen(false);
  };

  const handleUpload = async (itemId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    await uploadAttachment({ id: itemId, formData });
  };

  const confirmQuickComplete = async () => {
    if (!pendingToggle) return;
    await updateItem({ id: pendingToggle.item._id, status: pendingToggle.checked ? 'complete' : 'pending' });
    setPendingToggle(null);
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
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Packing</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Packing materials, printing and fulfillment process — cost and status for each part.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-fuchsia-700 sm:w-auto sm:py-2"
        >
          <FiPlus /> Add Item
        </button>
      </div>

      {/* Mobile: one card per item instead of a 10-column table */}
      <div className="space-y-3 sm:hidden">
        {items?.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No packing items yet. Click "Add Item" to start.
          </p>
        )}
        {items?.map((item, index) => {
          const isExpanded = expandedId === item._id;
          return (
            <div
              key={item._id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={item.status === 'complete'}
                    onChange={(e) => setPendingToggle({ item, checked: e.target.checked })}
                    title={item.status === 'complete' ? 'Mark as pending' : 'Mark as complete'}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
                  />
                  <span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {index + 1}. {item.title}
                    </span>
                    {item.brandName && (
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {item.brandName}
                        {item.location ? ` · ${item.location}` : ''}
                      </span>
                    )}
                  </span>
                </label>
                <StatusBadge status={item.status} />
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-700">
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Who</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">{item.who || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Payment</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {PAYMENT_LABELS[item.paymentMethod] || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Qty</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">{item.itemQty ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Date</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">{formatDate(item.date)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Cost</dt>
                  <dd className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(item.cost)}</dd>
                </div>
              </dl>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    {item.attachments?.length || 0} file(s)
                  </button>
                  <FileUploadInput onUpload={(file) => handleUpload(item._id, file)} label="" />
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/packing/${item._id}`}
                    title="View"
                    aria-label="View"
                    className={`${iconButtonClass} text-slate-500 dark:text-slate-400`}
                  >
                    <FiEye />
                  </Link>
                  <button
                    onClick={() => openEdit(item)}
                    title="Edit"
                    aria-label="Edit"
                    className={`${iconButtonClass} text-brand-600 dark:text-brand-400`}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Delete"
                    aria-label="Delete"
                    className={`${iconButtonClass} text-rose-600 dark:text-rose-400`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {isExpanded && item.attachments?.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 dark:border-slate-700">
                  {item.attachments.map((a) => (
                    <li key={a._id} className="flex items-center justify-between text-xs">
                      <span className="flex min-w-0 items-center gap-1.5 truncate text-slate-600 dark:text-slate-300">
                        <FiPaperclip className="shrink-0" /> {a.fileName}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <a
                          href={resolveFileUrl(a.filePath)}
                          target="_blank"
                          rel="noreferrer"
                          title="View"
                          aria-label="View"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                        >
                          <FiEye />
                        </a>
                        <a
                          href={resolveFileUrl(a.filePath)}
                          download={a.fileName}
                          title="Download"
                          aria-label="Download"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-brand-600 hover:bg-slate-200 dark:text-brand-400 dark:hover:bg-slate-700"
                        >
                          <FiDownload />
                        </a>
                        <button
                          onClick={() =>
                            setAttachmentToDelete({ itemId: item._id, attachmentId: a._id, fileName: a.fileName })
                          }
                          title="Remove"
                          aria-label="Remove"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-rose-600 hover:bg-slate-200 dark:text-rose-400 dark:hover:bg-slate-700"
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="w-12 px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">#</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Item</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Who</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Payment</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Qty</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Cost</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Attachments</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {items?.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No packing items yet. Click "Add Item" to start.
                </td>
              </tr>
            )}
            {items?.map((item, index) => (
              <Fragment key={item._id}>
                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                    {item.brandName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.brandName}
                        {item.location ? ` · ${item.location}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.status === 'complete'}
                        onChange={(e) => setPendingToggle({ item, checked: e.target.checked })}
                        title={item.status === 'complete' ? 'Mark as pending' : 'Mark as complete'}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
                      />
                      <StatusBadge status={item.status} />
                    </label>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.who || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {PAYMENT_LABELS[item.paymentMethod] || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.itemQty ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(item.date)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {formatCurrency(item.cost)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      >
                        {item.attachments?.length || 0} file(s)
                      </button>
                      <FileUploadInput onUpload={(file) => handleUpload(item._id, file)} label="" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/packing/${item._id}`}
                        title="View"
                        aria-label="View"
                        className={`${iconButtonClass} text-slate-500 dark:text-slate-400`}
                      >
                        <FiEye />
                      </Link>
                      <button
                        onClick={() => openEdit(item)}
                        title="Edit"
                        aria-label="Edit"
                        className={`${iconButtonClass} text-brand-600 dark:text-brand-400`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        title="Delete"
                        aria-label="Delete"
                        className={`${iconButtonClass} text-rose-600 dark:text-rose-400`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === item._id && item.attachments?.length > 0 && (
                  <tr>
                    <td colSpan={10} className="bg-slate-50 px-4 py-2 dark:bg-slate-900/40">
                      <ul className="space-y-1">
                        {item.attachments.map((a) => (
                          <li key={a._id} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 truncate text-slate-600 dark:text-slate-300">
                              <FiPaperclip className="shrink-0" /> {a.fileName}
                            </span>
                            <span className="flex shrink-0 items-center gap-1">
                              <a
                                href={resolveFileUrl(a.filePath)}
                                target="_blank"
                                rel="noreferrer"
                                title="View"
                                aria-label="View"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                              >
                                <FiEye />
                              </a>
                              <a
                                href={resolveFileUrl(a.filePath)}
                                download={a.fileName}
                                title="Download"
                                aria-label="Download"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-brand-600 hover:bg-slate-200 dark:text-brand-400 dark:hover:bg-slate-700"
                              >
                                <FiDownload />
                              </a>
                              <button
                                onClick={() =>
                                  setAttachmentToDelete({ itemId: item._id, attachmentId: a._id, fileName: a.fileName })
                                }
                                title="Remove"
                                aria-label="Remove"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-rose-600 hover:bg-slate-200 dark:text-rose-400 dark:hover:bg-slate-700"
                              >
                                <FiTrash2 />
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <PackingFormModal
        open={modalOpen}
        item={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSaving={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete item"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmValue={deleteTarget?.title}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteItem(deleteTarget._id);
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        tone={pendingToggle?.checked ? 'success' : 'warning'}
        title={pendingToggle?.checked ? 'Mark item complete?' : 'Mark item pending?'}
        message={`"${pendingToggle?.item.title}" will be marked ${pendingToggle?.checked ? 'complete' : 'pending'}.`}
        confirmLabel={pendingToggle?.checked ? 'Mark complete' : 'Mark pending'}
        onCancel={() => setPendingToggle(null)}
        onConfirm={confirmQuickComplete}
      />

      <ConfirmDialog
        open={Boolean(attachmentToDelete)}
        title="Delete attachment"
        message={`Delete "${attachmentToDelete?.fileName}"? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setAttachmentToDelete(null)}
        onConfirm={async () => {
          await deleteAttachment({ id: attachmentToDelete.itemId, attachmentId: attachmentToDelete.attachmentId });
          setAttachmentToDelete(null);
        }}
      />
    </div>
  );
}
