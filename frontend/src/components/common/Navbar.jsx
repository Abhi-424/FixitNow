import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = user?.username || user?.name || 'User';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user?.role) return '/dashboard/user';
    return `/dashboard/${user.role}`;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Common link classes
  const linkClasses = ({ isActive }) =>
    `font-medium transition-colors duration-300 ${isActive
      ? "text-blue-700 border-b-2 border-orange-500"
      : "text-gray-600 hover:text-orange-500"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-3" : "bg-white/95 py-4"
        }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-700 tracking-wide flex items-center gap-2">
          <span>FixitNow</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={linkClasses}>
            Home
          </NavLink>
          <NavLink to="/services" className={linkClasses}>
            Services
          </NavLink>
          <NavLink to="/contact" className={linkClasses}>
            Contact
          </NavLink>
        </div>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Profile menu"
                >
                  {/* Avatar with initials */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-md">
                    {getUserInitials()}
                  </div>
                  {/* Dropdown arrow */}
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fadeIn">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.username || user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.email || ''}
                      </p>
                      {user?.role && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Dropdown items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate(getDashboardRoute());
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition duration-200 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition duration-200 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>

                      <hr className="my-1 border-gray-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login">
                <button className="px-5 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition duration-300">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-blue-900 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="flex flex-col p-6 space-y-4">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `text-lg font-medium ${isActive ? "text-blue-700" : "text-gray-600"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/services"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `text-lg font-medium ${isActive ? "text-blue-700" : "text-gray-600"}`
            }
          >
            Services
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `text-lg font-medium ${isActive ? "text-blue-700" : "text-gray-600"}`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `text-lg font-medium ${isActive ? "text-blue-700" : "text-gray-600"}`
            }
          >
            Contact
          </NavLink>

          {/* Mobile Auth Section */}
          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
            {isAuthenticated ? (
              <>
                {/* User Profile Card */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center font-semibold">
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.username || user?.name || 'User'}
                    </p>
                    {user?.role && (
                      <span className="text-xs text-gray-500">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile menu items */}
                <button
                  onClick={() => {
                    navigate(getDashboardRoute());
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-2 border border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full px-5 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
                    Login
                  </button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition">
                    Register
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
