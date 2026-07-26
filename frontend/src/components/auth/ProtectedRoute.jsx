import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../../lib/api.js';

export default function ProtectedRoute() {
  return getToken() ? <Outlet /> : <Navigate to="/" replace />;
}
