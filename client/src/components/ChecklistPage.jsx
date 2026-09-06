import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiDownload, FiPaperclip, FiPlus } from 'react-icons/fi';
import { resolveFileUrl } from '../config/env';
import ChecklistFormModal from './ChecklistFormModal';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import FileUploadInput from './FileUploadInput';
import Spinner from './Spinner';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0
  );
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

const iconButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-slate-100 dark:hover:bg-slate-700';

// Shared list/table view for every checklist-style module (Planning,
// Marketing, Features, Delivery). Each module passes its own RTK Query hooks
// and a couple of labels; everything else (table, modal, attachments,
// delete confirmation) is identical. `dateLabel`/`costLabel`/`showEstimatedCost`
// let a module rename or drop the cost/date columns (Planning uses "Date" and
// "Cost" with no Estimated Cost column).
export default function ChecklistPage({
  title,
  subtitle,
  itemLabel,
  titleLabel,
  emptyMessage,
  basePath,
  dateLabel = 'Due Date',
  costLabel = 'Actual Cost',
  showEstimatedCost = true,
  showCost = true,
  showCategory = false,
  showDoneBy = true,
  showDate = true,
  showAttachments = true,
  hooks: {
    useGetItemsQuery,
    useCreateItemMutation,
    useUpdateItemMutation,
    useDeleteItemMutation,
    useUploadAttachmentMutation,
    useDeleteAttachmentMutation,
  },
}) {
  const { data: items, isLoading } = useGetItemsQuery();
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const [deleteItem] = useDeleteItemMutation();
  const [uploadAttachment] = useUploadAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  // Holds the item mid-toggle while its confirm dialog is open. The
  // checkbox itself stays controlled by item.status, so cancelling just
  // closes the dialog -- nothing to manually revert.
  const [pendingToggle, setPendingToggle] = useState(null);

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

  // The checkbox never applies immediately -- ticking or unticking just
  // opens a confirm dialog (see pendingToggle below) so a misclick can't
  // silently mark something done or throw away its completion record.
  const requestQuickComplete = (item, checked) => setPendingToggle({ item, checked });

  const confirmQuickComplete = async () => {
    if (!pendingToggle) return;
    await updateItem({
      id: pendingToggle.item._id,
      status: pendingToggle.checked ? 'complete' : 'pending',
    });
    setPendingToggle(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const categoryOptions = showCategory
    ? [...new Set((items || []).map((i) => i.category).filter(Boolean))]
    : [];

  let costColumns = 0;
  if (showCost) costColumns = showEstimatedCost ? 2 : 1;
  const columnCount =
    4 + costColumns + (showDoneBy ? 1 : 0) + (showDate ? 1 : 0) + (showAttachments ? 1 : 0);
  let lastCategory = null;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-fuchsia-700 sm:w-auto sm:py-2"
        >
          <FiPlus /> Add {itemLabel}
        </button>
      </div>

      {/* Mobile: one card per item -- a wide table with 7+ columns has no
          good small-screen answer other than not being a table. */}
      <div className="space-y-3 sm:hidden">
        {items?.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            {emptyMessage}
          </p>
        )}
        {(() => {
          let lastCategoryMobile = null;
          return items?.map((item, index) => {
            const showCategoryHeader = showCategory && item.category && item.category !== lastCategoryMobile;
            lastCategoryMobile = item.category;
            const isExpanded = expandedId === item._id;
            return (
              <div key={item._id}>
                {showCategoryHeader && (
                  <p className="mb-2 mt-1 px-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {item.category}
                  </p>
                )}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={item.status === 'complete'}
                        onChange={(e) => requestQuickComplete(item, e.target.checked)}
                        title={item.status === 'complete' ? 'Mark as pending' : 'Mark as complete'}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
                      />
                      <span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {index + 1}. {item.title}
                        </span>
                        {item.description && (
                          <span className="block text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </span>
                        )}
                      </span>
                    </label>
                    <StatusBadge status={item.status} />
                  </div>

                  {(showDoneBy || showDate || (showCost && showEstimatedCost) || showCost) && (
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-700">
                      {showDoneBy && item.completedBy && (
                        <div>
                          <dt className="text-slate-400 dark:text-slate-500">Done By</dt>
                          <dd className="font-medium text-slate-700 dark:text-slate-200">{item.completedBy}</dd>
                        </div>
                      )}
                      {showDate && (
                        <div>
                          <dt className="text-slate-400 dark:text-slate-500">{dateLabel}</dt>
                          <dd className="font-medium text-slate-700 dark:text-slate-200">
                            {formatDate(item.dueDate)}
                          </dd>
                        </div>
                      )}
                      {showCost && showEstimatedCost && (
                        <div>
                          <dt className="text-slate-400 dark:text-slate-500">Est. Cost</dt>
                          <dd className="font-medium text-slate-700 dark:text-slate-200">
                            {formatCurrency(item.estimatedCost)}
                          </dd>
                        </div>
                      )}
                      {showCost && (
                        <div>
                          <dt className="text-slate-400 dark:text-slate-500">{costLabel}</dt>
                          <dd className="font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(item.actualCost)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                    {showAttachments ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item._id)}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        >
                          {item.attachments?.length || 0} file(s)
                        </button>
                        <FileUploadInput onUpload={(file) => handleUpload(item._id, file)} label="" />
                      </div>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-1">
                      <Link
                        to={`${basePath}/${item._id}`}
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

                  {showAttachments && isExpanded && item.attachments?.length > 0 && (
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
              </div>
            );
          });
        })()}
      </div>

      {/* Tablet & up: the full table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="w-12 px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">#</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">{titleLabel}</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Status</th>
              {showDoneBy && (
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Done By</th>
              )}
              {showDate && (
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">{dateLabel}</th>
              )}
              {showCost && showEstimatedCost && (
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Est. Cost</th>
              )}
              {showCost && (
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">{costLabel}</th>
              )}
              {showAttachments && (
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Attachments</th>
              )}
              <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {items?.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {items?.map((item, index) => {
              const showCategoryHeader = showCategory && item.category && item.category !== lastCategory;
              lastCategory = item.category;
              return (
              <Fragment key={item._id}>
                {showCategoryHeader && (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400"
                    >
                      {item.category}
                    </td>
                  </tr>
                )}
                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.status === 'complete'}
                        onChange={(e) => requestQuickComplete(item, e.target.checked)}
                        title={item.status === 'complete' ? 'Mark as pending' : 'Mark as complete'}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
                      />
                      <StatusBadge status={item.status} />
                    </label>
                  </td>
                  {showDoneBy && (
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {item.completedBy || '—'}
                    </td>
                  )}
                  {showDate && (
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(item.dueDate)}</td>
                  )}
                  {showCost && showEstimatedCost && (
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatCurrency(item.estimatedCost)}</td>
                  )}
                  {showCost && (
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{formatCurrency(item.actualCost)}</td>
                  )}
                  {showAttachments && (
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
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`${basePath}/${item._id}`}
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
                {showAttachments && expandedId === item._id && item.attachments?.length > 0 && (
                  <tr>
                    <td colSpan={columnCount} className="bg-slate-50 px-4 py-2 dark:bg-slate-900/40">
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
              );
            })}
          </tbody>
        </table>
      </div>

      <ChecklistFormModal
        open={modalOpen}
        item={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSaving={isCreating || isUpdating}
        itemLabel={itemLabel}
        titleLabel={titleLabel}
        dateLabel={dateLabel}
        costLabel={costLabel}
        showEstimatedCost={showEstimatedCost}
        showCost={showCost}
        showCategory={showCategory}
        categoryOptions={categoryOptions}
        showDoneBy={showDoneBy}
        showDate={showDate}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${itemLabel.toLowerCase()}`}
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
        title={pendingToggle?.checked ? `Mark ${itemLabel.toLowerCase()} complete?` : `Mark ${itemLabel.toLowerCase()} pending?`}
        message={
          pendingToggle?.checked
            ? `"${pendingToggle?.item.title}" will be marked complete${showDoneBy ? ', recording who did it and when' : ''}.`
            : `"${pendingToggle?.item.title}" will go back to pending${showDoneBy ? ' -- its completed-by and completed-date will be cleared' : ''}.`
        }
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
