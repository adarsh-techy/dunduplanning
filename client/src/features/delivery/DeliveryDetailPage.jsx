import ChecklistDetailPage from '../../components/ChecklistDetailPage';
import {
  useGetDeliveryItemsQuery,
  useUpdateDeliveryItemMutation,
  useDeleteDeliveryItemMutation,
  useUploadDeliveryAttachmentMutation,
  useDeleteDeliveryAttachmentMutation,
} from './deliveryApiSlice';

export default function DeliveryDetailPage() {
  return (
    <ChecklistDetailPage
      backTo="/delivery"
      backLabel="Delivery"
      itemLabel="Delivery Task"
      titleLabel="Task"
      hooks={{
        useGetItemsQuery: useGetDeliveryItemsQuery,
        useUpdateItemMutation: useUpdateDeliveryItemMutation,
        useDeleteItemMutation: useDeleteDeliveryItemMutation,
        useUploadAttachmentMutation: useUploadDeliveryAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteDeliveryAttachmentMutation,
      }}
    />
  );
}
