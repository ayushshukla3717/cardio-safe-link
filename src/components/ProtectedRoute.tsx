import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyToken } from '@/store/slices/authSlice';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(verifyToken());
    }
  }, [dispatch, token, user]);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}