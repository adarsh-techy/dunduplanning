import { useGetMeQuery } from './features/auth/authApiSlice';
import AppRoutes from './routes/AppRoutes';
import Spinner from './components/Spinner';

// Auth state (features/auth/authSlice.js) is kept in sync with this query
// via extraReducers, not a useEffect here -- see that file for why: an
// effect-based sync left a one-render gap where a fresh page load had
// already succeeded but `user` hadn't updated yet, letting ProtectedRoute
// bounce to /login on a perfectly valid session (the "logged out on hard
// refresh" bug). By the time this component re-renders after the query
// settles, `state.auth.user` is already correct -- no gap to hit.
export default function App() {
  const { isLoading } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <AppRoutes />;
}
