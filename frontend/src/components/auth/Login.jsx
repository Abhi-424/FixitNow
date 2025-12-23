import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login: contextLogin } = useContext(AuthContext);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = await authService.login({ username, email, password });
      
      // Update global auth state
      contextLogin(userData);
      
      // Redirect based on role using the userData returned from service
      const role = userData.role || 'user'; // Default to user if undefined
      const redirectPath = `/dashboard/${role}`;
      
      console.log('Login successful, redirecting to:', redirectPath);
      navigate(redirectPath);
      
    } catch (err) {
      console.error("Login error:", err);
      setServerError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 pt-20">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 transform transition-all hover:shadow-3xl">
        <div className="text-center mb-8">
           <div className="inline-block mb-4">
             <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
             </div>
           </div>
           <h2 className="text-3xl font-bold text-blue-900 mb-2">Welcome Back</h2>
           <p className="text-gray-500">Securely login to your FixitNow account</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{serverError}</span>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin} onKeyPress={handleKeyPress}>
          {/* Username Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Enter your username" 
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} focus:ring-2 outline-none transition`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({...errors, username: ""});
                }}
                disabled={loading}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.username}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} focus:ring-2 outline-none transition`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({...errors, email: ""});
                }}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition">
                  Forgot password?
                </Link>
             </div>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} focus:ring-2 outline-none transition`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({...errors, password: ""});
                  }}
                  disabled={loading}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                   {showPassword ? (
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                     </svg>
                   ) : (
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                   )}
                </button>
             </div>
             {errors.password && (
               <p className="mt-1 text-sm text-red-600 flex items-center">
                 <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
                 {errors.password}
               </p>
             )}
          </div>
          
          {/* Remember Me */}
          <div className="flex items-center">
             <input 
               id="remember-me" 
               type="checkbox" 
               className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded cursor-pointer" 
               checked={rememberMe}
               onChange={(e) => setRememberMe(e.target.checked)}
               disabled={loading}
             />
             <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
               Remember me for 30 days
             </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg shadow-lg transition transform ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'} flex items-center justify-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login to Account
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
           Don't have an account? 
           <Link to="/register" className="ml-1 font-bold text-blue-600 hover:text-blue-800 transition">
              Create Account
           </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            By logging in, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
