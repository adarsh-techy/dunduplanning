import ChecklistDetailPage from '../../components/ChecklistDetailPage';
import {
  useGetMarketingItemsQuery,
  useUpdateMarketingItemMutation,
  useDeleteMarketingItemMutation,
  useUploadMarketingAttachmentMutation,
  useDeleteMarketingAttachmentMutation,
} from './marketingApiSlice';

export default function MarketingDetailPage() {
  return (
    <ChecklistDetailPage
      backTo="/marketing"
      backLabel="Marketing"
      itemLabel="Campaign"
      titleLabel="Campaign"
      hooks={{
        useGetItemsQuery: useGetMarketingItemsQuery,
        useUpdateItemMutation: useUpdateMarketingItemMutation,
        useDeleteItemMutation: useDeleteMarketingItemMutation,
        useUploadAttachmentMutation: useUploadMarketingAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteMarketingAttachmentMutation,
      }}
    />
  );
}
