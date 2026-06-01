import axios from 'axios';

// Auto-switch: uses VITE_API_URL env var (localhost in dev, Vercel URL in prod)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300x300?text=No+Image';
  if (url.startsWith('http')) return url;
  // Relative path → prepend backend base (strip /api)
  const backendBase = BASE_URL.replace(/\/api$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Don't hard-redirect here; let the protected route handle it
    }
    return Promise.reject(error);
  }
);

export default api;

// ───────────────────────────────────────────────
// API ENDPOINT HELPERS
// ───────────────────────────────────────────────
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_RESET_OTP: '/auth/verify-reset-otp',
  RESET_PASSWORD: '/auth/reset-password',
  REQUEST_SIGNUP_OTP: '/auth/request-signup-otp',
  VERIFY_SIGNUP_OTP: '/auth/verify-signup-otp',

  // User
  USER_PROFILE: '/users/profile',
  USER_DASHBOARD: '/users/dashboard',
  USER_PROFILE_PHOTO: '/users/profile/photo',

  // Products
  PRODUCTS: '/products',
  PRODUCT: (id) => `/products/${id}`,
  PRODUCT_REVIEWS: (id) => `/products/${id}/reviews`,
  BRAND_REVIEWS: '/brand-reviews',

  // Categories
  CATEGORIES: '/categories',
  CATEGORY: (id) => `/categories/${id}`,

  // Cart
  CART: '/cart',
  CART_ITEM: (id) => `/cart/${id}`,

  // Wishlist
  WISHLIST: '/wishlist',
  WISHLIST_ITEM: (id) => `/wishlist/${id}`,

  // Orders
  ORDERS: '/orders',
  ORDER: (id) => `/orders/${id}`,

  // Addresses
  ADDRESSES: '/addresses',
  ADDRESS: (id) => `/addresses/${id}`,
  ADDRESS_DEFAULT: (id) => `/addresses/${id}/default`,

  // Combos
  COMBOS: '/combos',
  COMBO: (id) => `/combos/${id}`,

  // Coupons
  VALIDATE_COUPON: '/coupons/validate',
  APPLY_COUPON: '/coupons/apply',
  COUPONS: '/coupons',

  // Payments / Razorpay
  PAYMENT_METHODS: '/payments/payment-methods',
  RAZORPAY_ORDER: '/razorpay/order',
  RAZORPAY_VERIFY: '/razorpay/verify',

  // GST
  GST: '/gst',

  // Delivery check
  CHECK_DELIVERY: (pincode) => `/check-delivery/${pincode}`,

  // Admin
  ADMIN_STATS: '/admin/stats',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT: (id) => `/admin/products/${id}`,
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER_STATUS: (id) => `/admin/orders/${id}/status`,
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_REVIEW: (id) => `/admin/reviews/${id}`,
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_CATEGORY: (id) => `/admin/categories/${id}`,
  ADMIN_COMBOS: '/admin/combos',
  ADMIN_COMBOS_ALL: '/admin/combos/all',
  ADMIN_COMBO: (id) => `/admin/combos/${id}`,
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_COUPON: (id) => `/admin/coupons/${id}`,

  // Health
  HEALTH: '/health',
};
