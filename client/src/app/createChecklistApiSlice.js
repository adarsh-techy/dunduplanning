import { apiSlice } from './apiSlice';

// Injects the standard set of CRUD + attachment endpoints shared by every
// checklist-style module (Planning, Marketing, Features, Delivery), so each
// module doesn't need to hand-write the same six endpoints.
export function createChecklistApiSlice({ basePath, tagType, prefix }) {
  return apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      [`get${prefix}Items`]: builder.query({
        query: () => basePath,
        transformResponse: (res) => res.items,
        providesTags: [tagType],
      }),
      [`create${prefix}Item`]: builder.mutation({
        query: (body) => ({ url: basePath, method: 'POST', body }),
        invalidatesTags: [tagType, 'Dashboard'],
      }),
      [`update${prefix}Item`]: builder.mutation({
        query: ({ id, ...body }) => ({ url: `${basePath}/${id}`, method: 'PATCH', body }),
        invalidatesTags: [tagType, 'Dashboard'],
      }),
      [`delete${prefix}Item`]: builder.mutation({
        query: (id) => ({ url: `${basePath}/${id}`, method: 'DELETE' }),
        invalidatesTags: [tagType, 'Dashboard'],
      }),
      [`upload${prefix}Attachment`]: builder.mutation({
        query: ({ id, formData }) => ({
          url: `${basePath}/${id}/attachments`,
          method: 'POST',
          body: formData,
        }),
        invalidatesTags: [tagType],
      }),
      [`delete${prefix}Attachment`]: builder.mutation({
        query: ({ id, attachmentId }) => ({
          url: `${basePath}/${id}/attachments/${attachmentId}`,
          method: 'DELETE',
        }),
        invalidatesTags: [tagType],
      }),
    }),
  });
}
