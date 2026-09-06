import { createChecklistApiSlice } from '../../app/createChecklistApiSlice';

export const featuresApiSlice = createChecklistApiSlice({
  basePath: '/features',
  tagType: 'Feature',
  prefix: 'Feature',
});

export const {
  useGetFeatureItemsQuery,
  useCreateFeatureItemMutation,
  useUpdateFeatureItemMutation,
  useDeleteFeatureItemMutation,
  useUploadFeatureAttachmentMutation,
  useDeleteFeatureAttachmentMutation,
} = featuresApiSlice;
