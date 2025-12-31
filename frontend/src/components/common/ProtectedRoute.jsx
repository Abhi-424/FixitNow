import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

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
    let targetPath = "/dashboard/user";

    if (user?.role === 'admin') targetPath = "/dashboard/admin";
    else if (user?.role === 'provider') targetPath = "/dashboard/provider";
    else if (!user?.role) targetPath = "/login"; // Fallback to login if no role (should be caught by AuthContext check though)

    // Prevent infinite loop: if we are already on the target path, don't redirect
    if (location.pathname === targetPath) {
      // We are on the right dashboard but the route we TRIED to access requires a different role.
      // In this specific case, we shouldn't redirect to self, but maybe just show "Unauthorized" or let it stay?
      // Actually, if we are here, it means the CURRENT route (children) requires a role we don't have.
      // So we MUST redirect away from children. 
      // But if strict redirect target == current location, we are stuck.

      // Example: User is on /dashboard/user (role=user). They try to access /dashboard/admin (role=admin).
      // ProtectedRoute for /dashboard/admin triggers. allowedRoles=[admin]. User has [user].
      // Redirect target => /dashboard/user.
      // Since we are NOT on /dashboard/user (we are effectively mistakenly rendering /dashboard/admin logic?),
      // Wait, Route path matches URL. 
      // If URL is /dashboard/admin, then location.pathname IS /dashboard/admin. 
      // Redirect target is /dashboard/user. They are different. Safe to redirect.

      // WHEN DOES LOOP HAPPEN?
      // Loop happens if:
      // URL is /dashboard/user. Role is invalid/missing (undefined). 
      // Logic defaults to redirect /dashboard/user.
      // Redirect happens -> Re-render -> Check logic -> Redirect ... LOOP.

      // So check is: if (location.pathname === targetPath) return children (or valid fallback)?
      // If we are on /dashboard/user and we decide we must go to /dashboard/user, we should just Render specific Not Authorized component?
      // No, if we are on /dashboard/user and we ARE a user, we shouldn't be in this 'role mismatch' block.

      // Using "return <Navigate...>" REPLACES the current route.
      return <Navigate to={targetPath} replace />;
    }

    // Fix for loop:
    if (location.pathname === targetPath) {
      // We are already at the destination but maybe for some reason it triggered? 
      // Usually implies 'allowedRoles' config for this route is wrong for this user type.
      // Just return children to avoid flicker if it happens to be valid, or better, 
      // since we know it's a mismatch (allowedRoles check failed), we can't show children.
      // We show a "Unauthorized" message or redir to home.
      return <Navigate to="/" replace />;
    }

    return <Navigate to={targetPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
