import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/env';

const rawBaseQuery = fetchBaseQuery({ baseUrl: API_BASE_URL, credentials: 'include' });

// Login sets two cookies -- a short-lived access token and a long-lived
// refresh token (see server/src/utils/generateToken.js) -- so a session
// keeps working long after the access token itself has expired. This
// wrapper is what makes that automatic: whenever any request comes back
// 401, it silently calls POST /auth/refresh to mint a new access token and
// retries the original request once. The user never sees the 401 unless
// the refresh token itself has also expired or been revoked.
//
// `refreshPromise` is shared across calls so that several requests failing
// with 401 around the same time (e.g. a page firing off a handful of
// queries at once) trigger exactly one /auth/refresh call, not one each.
let refreshPromise = null;

const isAuthEndpoint = (url) =>
  ['/auth/login', '/auth/signup', '/auth/refresh'].some((p) => url?.startsWith(p));

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;

  if (result.error?.status === 401 && !isAuthEndpoint(url)) {
    if (!refreshPromise) {
      // Deliberately NOT passing `api` (and its AbortSignal) through here.
      // `api.signal` is tied to the ORIGINAL query's lifecycle -- if that
      // query gets cancelled/superseded, sharing its signal would abort
      // this refresh call too, and a session-wide token refresh must not
      // depend on one particular component staying mounted.
      refreshPromise = rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, { ...api, signal: undefined }, {}).finally(
        () => {
          refreshPromise = null;
        }
      );
    }
    const refreshResult = await refreshPromise;

    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else if (refreshResult.error?.status === 401) {
      // The refresh token itself is gone or expired -- this is a real
      // logout. Anything else (a network error, the dev server restarting,
      // a 5xx) is left alone: better to leave the user's session as-is and
      // let the next request try again than to log them out over a blip.
      //
      // Dispatched as a plain action (matching authSlice's `clearCredentials`
      // type string) rather than importing the action creator, so this file
      // doesn't import from authSlice.js -- which itself imports authApiSlice
      // (built on this apiSlice) to sync state via extraReducers. Importing
      // the creator here would create an import cycle between the two.
      api.dispatch({ type: 'auth/clearCredentials' });
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  tagTypes: ['User', 'Step', 'Purchase', 'Marketing', 'Feature', 'Delivery', 'AppFeature', 'Packing', 'Dashboard'],
  endpoints: () => ({}),
});
