import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CategoryProvider } from './context/CategoryContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages — Public
import Home from './pages/Home';
import Explore from './pages/Explore';
import CategoryDetail from './pages/CategoryDetail';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import About from './pages/About';
import ComboOffers from './pages/deals/ComboOffers';
import ComboDetail from './pages/deals/ComboDetail';
import FlashSale from './pages/deals/FlashSale';
import FAQs from './pages/FAQs';
import Help from './pages/Help';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Terms from './pages/legal/Terms';
import ShippingPolicy from './pages/legal/ShippingPolicy';
import RefundPolicy from './pages/legal/RefundPolicy';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// User (protected)
import Profile from './pages/profile/Profile';
import Orders from './pages/profile/Orders';
import OrderDetail from './pages/profile/OrderDetail';
import Addresses from './pages/profile/Addresses';
import Settings from './pages/profile/Settings';
import Notifications from './pages/profile/Notifications';

// Cart & Checkout (protected)
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';

// Admin
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';
import AdminCategories from './admin/AdminCategories';
import AdminCombos from './admin/AdminCombos';
import AdminCoupons from './admin/AdminCoupons';
import AdminReviews from './admin/AdminReviews';

import './styles/global.css';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="page-content">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CategoryProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <Routes>
                  {/* Public routes with Navbar + Footer */}
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/explore" element={<Layout><Explore /></Layout>} />
                  <Route path="/category/:id" element={<Layout><CategoryDetail /></Layout>} />
                  <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                  <Route path="/search" element={<Layout><Search /></Layout>} />
                  <Route path="/about" element={<Layout><About /></Layout>} />
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

                  {/* Protected user routes */}
                  <Route path="/cart" element={<Layout><Cart /></Layout>} />
                  <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                  <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
                  <Route path="/profile/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
                  <Route path="/profile/orders/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
                  <Route path="/profile/addresses" element={<ProtectedRoute><Layout><Addresses /></Layout></ProtectedRoute>} />
                  <Route path="/profile/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
                  <Route path="/profile/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />

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
                  </Route>
                </Routes>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </CategoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
