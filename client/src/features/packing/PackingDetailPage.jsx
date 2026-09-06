import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiEye, FiDownload } from 'react-icons/fi';
import { resolveFileUrl } from '../../config/env';
import {
  useGetPackingItemsQuery,
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

export default function PackingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: items, isLoading } = useGetPackingItemsQuery();
  const [updateItem, { isLoading: isUpdating }] = useUpdatePackingItemMutation();
  const [deleteItem] = useDeletePackingItemMutation();
  const [uploadAttachment] = useUploadPackingAttachmentMutation();
  const [deleteAttachment] = useDeletePackingAttachmentMutation();

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
          to="/packing"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <FiArrowLeft /> Back to Packing
        </Link>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          This item could not be found — it may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/packing"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        <FiArrowLeft /> Back to Packing
      </Link>

      <div className="mt-4 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 p-5 text-white shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Packing Item</p>
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
        <InfoCard title="Overview">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <Field label="Description" value={item.description} full />
            <Field label="Brand Name" value={item.brandName} />
            <Field label="Location" value={item.location} />
            <Field label="Date" value={formatDate(item.date)} />
            <Field label="Who" value={item.who} />
            <Field label="Payment Method" value={PAYMENT_LABELS[item.paymentMethod]} />
            <Field label="Item Qty" value={item.itemQty} />
            <Field label="Cost" value={formatCurrency(item.cost)} />
            <Field label="Notes" value={item.notes} full />
          </dl>
        </InfoCard>

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
      </div>

      <PackingFormModal
        open={editOpen}
        item={item}
        onClose={() => setEditOpen(false)}
        onSubmit={async (form) => {
          await updateItem({ id: item._id, ...form });
          setEditOpen(false);
        }}
        isSaving={isUpdating}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete item"
        message={`Delete "${item.title}"? This cannot be undone.`}
        confirmValue={item.title}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteItem(item._id);
          navigate('/packing');
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
