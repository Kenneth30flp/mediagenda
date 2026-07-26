import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../../lib/api.js';

export default function RoleRoute({ allowedRoles }) {
  const user = getUser();

  return allowedRoles.includes(user?.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
