import { createChecklistApiSlice } from '../../app/createChecklistApiSlice';

export const marketingApiSlice = createChecklistApiSlice({
  basePath: '/marketing',
  tagType: 'Marketing',
  prefix: 'Marketing',
});

export const {
  useGetMarketingItemsQuery,
  useCreateMarketingItemMutation,
  useUpdateMarketingItemMutation,
  useDeleteMarketingItemMutation,
  useUploadMarketingAttachmentMutation,
  useDeleteMarketingAttachmentMutation,
} = marketingApiSlice;
