import { createChecklistApiSlice } from '../../app/createChecklistApiSlice';

export const deliveryApiSlice = createChecklistApiSlice({
  basePath: '/delivery',
  tagType: 'Delivery',
  prefix: 'Delivery',
});

export const {
  useGetDeliveryItemsQuery,
  useCreateDeliveryItemMutation,
  useUpdateDeliveryItemMutation,
  useDeleteDeliveryItemMutation,
  useUploadDeliveryAttachmentMutation,
  useDeleteDeliveryAttachmentMutation,
} = deliveryApiSlice;
