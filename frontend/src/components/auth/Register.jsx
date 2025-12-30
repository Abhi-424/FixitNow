import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import api from "../../services/api";
import LocationPicker from '../LocationPicker';

const Register = () => {
  // ... (showPassword state - implied by context if not shown, but we are inserting AFTER formData)
  // Actually, wait, showPassword definition is not visible in the view_file above! 
  // Ah, the view_file shows line 8 as `// ... (showPassword state)`. 
  // This means I previously replaced it with a comment? 
  // Let me look at Step 126 replacement content. 
  // Yes, I replaced the top part of the function with `// ... (showPassword state)`.
  // This is bad. I need to restore the FULL content of the function components that I commented out.

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: null, // Changed from string to object/null
    role: "user",
    agreeToTerms: false,
    // Provider specific fields
    experience: 0,
    bio: "",
    servicesOffered: [] // Array of IDs
  });

  const [services, setServices] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch Services on load
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        // Assuming res.data is array of services
        setServices(res.data);
      } catch (error) {
        console.error("Failed to fetch services", error);
      }
    };
    fetchServices();
  }, []);

  // Password strength checker (Keep existing)
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    if (strength <= 2) return { strength, text: "Weak", color: "bg-red-500", percent: "25%" };
    if (strength <= 3) return { strength, text: "Fair", color: "bg-yellow-500", percent: "50%" };
    if (strength <= 4) return { strength, text: "Good", color: "bg-blue-500", percent: "75%" };
    return { strength, text: "Strong", color: "bg-green-500", percent: "100%" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Handle input changes
  const handleChange = (e) => {
    // ... (same as before)
    const { name, value, type, checked } = e.target;
    if (name === 'servicesOffered') return;

    setFormData({
      ...formData,
      [name]: type === "checkbox" && name !== 'agreeToTerms' ? checked : (type === "checkbox" ? checked : value)
    });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleLocationSelect = (locationResult) => {
    // locationResult is { type: 'Point', coordinates: [lng, lat], address: "..." }
    setFormData({ ...formData, location: locationResult });
    if (errors.location) setErrors({ ...errors, location: "" });
  };

  // Handle Service Toggle
  const toggleService = (serviceId) => {
    let updatedServices = [...formData.servicesOffered];
    if (updatedServices.includes(serviceId)) {
      updatedServices = updatedServices.filter(id => id !== serviceId);
    } else {
      updatedServices.push(serviceId);
    }
    setFormData({ ...formData, servicesOffered: updatedServices });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Standard validations
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.trim().length < 3) newErrors.username = "Username must be at least 3 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    // Update location validation
    if (!formData.location || !formData.location.address) {
      newErrors.location = "Location is required";
    }

    // Provider Validations
    if (formData.role === 'provider') {
      if (formData.servicesOffered.length === 0) newErrors.servicesOffered = "Please select at least one service offered";
      if (formData.experience < 0) newErrors.experience = "Experience cannot be negative";
    }

    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must accept the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        location: formData.location,
        role: formData.role,
        // Provider fields
        ...(formData.role === 'provider' && {
          servicesOffered: formData.servicesOffered,
          experience: Number(formData.experience),
          bio: formData.bio
        })
      };

      await authService.register(registrationData);
      setSuccessMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => { navigate("/login"); }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      setServerError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-24">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Create Your Account</h2>
          <p className="text-gray-500">Join FixitNow and get started today</p>
        </div>

        {/* ... (error/success messages) */}
        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">{serverError}</div>
        )}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6">{successMessage}</div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          {/* ... (Common Fields) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input type="text" name="username" placeholder="johndoe" className="w-full pl-4 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none" value={formData.username} onChange={handleChange} />
              {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" name="email" placeholder="you@example.com" className="w-full pl-4 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none" value={formData.email} onChange={handleChange} />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none" value={formData.password} onChange={handleChange} />
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Strength</span>
                    <span className={passwordStrength.color.replace('bg-', 'text-')}>{passwordStrength.text}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 transition-all duration-300">
                    <div className={`h-1.5 rounded-full ${passwordStrength.color} transition-all duration-500`} style={{ width: passwordStrength.percent }}></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none" value={formData.confirmPassword} onChange={handleChange} />
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 focus:outline-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
            {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location}</p>}
          </div>

          {/* ... (Role Selection) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Register as:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${formData.role === 'user' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}>
                <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={handleChange} className="mr-3 h-5 w-5 text-orange-500" />
                <div><div className="font-semibold">User</div><div className="text-sm text-gray-600">I need services</div></div>
              </label>
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${formData.role === 'provider' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}>
                <input type="radio" name="role" value="provider" checked={formData.role === 'provider'} onChange={handleChange} className="mr-3 h-5 w-5 text-orange-500" />
                <div><div className="font-semibold">Service Provider</div><div className="text-sm text-gray-600">I offer services</div></div>
              </label>
            </div>
          </div>

          {/* Provider Specific Fields */}
          {formData.role === 'provider' && (
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 space-y-4 animate-fade-in-up">
              <h3 className="font-bold text-orange-800">Provider Details</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Services Offered (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded border border-gray-300">
                  {services.map(service => (
                    <label key={service._id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.servicesOffered.includes(service._id)}
                        onChange={() => toggleService(service._id)}
                        className="text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span>{service.name}</span>
                    </label>
                  ))}
                </div>
                {errors.servicesOffered && <p className="text-red-600 text-xs mt-1">{errors.servicesOffered}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                  <input type="number" name="experience" min="0" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none" value={formData.experience} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Bio / Skills</label>
                <textarea name="bio" rows="3" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Tell us about yourself..." value={formData.bio} onChange={handleChange}></textarea>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div>
            <label className="flex items-start cursor-pointer">
              <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} className="mt-1 h-5 w-5 text-orange-500 border-gray-300 rounded" />
              <span className="ml-2 text-sm text-gray-700">I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link></span>
            </label>
            {errors.agreeToTerms && <p className="text-red-600 text-xs mt-1">{errors.agreeToTerms}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-orange-600 transition disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
