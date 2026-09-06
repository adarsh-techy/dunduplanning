import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiDownload, FiPaperclip, FiPlus } from 'react-icons/fi';
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

  const toggleQuickComplete = (item, checked) =>
    updateItem({ id: item._id, status: checked ? 'complete' : 'pending' });

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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-fuchsia-700"
        >
          <FiPlus /> Add {itemLabel}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
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
                        onChange={(e) => toggleQuickComplete(item, e.target.checked)}
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
                                href={a.filePath}
                                target="_blank"
                                rel="noreferrer"
                                title="View"
                                aria-label="View"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                              >
                                <FiEye />
                              </a>
                              <a
                                href={a.filePath}
                                download={a.fileName}
                                title="Download"
                                aria-label="Download"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-brand-600 hover:bg-slate-200 dark:text-brand-400 dark:hover:bg-slate-700"
                              >
                                <FiDownload />
                              </a>
                              <button
                                onClick={() => deleteAttachment({ id: item._id, attachmentId: a._id })}
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
    </div>
  );
}
