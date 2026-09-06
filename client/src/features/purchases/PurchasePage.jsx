import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiDownload, FiFileText, FiPaperclip, FiPlus } from 'react-icons/fi';
import { resolveFileUrl } from '../../config/env';
import { downloadPurchasesCsv } from '../../utils/purchaseExport';
import {
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useUploadPurchaseAttachmentMutation,
  useDeletePurchaseAttachmentMutation,
} from './purchasesApiSlice';
import PurchaseFormModal from './PurchaseFormModal';
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

export default function PurchasePage() {
  const { data: purchases, isLoading } = useGetPurchasesQuery();
  const [createPurchase, { isLoading: isCreating }] = useCreatePurchaseMutation();
  const [updatePurchase, { isLoading: isUpdating }] = useUpdatePurchaseMutation();
  const [deletePurchase] = useDeletePurchaseMutation();
  const [uploadAttachment] = useUploadPurchaseAttachmentMutation();
  const [deleteAttachment] = useDeletePurchaseAttachmentMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const openAdd = () => {
    setEditingPurchase(null);
    setModalOpen(true);
  };
  const openEdit = (purchase) => {
    setEditingPurchase(purchase);
    setModalOpen(true);
  };

  const handleUpload = async (purchaseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    await uploadAttachment({ id: purchaseId, formData });
  };

  const handleSubmit = async (form, billFile) => {
    let purchaseId = editingPurchase?._id;
    if (editingPurchase) {
      await updatePurchase({ id: editingPurchase._id, ...form });
    } else {
      const { purchase } = await createPurchase(form).unwrap();
      purchaseId = purchase._id;
    }
    if (billFile && purchaseId) {
      await handleUpload(purchaseId, billFile);
    }
    setModalOpen(false);
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Purchases</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Equipment and expenses for the business.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={() => downloadPurchasesCsv(purchases || [], 'purchases')}
            disabled={!purchases?.length}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 sm:py-2"
          >
            <FiDownload /> Download Excel
          </button>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-fuchsia-700 sm:py-2"
          >
            <FiPlus /> Add Purchase
          </button>
        </div>
      </div>

      {/* Mobile: one card per purchase instead of a 9-column table */}
      <div className="space-y-3 sm:hidden">
        {purchases?.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No purchases yet. Click "Add Purchase" to log one.
          </p>
        )}
        {purchases?.map((purchase, index) => {
          const isExpanded = expandedId === purchase._id;
          return (
            <div
              key={purchase._id}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {index + 1}. {purchase.vendorName}
                  </p>
                  {purchase.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{purchase.location}</p>
                  )}
                </div>
                <p className="shrink-0 font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {formatCurrency(purchase.totalCost)}
                </p>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-700">
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Products</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {purchase.items?.length
                      ? `${purchase.items[0].productName}${
                          purchase.items.length > 1 ? ` +${purchase.items.length - 1} more` : ''
                        }`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Who</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">{purchase.purchasedBy || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Payment</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {PAYMENT_LABELS[purchase.paymentMethod] || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Date</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(purchase.purchaseDate)}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : purchase._id)}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    {purchase.attachments?.length || 0} file(s)
                  </button>
                  <FileUploadInput onUpload={(file) => handleUpload(purchase._id, file)} label="" />
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/purchases/${purchase._id}`}
                    title="View"
                    aria-label="View"
                    className={`${iconButtonClass} text-slate-500 dark:text-slate-400`}
                  >
                    <FiEye />
                  </Link>
                  <button
                    onClick={() =>
                      import('../../utils/purchaseInvoice').then((m) => m.downloadPurchaseInvoice(purchase))
                    }
                    title="Download Invoice"
                    aria-label="Download Invoice"
                    className={`${iconButtonClass} text-slate-500 dark:text-slate-400`}
                  >
                    <FiFileText />
                  </button>
                  <button
                    onClick={() => openEdit(purchase)}
                    title="Edit"
                    aria-label="Edit"
                    className={`${iconButtonClass} text-brand-600 dark:text-brand-400`}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(purchase)}
                    title="Delete"
                    aria-label="Delete"
                    className={`${iconButtonClass} text-rose-600 dark:text-rose-400`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {isExpanded && purchase.attachments?.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 dark:border-slate-700">
                  {purchase.attachments.map((a) => (
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
                            setAttachmentToDelete({ purchaseId: purchase._id, attachmentId: a._id, fileName: a.fileName })
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
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Vendor</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Products</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Who</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Payment</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Total</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Attachments</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {purchases?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No purchases yet. Click "Add Purchase" to log one.
                </td>
              </tr>
            )}
            {purchases?.map((purchase, index) => (
              <Fragment key={purchase._id}>
                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{purchase.vendorName}</p>
                    {purchase.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{purchase.location}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {purchase.items?.length ? (
                      <>
                        <p>{purchase.items[0].productName}</p>
                        {purchase.items.length > 1 && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            +{purchase.items.length - 1} more
                          </p>
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{purchase.purchasedBy || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {PAYMENT_LABELS[purchase.paymentMethod] || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(purchase.purchaseDate)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {formatCurrency(purchase.totalCost)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === purchase._id ? null : purchase._id)
                        }
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      >
                        {purchase.attachments?.length || 0} file(s)
                      </button>
                      <FileUploadInput
                        onUpload={(file) => handleUpload(purchase._id, file)}
                        label=""
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/purchases/${purchase._id}`}
                        title="View"
                        aria-label="View"
                        className={`${iconButtonClass} text-slate-500 dark:text-slate-400`}
                      >
                        <FiEye />
                      </Link>
                      <button
                        onClick={() =>
                          import('../../utils/purchaseInvoice').then((m) => m.downloadPurchaseInvoice(purchase))
                        }
                        title="Download Invoice"
                        aria-label="Download Invoice"
                        className={`${iconButtonClass} text-slate-500 dark:text-slate-400`}
                      >
                        <FiFileText />
                      </button>
                      <button
                        onClick={() => openEdit(purchase)}
                        title="Edit"
                        aria-label="Edit"
                        className={`${iconButtonClass} text-brand-600 dark:text-brand-400`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(purchase)}
                        title="Delete"
                        aria-label="Delete"
                        className={`${iconButtonClass} text-rose-600 dark:text-rose-400`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === purchase._id && purchase.attachments?.length > 0 && (
                  <tr>
                    <td colSpan={10} className="bg-slate-50 px-4 py-2 dark:bg-slate-900/40">
                      <ul className="space-y-1">
                        {purchase.attachments.map((a) => (
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
                                  setAttachmentToDelete({ purchaseId: purchase._id, attachmentId: a._id, fileName: a.fileName })
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

      <PurchaseFormModal
        open={modalOpen}
        purchase={editingPurchase}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSaving={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete purchase"
        message={`Delete the purchase from "${deleteTarget?.vendorName}"? This cannot be undone.`}
        confirmValue={deleteTarget?.vendorName}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deletePurchase(deleteTarget._id);
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(attachmentToDelete)}
        title="Delete attachment"
        message={`Delete "${attachmentToDelete?.fileName}"? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setAttachmentToDelete(null)}
        onConfirm={async () => {
          await deleteAttachment({ id: attachmentToDelete.purchaseId, attachmentId: attachmentToDelete.attachmentId });
          setAttachmentToDelete(null);
        }}
      />
    </div>
  );
}
