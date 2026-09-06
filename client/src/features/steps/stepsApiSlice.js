import { createChecklistApiSlice } from '../../app/createChecklistApiSlice';

export const stepsApiSlice = createChecklistApiSlice({
  basePath: '/steps',
  tagType: 'Step',
  prefix: 'Step',
});

export const {
  useGetStepItemsQuery,
  useCreateStepItemMutation,
  useUpdateStepItemMutation,
  useDeleteStepItemMutation,
  useUploadStepAttachmentMutation,
  useDeleteStepAttachmentMutation,
} = stepsApiSlice;
