import ChecklistPage from '../../components/ChecklistPage';
import {
  useGetStepItemsQuery,
  useCreateStepItemMutation,
  useUpdateStepItemMutation,
  useDeleteStepItemMutation,
  useUploadStepAttachmentMutation,
  useDeleteStepAttachmentMutation,
} from './stepsApiSlice';

export default function PlanningPage() {
  return (
    <ChecklistPage
      title="Business Setup Planning"
      subtitle="Track every registration step to completion."
      itemLabel="Step"
      titleLabel="Step"
      basePath="/planning"
      dateLabel="Date"
      costLabel="Cost"
      showEstimatedCost={false}
      emptyMessage='No steps yet. Click "Add Step" to start planning.'
      hooks={{
        useGetItemsQuery: useGetStepItemsQuery,
        useCreateItemMutation: useCreateStepItemMutation,
        useUpdateItemMutation: useUpdateStepItemMutation,
        useDeleteItemMutation: useDeleteStepItemMutation,
        useUploadAttachmentMutation: useUploadStepAttachmentMutation,
        useDeleteAttachmentMutation: useDeleteStepAttachmentMutation,
      }}
    />
  );
}
