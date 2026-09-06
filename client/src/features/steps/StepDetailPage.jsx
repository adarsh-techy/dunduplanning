import ChecklistDetailPage from '../../components/ChecklistDetailPage';
import {
  useGetStepItemsQuery,
  useUpdateStepItemMutation,
  useDeleteStepItemMutation,
  useUploadStepAttachmentMutation,
  useDeleteStepAttachmentMutation,
} from './stepsApiSlice';

export default function StepDetailPage() {
  return (
    <ChecklistDetailPage
      backTo="/planning"
      backLabel="Planning"
      itemLabel="Step"
      titleLabel="Step"
      dateLabel="Date"
      costLabel="Cost"
      showEstimatedCost={false}
      hooks={{
        useGetItemsQuery: useGetStepItemsQuery,
        useUpdateItemMutation: useUpdateStepItemMutation,
        useDeleteItemMutation: useDeleteStepItemMutation,
        useUploadAttachmentMutation: useUploadStepAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteStepAttachmentMutation,
      }}
    />
  );
}
