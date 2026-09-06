import { createChecklistApiSlice } from '../../app/createChecklistApiSlice';

export const packingApiSlice = createChecklistApiSlice({
  basePath: '/packing',
  tagType: 'Packing',
  prefix: 'Packing',
});

export const {
  useGetPackingItemsQuery,
  useCreatePackingItemMutation,
  useUpdatePackingItemMutation,
  useDeletePackingItemMutation,
  useUploadPackingAttachmentMutation,
  useDeletePackingAttachmentMutation,
} = packingApiSlice;
