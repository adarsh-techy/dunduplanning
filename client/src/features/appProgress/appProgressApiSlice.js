import { createChecklistApiSlice } from '../../app/createChecklistApiSlice';

export const appProgressApiSlice = createChecklistApiSlice({
  basePath: '/app-progress',
  tagType: 'AppFeature',
  prefix: 'AppFeature',
});

export const {
  useGetAppFeatureItemsQuery,
  useCreateAppFeatureItemMutation,
  useUpdateAppFeatureItemMutation,
  useDeleteAppFeatureItemMutation,
  useUploadAppFeatureAttachmentMutation,
  useDeleteAppFeatureAttachmentMutation,
} = appProgressApiSlice;
