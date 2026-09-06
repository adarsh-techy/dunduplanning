import ChecklistDetailPage from '../../components/ChecklistDetailPage';
import {
  useGetPackingItemsQuery,
  useUpdatePackingItemMutation,
  useDeletePackingItemMutation,
  useUploadPackingAttachmentMutation,
  useDeletePackingAttachmentMutation,
} from './packingApiSlice';

export default function PackingDetailPage() {
  return (
    <ChecklistDetailPage
      backTo="/packing"
      backLabel="Packing"
      itemLabel="Item"
      titleLabel="Item"
      hooks={{
        useGetItemsQuery: useGetPackingItemsQuery,
        useUpdateItemMutation: useUpdatePackingItemMutation,
        useDeleteItemMutation: useDeletePackingItemMutation,
        useUploadAttachmentMutation: useUploadPackingAttachmentMutation,
        useDeleteAttachmentMutation: useDeletePackingAttachmentMutation,
      }}
    />
  );
}
