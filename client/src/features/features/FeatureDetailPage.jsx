import ChecklistDetailPage from '../../components/ChecklistDetailPage';
import {
  useGetFeatureItemsQuery,
  useUpdateFeatureItemMutation,
  useDeleteFeatureItemMutation,
  useUploadFeatureAttachmentMutation,
  useDeleteFeatureAttachmentMutation,
} from './featuresApiSlice';

export default function FeatureDetailPage() {
  return (
    <ChecklistDetailPage
      backTo="/features"
      backLabel="Features"
      itemLabel="Feature"
      titleLabel="Feature"
      showEstimatedCost={false}
      showCost={false}
      showCategory
      showDoneBy={false}
      showDate={false}
      showAttachments={false}
      hooks={{
        useGetItemsQuery: useGetFeatureItemsQuery,
        useUpdateItemMutation: useUpdateFeatureItemMutation,
        useDeleteItemMutation: useDeleteFeatureItemMutation,
        useUploadAttachmentMutation: useUploadFeatureAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteFeatureAttachmentMutation,
      }}
    />
  );
}
