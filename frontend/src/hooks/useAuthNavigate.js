import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to handle navigation based on authentication state.
 * 
 * Usage:
 * const authNavigate = useAuthNavigate();
 * 
 * // In functionality:
 * <button onClick={() => authNavigate('/dashboard/user', '/register')}>
 *   Get Started
 * </button>
 */
const useAuthNavigate = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  /**
   * Navigates to target path if authenticated, else redirects to fallback/login
   * @param {string} targetPath - Path to go to if logged in (optional, defaults to role dashboard)
   * @param {string} fallbackPath - Path to go to if NOT logged in (default: '/login')
   */
  const handleAuthNavigation = (targetPath = null, fallbackPath = '/login') => {
    if (isAuthenticated) {
      if (targetPath) {
        navigate(targetPath);
      } else {
        // Default to role-based dashboard if no target specified
        const role = user?.role || 'user';
        navigate(`/dashboard/${role}`);
      }
    } else {
      navigate(fallbackPath);
    }
  };

  return handleAuthNavigation;
};

export default useAuthNavigate;
