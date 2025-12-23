// Application Constants
export const APP_NAME = "FixitNow";
export const APP_VERSION = "1.0.0";

// User Roles
export const USER_ROLE = "user";
export const PROVIDER_ROLE = "provider";
export const ADMIN_ROLE = "admin";

// Service Categories
export const SERVICE_PLUMBING = "Plumbing";
export const SERVICE_ELECTRICAL = "Electrical";
export const SERVICE_REPAIRS = "Repairs";
export const SERVICE_PAINTING = "Painting";
export const SERVICE_CLEANING = "Cleaning";
export const SERVICE_AC_REPAIR = "AC Repair";

// Booking Status
export const STATUS_PENDING = "pending";
export const STATUS_IN_PROGRESS = "in_progress";
export const STATUS_COMPLETED = "completed";
export const STATUS_CANCELLED = "cancelled";

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  SERVICES: "/services",
  BOOK_SERVICE: "/book",
  USER_DASHBOARD: "/dashboard/user",
  PROVIDER_DASHBOARD: "/dashboard/provider",
  ADMIN_DASHBOARD: "/dashboard/admin",
};

// API Configuration
export const API_BASE_URL = "http://localhost:5000/api";
export const AUTH_TOKEN_KEY = "user"; // localStorage key for user data/token
