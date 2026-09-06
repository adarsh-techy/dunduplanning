import ChecklistDetailPage from '../../components/ChecklistDetailPage';
import {
  useGetAppFeatureItemsQuery,
  useUpdateAppFeatureItemMutation,
  useDeleteAppFeatureItemMutation,
  useUploadAppFeatureAttachmentMutation,
  useDeleteAppFeatureAttachmentMutation,
} from './appProgressApiSlice';

export default function AppFeatureDetailPage() {
  return (
    <ChecklistDetailPage
      backTo="/app-progress"
      backLabel="App Progress"
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
      hooks={{
        useGetItemsQuery: useGetAppFeatureItemsQuery,
        useUpdateItemMutation: useUpdateAppFeatureItemMutation,
        useDeleteItemMutation: useDeleteAppFeatureItemMutation,
        useUploadAttachmentMutation: useUploadAppFeatureAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteAppFeatureAttachmentMutation,
      }}
    />
  );
}
