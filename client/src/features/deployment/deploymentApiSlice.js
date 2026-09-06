import { createChecklistApiSlice } from '../../app/createChecklistApiSlice';

export const deploymentApiSlice = createChecklistApiSlice({
  basePath: '/deployment',
  tagType: 'Deployment',
  prefix: 'Deployment',
});

export const {
  useGetDeploymentItemsQuery,
  useCreateDeploymentItemMutation,
  useUpdateDeploymentItemMutation,
  useDeleteDeploymentItemMutation,
  useUploadDeploymentAttachmentMutation,
  useDeleteDeploymentAttachmentMutation,
} = deploymentApiSlice;
