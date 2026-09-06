import ChecklistPage from '../../components/ChecklistPage';
import {
  useGetPackingItemsQuery,
  useCreatePackingItemMutation,
  useUpdatePackingItemMutation,
  useDeletePackingItemMutation,
  useUploadPackingAttachmentMutation,
  useDeletePackingAttachmentMutation,
} from './packingApiSlice';

export default function PackingPage() {
  return (
    <ChecklistPage
      title="Packing"
      subtitle="Packing materials, printing and fulfillment process — cost and status for each part."
      itemLabel="Item"
      titleLabel="Item"
      basePath="/packing"
      emptyMessage='No packing items yet. Click "Add Item" to start.'
      hooks={{
        useGetItemsQuery: useGetPackingItemsQuery,
        useCreateItemMutation: useCreatePackingItemMutation,
        useUpdateItemMutation: useUpdatePackingItemMutation,
        useDeleteItemMutation: useDeletePackingItemMutation,
        useUploadAttachmentMutation: useUploadPackingAttachmentMutation,
        useDeleteAttachmentMutation: useDeletePackingAttachmentMutation,
      }}
    />
  );
}
