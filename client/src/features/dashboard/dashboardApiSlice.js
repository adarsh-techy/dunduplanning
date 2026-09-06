import { apiSlice } from '../../app/apiSlice';

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query({
      query: () => '/dashboard/summary',
      transformResponse: (res) => res.summary,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetSummaryQuery } = dashboardApiSlice;
