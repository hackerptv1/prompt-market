import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Calendar, Search } from 'lucide-react';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { NotificationDropdown } from './shared/NotificationDropdown';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useConsultationBookings } from '../hooks/useConsultationBookings';

export function Layout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useAuth();
  const { isAuthenticated, isSeller, isAdmin, canAccessSellerFeatures } = usePermissions();
  const { getUpcomingBookings } = useConsultationBookings({
    includeSellerInfo: false
  });

  const upcomingBookings = getUpcomingBookings();
  const hasUpcomingConsultations = upcomingBookings.length > 0;
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo />

            {/* Mobile navigation */}
            <div className="lg:hidden flex items-center gap-2">
              {isAuthenticated && (
                <Link 
                  to="/browse" 
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Search className="h-6 w-6" />
                </Link>
              )}
              {!isAuthenticated && (
                <Link 
                  to="/auth" 
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Sign In
                </Link>
              )}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/browse" className={`${isActive('/browse')} transition-colors`}>
                Browse
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className={`${isActive('/dashboard')} transition-colors`}>
                    Dashboard
                  </Link>
                  <Link 
                    to="/consultations" 
                    className={`${isActive('/consultations')} transition-colors relative`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {isSeller ? 'My Bookings' : 'My Consultations'}
                      {hasUpcomingConsultations && (
                        <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {upcomingBookings.length > 9 ? '9+' : upcomingBookings.length}
                        </span>
                      )}
                    </div>
                  </Link>
                  {canAccessSellerFeatures && (
                    <div className="relative group">
                      <Link to="/seller" className={`${isActive('/seller')} transition-colors`}>
                        Seller Dashboard
                      </Link>
                      <div className="absolute left-0 w-48 py-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <Link 
                          to="/seller" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/seller/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Public Profile
                        </Link>
                      </div>
                    </div>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className={`${isActive('/admin')} transition-colors`}>
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
              <div className="flex items-center gap-2">
                {isAuthenticated && <NotificationDropdown />}
                <UserMenu />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isActive={isActive}
      />

      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 mb-4 md:mb-0">
              <p>© 2024 PromptMarket. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/about" 
                className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                About Us
              </Link>
              <Link 
                to="/privacy" 
                className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                Privacy Policy
              </Link>
              <a 
                href="#" 
                className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}