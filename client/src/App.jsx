import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from './features/auth/authApiSlice';
import { setCredentials, clearCredentials } from './features/auth/authSlice';
import AppRoutes from './routes/AppRoutes';
import Spinner from './components/Spinner';

export default function App() {
  const dispatch = useDispatch();
  const { data, isSuccess, isError, isFetching } = useGetMeQuery();

  useEffect(() => {
    if (isSuccess && data?.user) {
      dispatch(setCredentials(data.user));
    } else if (isError) {
      dispatch(clearCredentials());
    }
  }, [isSuccess, isError, data, dispatch]);

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <AppRoutes />;
}
