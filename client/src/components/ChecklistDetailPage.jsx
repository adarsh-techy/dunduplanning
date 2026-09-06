import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiEye, FiDownload, FiCheckCircle } from 'react-icons/fi';
import { resolveFileUrl } from '../config/env';
import StatusBadge from './StatusBadge';
import ChecklistFormModal from './ChecklistFormModal';
import ConfirmDialog from './ConfirmDialog';
import FileUploadInput from './FileUploadInput';
import Spinner from './Spinner';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0
  );
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

const FILE_ICONS = { pdf: '📕', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️' };
const fileIcon = (name = '') => FILE_ICONS[name.split('.').pop()?.toLowerCase()] || '📄';

function InfoCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {title && (
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function Field({ label, value, full }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-line text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}

// Shared full-page detail view for every checklist-style module (Planning,
// Marketing, Features, Delivery) -- a real routed page rather than a popup,
// so it has its own URL and can be linked to / bookmarked / shared.
export default function ChecklistDetailPage({
  backTo,
  backLabel,
  itemLabel,
  titleLabel,
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
    useUpdateItemMutation,
    useDeleteItemMutation,
    useUploadAttachmentMutation,
    useDeleteAttachmentMutation,
  },
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: items, isLoading } = useGetItemsQuery();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const [deleteItem] = useDeleteItemMutation();
  const [uploadAttachment] = useUploadAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  const item = items?.find((i) => i._id === id);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await uploadAttachment({ id, formData });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <FiArrowLeft /> Back to {backLabel}
        </Link>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          This {itemLabel.toLowerCase()} could not be found — it may have been deleted.
        </p>
      </div>
    );
  }

  const isComplete = item.status === 'complete';

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        <FiArrowLeft /> Back to {backLabel}
      </Link>

      {/* Header */}
      <div className="mt-4 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 p-5 text-white shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              {itemLabel}
              {showCategory && item.category ? ` · ${item.category}` : ''}
            </p>
            <h1 className="mt-0.5 truncate text-2xl font-extrabold tracking-tight">{item.title}</h1>
            <div className="mt-3">
              <StatusBadge status={item.status} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              <FiEdit2 /> Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-rose-500/80"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {/* Overview */}
        <InfoCard title="Overview">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <Field label="Description" value={item.description} full />
            {showDate && <Field label={dateLabel} value={formatDate(item.dueDate)} />}
            {showCost && showEstimatedCost && (
              <Field label="Estimated Cost" value={formatCurrency(item.estimatedCost)} />
            )}
            {showCost && <Field label={costLabel} value={formatCurrency(item.actualCost)} />}
            <Field label="Notes" value={item.notes} full />
          </dl>
        </InfoCard>

        {/* Who did it / when -- the completion record */}
        <InfoCard title="Completion">
          {isComplete ? (
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <FiCheckCircle />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {showDoneBy && item.completedBy ? `Completed by ${item.completedBy}` : 'Completed'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDateTime(item.completedDate)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Not completed yet. Mark it complete from Edit to record who did it and when.
            </p>
          )}
          <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-700 sm:grid-cols-2">
            <Field label="Created by" value={item.createdBy?.name} />
            <Field label="Created on" value={formatDateTime(item.createdAt)} />
            <Field label="Last updated by" value={item.updatedBy?.name} />
            <Field label="Last updated on" value={formatDateTime(item.updatedAt)} />
          </dl>
        </InfoCard>

        {/* Attachments */}
        {showAttachments && (
          <InfoCard>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Attachments
              </h2>
              <FileUploadInput onUpload={handleUpload} label="Add file" />
            </div>
            {item.attachments?.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {item.attachments.map((a) => (
                  <li
                    key={a._id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-900/40"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <span className="text-lg">{fileIcon(a.fileName)}</span>
                      <span className="truncate">{a.fileName}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <a
                        href={resolveFileUrl(a.filePath)}
                        target="_blank"
                        rel="noreferrer"
                        title="View"
                        aria-label="View"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <FiEye />
                      </a>
                      <a
                        href={resolveFileUrl(a.filePath)}
                        download={a.fileName}
                        title="Download"
                        aria-label="Download"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-base text-brand-600 transition hover:bg-slate-200 dark:text-brand-400 dark:hover:bg-slate-700"
                      >
                        <FiDownload />
                      </a>
                      <button
                        onClick={() => setAttachmentToDelete({ attachmentId: a._id, fileName: a.fileName })}
                        title="Remove"
                        aria-label="Remove"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-base text-rose-600 transition hover:bg-slate-200 dark:text-rose-400 dark:hover:bg-slate-700"
                      >
                        <FiTrash2 />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">No attachments yet.</p>
            )}
          </InfoCard>
        )}
      </div>

      <ChecklistFormModal
        open={editOpen}
        item={item}
        onClose={() => setEditOpen(false)}
        onSubmit={async (form) => {
          await updateItem({ id: item._id, ...form });
          setEditOpen(false);
        }}
        isSaving={isUpdating}
        itemLabel={itemLabel}
        titleLabel={titleLabel}
        dateLabel={dateLabel}
        costLabel={costLabel}
        showEstimatedCost={showEstimatedCost}
        showCost={showCost}
        showCategory={showCategory}
        categoryOptions={showCategory ? [...new Set((items || []).map((i) => i.category).filter(Boolean))] : []}
        showDoneBy={showDoneBy}
        showDate={showDate}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${itemLabel.toLowerCase()}`}
        message={`Delete "${item.title}"? This cannot be undone.`}
        confirmValue={item.title}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteItem(item._id);
          navigate(backTo);
        }}
      />

      <ConfirmDialog
        open={Boolean(attachmentToDelete)}
        title="Delete attachment"
        message={`Delete "${attachmentToDelete?.fileName}"? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setAttachmentToDelete(null)}
        onConfirm={async () => {
          await deleteAttachment({ id, attachmentId: attachmentToDelete.attachmentId });
          setAttachmentToDelete(null);
        }}
      />
    </div>
  );
}
