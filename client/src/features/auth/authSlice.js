import { createSlice } from '@reduxjs/toolkit';

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
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthInitialized = (state) => state.auth.initialized;
export const selectIsSuperAdmin = (state) => state.auth.user?.role === 'superadmin';
export const selectHasPermission = (moduleName) => (state) =>
  state.auth.user?.role === 'superadmin' || Boolean(state.auth.user?.permissions?.[moduleName]);
