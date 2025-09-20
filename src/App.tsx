import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { BrowsePrompts } from './pages/BrowsePrompts';
import { PromptDetailsPage } from './pages/PromptDetailsPage';
import { SellerDashboard } from './pages/SellerDashboard';
import { SellerPromptPage } from './pages/SellerPromptPage';
import { SellerProfilePage } from './pages/SellerProfilePage';
import { UserDashboard } from './pages/UserDashboard';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { AuthPage } from './pages/AuthPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { AboutUsPage } from './pages/AboutUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { SellersPage } from './components/admin/sellers/SellersPage';
import { PromptsPage } from './components/admin/prompts/PromptsPage';
import { UsersPage } from './components/admin/users/UsersPage';
import { OrdersPage } from './components/admin/orders/OrdersPage';
import { BookingsPage } from './components/admin/bookings/BookingsPage';
import { ReviewsPage } from './components/admin/reviews/ReviewsPage';
import { PaymentsPage } from './components/admin/payments/PaymentsPage';
import { AnalyticsPage } from './components/admin/analytics/AnalyticsPage';
import { ModerationPage } from './components/admin/moderation/ModerationPage';
import { ReportsPage } from './components/admin/reports/ReportsPage';
import { AdminSettingsPage } from './components/admin/settings/AdminSettingsPage';
import { AIProvidersPage } from './components/admin/platforms/ai-providers/AIProvidersPage';
import { PlatformsPage } from './components/admin/platforms/PlatformsPage';
import { CategoriesPage } from './components/admin/categories/CategoriesPage';
import { MediaPage } from './components/admin/media/MediaPage';
import { PackagesPage } from './components/admin/packages/PackagesPage';
import { AuthProvider } from './contexts/AuthContext';
import { FilterProvider } from './contexts/FilterContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { BookingProvider } from './contexts/BookingContext';
import SuperAdminLogos from './components/admin/logos/PlatformsPage';
import PromptForm from './components/PromptForm';
import GoogleOAuthCallback from './components/auth/GoogleOAuthCallback';
import { 
  BuyerRoute, 
  SellerRoute, 
  AuthenticatedRoute,
  AdminRoute
} from './components/auth/ProtectedRoute';
import { CatchAllRoute } from './components/auth/CatchAllRoute';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <FilterProvider>
          <PaymentProvider>
            <BookingProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
                
                {/* Admin routes - protected */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }>
                  <Route path="ai-logos" element={<SuperAdminLogos />} />
                  <Route path="platforms" element={<PlatformsPage />} />
                  <Route path="sellers" element={<SellersPage />} />
                  <Route path="prompts" element={<PromptsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="moderation" element={<ModerationPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="ai-providers" element={<AIProvidersPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="media" element={<MediaPage />} />
                  <Route path="packages" element={<PackagesPage />} />
                </Route>

                {/* Main layout with public and protected routes */}
                <Route path="/" element={<Layout />}>
                  {/* Public routes */}
                  <Route index element={<HomePage />} />
                  <Route path="browse" element={<BrowsePrompts />} />
                  <Route path="about" element={<AboutUsPage />} />
                  <Route path="privacy" element={<PrivacyPolicyPage />} />
                  <Route path="prompt/:id" element={<PromptDetailsPage />} />
                  
                  {/* Seller routes - protected with seller role */}
                  <Route path="seller" element={
                    <SellerRoute>
                      <SellerDashboard />
                    </SellerRoute>
                  } />
                  <Route path="seller/prompt/:id" element={
                    <SellerRoute>
                      <SellerPromptPage />
                    </SellerRoute>
                  } />
                  <Route path="seller/profile" element={
                    <SellerRoute>
                      <SellerProfilePage />
                    </SellerRoute>
                  } />
                  <Route path="seller/profile/:id" element={<SellerProfilePage />} />
                  
                  {/* Buyer routes - protected with buyer role */}
                  <Route path="dashboard" element={
                    <BuyerRoute>
                      <UserDashboard />
                    </BuyerRoute>
                  } />
                  <Route path="consultations" element={
                    <AuthenticatedRoute>
                      <ConsultationsPage />
                    </AuthenticatedRoute>
                  } />
                  
                  {/* Settings - accessible to all authenticated users */}
                  <Route path="settings" element={
                    <AuthenticatedRoute>
                      <SettingsPage />
                    </AuthenticatedRoute>
                  } />
                </Route>

                {/* Prompt form routes - protected based on role */}
                <Route path="/prompts/new" element={
                  <SellerRoute>
                    <PromptForm />
                  </SellerRoute>
                } />
                <Route path="/prompts/:id" element={
                  <SellerRoute>
                    <PromptForm />
                  </SellerRoute>
                } />

                {/* Catch-all route for any random paths */}
                <Route path="*" element={<CatchAllRoute />} />
              </Routes>
            </BookingProvider>
          </PaymentProvider>
        </FilterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}