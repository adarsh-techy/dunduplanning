import ChecklistPage from '../../components/ChecklistPage';
import {
  useGetMarketingItemsQuery,
  useCreateMarketingItemMutation,
  useUpdateMarketingItemMutation,
  useDeleteMarketingItemMutation,
  useUploadMarketingAttachmentMutation,
  useDeleteMarketingAttachmentMutation,
} from './marketingApiSlice';

export default function MarketingPage() {
  return (
    <ChecklistPage
      title="Marketing"
      subtitle="Campaigns, launches and marketing spend."
      itemLabel="Campaign"
      titleLabel="Campaign"
      basePath="/marketing"
      emptyMessage='No marketing items yet. Click "Add Campaign" to start planning.'
      hooks={{
        useGetItemsQuery: useGetMarketingItemsQuery,
        useCreateItemMutation: useCreateMarketingItemMutation,
        useUpdateItemMutation: useUpdateMarketingItemMutation,
        useDeleteItemMutation: useDeleteMarketingItemMutation,
        useUploadAttachmentMutation: useUploadMarketingAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteMarketingAttachmentMutation,
      }}
    />
  );
}
