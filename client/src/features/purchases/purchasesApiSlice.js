import { apiSlice } from '../../app/apiSlice';

export const purchasesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query({
      query: () => '/purchases',
      transformResponse: (res) => res.purchases,
      providesTags: ['Purchase'],
    }),
    createPurchase: builder.mutation({
      query: (body) => ({ url: '/purchases', method: 'POST', body }),
      invalidatesTags: ['Purchase', 'Dashboard'],
    }),
    updatePurchase: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/purchases/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Purchase', 'Dashboard'],
    }),
    deletePurchase: builder.mutation({
      query: (id) => ({ url: `/purchases/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Purchase', 'Dashboard'],
    }),
    uploadPurchaseAttachment: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/purchases/${id}/attachments`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Purchase'],
    }),
    deletePurchaseAttachment: builder.mutation({
      query: ({ id, attachmentId }) => ({
        url: `/purchases/${id}/attachments/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Purchase'],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useUploadPurchaseAttachmentMutation,
  useDeletePurchaseAttachmentMutation,
} = purchasesApiSlice;
