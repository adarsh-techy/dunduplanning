import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiEye, FiDownload } from 'react-icons/fi';
import {
  useGetPurchasesQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useUploadPurchaseAttachmentMutation,
  useDeletePurchaseAttachmentMutation,
} from './purchasesApiSlice';
import PurchaseFormModal from './PurchaseFormModal';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import FileUploadInput from '../../components/FileUploadInput';
import Spinner from '../../components/Spinner';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0
  );
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

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
      <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: purchases, isLoading } = useGetPurchasesQuery();
  const [updatePurchase, { isLoading: isUpdating }] = useUpdatePurchaseMutation();
  const [deletePurchase] = useDeletePurchaseMutation();
  const [uploadAttachment] = useUploadPurchaseAttachmentMutation();
  const [deleteAttachment] = useDeletePurchaseAttachmentMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const purchase = purchases?.find((p) => p._id === id);

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

  if (!purchase) {
    return (
      <div>
        <Link
          to="/purchases"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <FiArrowLeft /> Back to Purchases
        </Link>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          This purchase could not be found — it may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/purchases"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        <FiArrowLeft /> Back to Purchases
      </Link>

      <div className="mt-4 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 p-5 text-white shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Purchase</p>
            <h1 className="mt-0.5 truncate text-2xl font-extrabold tracking-tight">{purchase.itemName}</h1>
            <div className="mt-3">
              <StatusBadge status={purchase.status} />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
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
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Category" value={purchase.category} />
            <Field label="Vendor" value={purchase.vendor} />
            <Field label="Linked Step" value={purchase.linkedStep?.title} />
            <Field label="Date" value={formatDate(purchase.purchaseDate)} />
            <Field
              label="Quantity × Unit Cost"
              value={`${purchase.quantity} × ${formatCurrency(purchase.unitCost)}`}
            />
            <Field label="Total" value={formatCurrency(purchase.totalCost)} />
            <Field label="Notes" value={purchase.notes} full />
          </dl>
        </InfoCard>

        <InfoCard>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Attachments
            </h2>
            <FileUploadInput onUpload={handleUpload} label="Add file" />
          </div>
          {purchase.attachments?.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {purchase.attachments.map((a) => (
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
                      href={a.filePath}
                      target="_blank"
                      rel="noreferrer"
                      title="View"
                      aria-label="View"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <FiEye />
                    </a>
                    <a
                      href={a.filePath}
                      download={a.fileName}
                      title="Download"
                      aria-label="Download"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-base text-brand-600 transition hover:bg-slate-200 dark:text-brand-400 dark:hover:bg-slate-700"
                    >
                      <FiDownload />
                    </a>
                    <button
                      onClick={() => deleteAttachment({ id, attachmentId: a._id })}
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

      <PurchaseFormModal
        open={editOpen}
        purchase={purchase}
        onClose={() => setEditOpen(false)}
        onSubmit={async (form) => {
          await updatePurchase({ id: purchase._id, ...form });
          setEditOpen(false);
        }}
        isSaving={isUpdating}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete purchase"
        message={`Delete "${purchase.itemName}"? This cannot be undone.`}
        confirmValue={purchase.itemName}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deletePurchase(purchase._id);
          navigate('/purchases');
        }}
      />
    </div>
  );
}
