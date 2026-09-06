import ChecklistPage from '../../components/ChecklistPage';
import {
  useGetDeliveryItemsQuery,
  useCreateDeliveryItemMutation,
  useUpdateDeliveryItemMutation,
  useDeleteDeliveryItemMutation,
  useUploadDeliveryAttachmentMutation,
  useDeleteDeliveryAttachmentMutation,
} from './deliveryApiSlice';

export default function DeliveryPage() {
  return (
    <ChecklistPage
      title="Delivery"
      subtitle="Delivery and logistics management planning."
      itemLabel="Delivery Task"
      titleLabel="Task"
      basePath="/delivery"
      emptyMessage='No delivery tasks yet. Click "Add Delivery Task" to start planning.'
      hooks={{
        useGetItemsQuery: useGetDeliveryItemsQuery,
        useCreateItemMutation: useCreateDeliveryItemMutation,
        useUpdateItemMutation: useUpdateDeliveryItemMutation,
        useDeleteItemMutation: useDeleteDeliveryItemMutation,
        useUploadAttachmentMutation: useUploadDeliveryAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteDeliveryAttachmentMutation,
      }}
    />
  );
}
