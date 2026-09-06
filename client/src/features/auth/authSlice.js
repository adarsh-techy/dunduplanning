import { createSlice } from '@reduxjs/toolkit';
import { authApiSlice } from './authApiSlice';

// Auth state is synced via extraReducers matching the auth API's own
// fulfilled/rejected actions, NOT via a useEffect in a component. That
// distinction matters: a component-level effect runs one render AFTER the
// query settles, so on first load there's a render where the query has
// already succeeded but `user` is still the old (null) value -- long
// enough for ProtectedRoute to see "not logged in" and redirect to
// /login, which (having no reason to think it's wrong) just stays there.
// Matching the action here instead updates `user` in the SAME dispatch
// that resolves the query, so no render ever sees that stale gap.
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // { id, name, email, role, permissions, isActive }
    initialized: false, // becomes true once we've checked /auth/me at least once
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.initialized = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApiSlice.endpoints.getMe.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addMatcher(authApiSlice.endpoints.getMe.matchRejected, (state, action) => {
        // Only a confirmed "you're not authenticated" (401/403) clears the
        // session. A network error, the dev server restarting, or a 5xx
        // leaves any already-known user alone rather than bouncing them to
        // login over what might just be a blip.
        const status = action.payload?.status;
        if (status === 401 || status === 403) {
          state.user = null;
        }
        state.initialized = true;
      })
      .addMatcher(authApiSlice.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addMatcher(authApiSlice.endpoints.signup.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addMatcher(authApiSlice.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthInitialized = (state) => state.auth.initialized;
export const selectIsSuperAdmin = (state) => state.auth.user?.role === 'superadmin';
export const selectHasPermission = (moduleName) => (state) =>
  state.auth.user?.role === 'superadmin' || Boolean(state.auth.user?.permissions?.[moduleName]);
