import ChecklistPage from '../../components/ChecklistPage';
import {
  useGetFeatureItemsQuery,
  useCreateFeatureItemMutation,
  useUpdateFeatureItemMutation,
  useDeleteFeatureItemMutation,
  useUploadFeatureAttachmentMutation,
  useDeleteFeatureAttachmentMutation,
} from './featuresApiSlice';

export default function FeaturesPage() {
  return (
    <ChecklistPage
      title="Features"
      subtitle="Feature catalog for the Dundu-Online app (D:\PROJECTS\Dundu-Online) — open a feature to read exactly what it does."
      itemLabel="Feature"
      titleLabel="Feature"
      basePath="/features"
      showEstimatedCost={false}
      showCost={false}
      showCategory
      showDoneBy={false}
      showDate={false}
      showAttachments={false}
      emptyMessage='No features yet. Click "Add Feature" to start tracking.'
      hooks={{
        useGetItemsQuery: useGetFeatureItemsQuery,
        useCreateItemMutation: useCreateFeatureItemMutation,
        useUpdateItemMutation: useUpdateFeatureItemMutation,
        useDeleteItemMutation: useDeleteFeatureItemMutation,
        useUploadAttachmentMutation: useUploadFeatureAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteFeatureAttachmentMutation,
      }}
    />
  );
}
