import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import Services from "../pages/Services";
import UserDashboard from "../components/dashboard/UserDashboard";
import ProviderDashboard from "../components/dashboard/ProviderDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/common/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/dashboard/user" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
