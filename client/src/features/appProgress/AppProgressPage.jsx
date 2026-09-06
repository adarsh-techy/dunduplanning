import ChecklistPage from '../../components/ChecklistPage';
import {
  useGetAppFeatureItemsQuery,
  useCreateAppFeatureItemMutation,
  useUpdateAppFeatureItemMutation,
  useDeleteAppFeatureItemMutation,
  useUploadAppFeatureAttachmentMutation,
  useDeleteAppFeatureAttachmentMutation,
} from './appProgressApiSlice';

export default function AppProgressPage() {
  return (
    <ChecklistPage
      title="App Progress"
      subtitle="Build & launch tracker for the Dundu-Online app (D:\PROJECTS\Dundu-Online) — check off each part as it's completed."
      itemLabel="Item"
      titleLabel="Feature / Section"
      dateLabel="Target Date"
      costLabel="Cost"
      showEstimatedCost={false}
      showCost={false}
      showCategory
      showDoneBy={false}
      showDate={false}
      showAttachments={false}
      basePath="/app-progress"
      emptyMessage='No items yet. Click "Add Item" to start tracking the app.'
      hooks={{
        useGetItemsQuery: useGetAppFeatureItemsQuery,
        useCreateItemMutation: useCreateAppFeatureItemMutation,
        useUpdateItemMutation: useUpdateAppFeatureItemMutation,
        useDeleteItemMutation: useDeleteAppFeatureItemMutation,
        useUploadAttachmentMutation: useUploadAppFeatureAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteAppFeatureAttachmentMutation,
      }}
    />
  );
}
