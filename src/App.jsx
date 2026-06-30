import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CategoryProvider } from './context/CategoryContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages — Public
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Search = lazy(() => import('./pages/Search'));
const About = lazy(() => import('./pages/About'));
const Donate = lazy(() => import('./pages/Donate'));
const Foundation = lazy(() => import('./pages/Foundation'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const ComboOffers = lazy(() => import('./pages/deals/ComboOffers'));
const ComboDetail = lazy(() => import('./pages/deals/ComboDetail'));
const FlashSale = lazy(() => import('./pages/deals/FlashSale'));
const FAQs = lazy(() => import('./pages/FAQs'));
const Help = lazy(() => import('./pages/Help'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const ShippingPolicy = lazy(() => import('./pages/legal/ShippingPolicy'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy'));

// Auth
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const GoogleCallback = lazy(() => import('./pages/auth/GoogleCallback'));


// User (protected)
const Profile = lazy(() => import('./pages/profile/Profile'));
const Orders = lazy(() => import('./pages/profile/Orders'));
const OrderDetail = lazy(() => import('./pages/profile/OrderDetail'));
const Addresses = lazy(() => import('./pages/profile/Addresses'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const Notifications = lazy(() => import('./pages/profile/Notifications'));

// Cart & Checkout (protected)
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

// Admin
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./admin/AdminProducts'));
const AdminOrders = lazy(() => import('./admin/AdminOrders'));
const AdminUsers = lazy(() => import('./admin/AdminUsers'));
const AdminCategories = lazy(() => import('./admin/AdminCategories'));
const AdminCombos = lazy(() => import('./admin/AdminCombos'));
const AdminCoupons = lazy(() => import('./admin/AdminCoupons'));
const AdminReviews = lazy(() => import('./admin/AdminReviews'));
const AdminNewArrivals = lazy(() => import('./admin/AdminNewArrivals'));
const AdminBestSellers = lazy(() => import('./admin/AdminBestSellers'));
const AdminContactSubmissions = lazy(() => import('./admin/AdminContactSubmissions'));
const AdminCareerSubmissions = lazy(() => import('./admin/AdminCareerSubmissions'));
const AdminDonations = lazy(() => import('./admin/AdminDonations'));
const AdminInvoices = lazy(() => import('./admin/AdminInvoices'));
const AdminInvoiceForm = lazy(() => import('./admin/AdminInvoiceForm'));
const AdminInvoicePrint = lazy(() => import('./admin/AdminInvoicePrint'));
const AdminCompanyAddresses = lazy(() => import('./admin/AdminCompanyAddresses'));
const AdminCustomers = lazy(() => import('./admin/AdminCustomers'));
const AdminProductBatches = lazy(() => import('./admin/AdminProductBatches'));

import './styles/global.css';

function Layout({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin()) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  if (isAuthenticated && isAdmin()) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="page-content">{children}</main>
      {location.pathname === '/' && <Footer />}
    </>
  );
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
        <CategoryProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <Suspense fallback={<div className="loading-center"><div className="spinner" /></div>}>
                  <Routes>
                    {/* Public routes with Navbar + Footer */}
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/explore" element={<Layout><Explore /></Layout>} />
                    <Route path="/category/:id" element={<Layout><CategoryDetail /></Layout>} />
                    <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                    <Route path="/search" element={<Layout><Search /></Layout>} />
                    <Route path="/about" element={<Layout><About /></Layout>} />
                    <Route path="/donate" element={<Layout><Donate /></Layout>} />
                    <Route path="/foundation" element={<Foundation />} />
                    <Route path="/careers" element={<Layout><Careers /></Layout>} />
                    <Route path="/contact-us" element={<Layout><Contact /></Layout>} />
                    <Route path="/deals/combo-offers" element={<Layout><ComboOffers /></Layout>} />
                    <Route path="/deals/combo/:id" element={<Layout><ComboDetail /></Layout>} />
                    <Route path="/deals/flash-sale" element={<Layout><FlashSale /></Layout>} />
                    <Route path="/faqs" element={<Layout><FAQs /></Layout>} />
                    <Route path="/help" element={<Layout><Help /></Layout>} />
                    <Route path="/legal/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
                    <Route path="/legal/terms" element={<Layout><Terms /></Layout>} />
                    <Route path="/legal/shipping" element={<Layout><ShippingPolicy /></Layout>} />
                    <Route path="/legal/refund" element={<Layout><RefundPolicy /></Layout>} />

                    {/* Auth routes */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                    <Route path="/auth/google-callback" element={<GoogleCallback />} />

                    {/* Protected user routes */}
                    <Route path="/cart" element={<Layout><Cart /></Layout>} />
                    <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                    <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Layout><Profile tab="dashboard" /></Layout></ProtectedRoute>} />
                    <Route path="/profile/orders" element={<ProtectedRoute><Layout><Profile tab="orders" /></Layout></ProtectedRoute>} />
                    <Route path="/profile/orders/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
                    <Route path="/profile/addresses" element={<ProtectedRoute><Layout><Profile tab="addresses" /></Layout></ProtectedRoute>} />
                    <Route path="/profile/settings" element={<ProtectedRoute><Layout><Profile tab="settings" /></Layout></ProtectedRoute>} />

                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="combos" element={<AdminCombos />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="new-arrivals" element={<AdminNewArrivals />} />
                      <Route path="best-sellers" element={<AdminBestSellers />} />
                      <Route path="contact-submissions" element={<AdminContactSubmissions />} />
                      <Route path="career-submissions" element={<AdminCareerSubmissions />} />
                      <Route path="donations" element={<AdminDonations />} />
                      <Route path="invoices" element={<AdminInvoices />} />
                      <Route path="invoices/new" element={<AdminInvoiceForm />} />
                      <Route path="invoices/:id" element={<AdminInvoicePrint />} />
                      <Route path="invoices/:id/edit" element={<AdminInvoiceForm />} />
                      <Route path="company-addresses" element={<AdminCompanyAddresses />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="products/batches" element={<AdminProductBatches />} />
                    </Route>
                  </Routes>
                </Suspense>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </CategoryProvider>
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
