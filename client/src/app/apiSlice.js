import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: ['User', 'Step', 'Purchase', 'Marketing', 'Feature', 'Delivery', 'AppFeature', 'Packing', 'Dashboard'],
  endpoints: () => ({}),
});
