import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiDownload, FiPaperclip, FiPlus } from 'react-icons/fi';
import {
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
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
  const [expandedId, setExpandedId] = useState(null);

  const openAdd = () => {
    setEditingPurchase(null);
    setModalOpen(true);
  };
  const openEdit = (purchase) => {
    setEditingPurchase(purchase);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    if (editingPurchase) {
      await updatePurchase({ id: editingPurchase._id, ...form });
    } else {
      await createPurchase(form);
    }
    setModalOpen(false);
  };

  const handleUpload = async (purchaseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    await uploadAttachment({ id: purchaseId, formData });
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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Purchases</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Equipment and expenses for the business.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-fuchsia-700"
        >
          <FiPlus /> Add Purchase
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="w-12 px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">#</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Item</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Vendor</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Qty × Cost</th>
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
                    <p className="font-medium text-slate-800 dark:text-slate-100">{purchase.itemName}</p>
                    {purchase.category && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{purchase.category}</p>
                    )}
                    {purchase.linkedStep?.title && (
                      <p className="text-xs text-brand-600 dark:text-brand-400">↳ {purchase.linkedStep.title}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{purchase.vendor || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={purchase.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(purchase.purchaseDate)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {purchase.quantity} × {formatCurrency(purchase.unitCost)}
                  </td>
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
                    <td colSpan={9} className="bg-slate-50 px-4 py-2 dark:bg-slate-900/40">
                      <ul className="space-y-1">
                        {purchase.attachments.map((a) => (
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
                                onClick={() =>
                                  deleteAttachment({ id: purchase._id, attachmentId: a._id })
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
        message={`Delete "${deleteTarget?.itemName}"? This cannot be undone.`}
        confirmValue={deleteTarget?.itemName}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deletePurchase(deleteTarget._id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
