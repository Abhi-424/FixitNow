import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for role mismatch if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their appropriate dashboard or home
    if (user?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (user?.role === 'provider') return <Navigate to="/dashboard/provider" replace />;
    return <Navigate to="/dashboard/user" replace />;
  }

  return children;
};

export default ProtectedRoute;
