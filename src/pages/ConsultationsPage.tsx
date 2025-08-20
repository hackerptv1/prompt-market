import React from 'react';
import { Calendar, Clock, Video, User, ExternalLink, AlertCircle, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConsultationBookings } from '../hooks/useConsultationBookings';
import { useAuth } from '../contexts/AuthContext';
import { BackButton } from '../components/shared/BackButton';

interface ConsultationBookingCardProps {
  booking: any;
  userRole: 'buyer' | 'seller';
}

function ConsultationBookingCard({ booking, userRole }: ConsultationBookingCardProps) {
  const formatDate = (dateString: string) => {
    // Fix timezone issue: treat the date as local time, not UTC
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    
    return localDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const isUpcoming = () => {
    const today = new Date().toISOString().split('T')[0];
    return booking.booking_date >= today && ['pending', 'confirmed'].includes(booking.status);
  };

  // Get the other party's information (buyer info for sellers, seller info for buyers)
  const getOtherPartyInfo = () => {
    if (userRole === 'seller') {
      // Seller viewing buyer information
      if (booking.buyer) {
        return {
          name: booking.buyer.full_name || 'Unknown Buyer',
          email: booking.buyer.email || 'No email',
          profile_picture_url: booking.buyer.profile_picture_url,
          type: 'buyer'
        };
      }
      return {
        name: `Buyer (${booking.buyer_id.slice(0, 8)}...)`,
        email: 'Email not available',
        profile_picture_url: undefined,
        type: 'buyer'
      };
    } else {
      // Buyer viewing seller information
      if (booking.seller) {
        return {
          name: booking.seller.display_name || booking.seller.full_name || 'Unknown Seller',
          email: booking.seller.email || 'No email',
          profile_picture_url: booking.seller.profile_picture_url,
          type: 'seller'
        };
      }
      return {
        name: `Seller (${booking.seller_id.slice(0, 8)}...)`,
        email: 'Email not available',
        profile_picture_url: undefined,
        type: 'seller'
      };
    }
  };

  const otherPartyInfo = getOtherPartyInfo();

  return (
    <div className={`border rounded-lg p-6 ${isUpcoming() ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {otherPartyInfo.profile_picture_url ? (
              <img 
                src={otherPartyInfo.profile_picture_url} 
                alt={otherPartyInfo.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Consultation with {otherPartyInfo.name}
            </h3>
            <p className="text-sm text-gray-600">{otherPartyInfo.email}</p>
            <p className="text-xs text-gray-500 capitalize">
              {userRole === 'seller' ? 'Buyer' : 'Seller'}
            </p>
          </div>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-3" />
          {formatDate(booking.booking_date)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-3" />
          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
        </div>
        {booking.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>{userRole === 'seller' ? 'Buyer' : 'Your'} Notes:</strong> {booking.notes}
          </div>
        )}
      </div>

      {booking.meeting_link && ['confirmed', 'pending'].includes(booking.status) && (
        <div className="mb-4">
          <a
            href={booking.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Video className="w-4 h-4 mr-2" />
            Join Meeting
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
        <span className="font-medium">Amount: ${booking.payment_amount}</span>
        <span className="capitalize">Payment: {booking.payment_status}</span>
      </div>
    </div>
  );
}

export function ConsultationsPage() {
  const { user, loading: authLoading } = useAuth();
  
  // Determine what information to fetch based on user role
  const isSeller = user?.role === 'seller';
  
  const { 
    bookings, 
    isLoading, 
    error, 
    getUpcomingBookings, 
    getPastBookings 
  } = useConsultationBookings({
    includeSellerInfo: !isSeller, // Include seller info for buyers
    includeBuyerInfo: isSeller     // Include buyer info for sellers
  });

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  // Show loading while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Loading...</h1>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while consultations are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isSeller ? 'My Consultation Bookings' : 'My Consultations'}
            </h1>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isSeller ? 'My Consultation Bookings' : 'My Consultations'}
            </h1>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load consultations</h3>
            <p className="text-gray-600">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  const allBookings = [...upcomingBookings, ...pastBookings];

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isSeller ? 'My Consultation Bookings' : 'My Consultations'}
          </h1>
        </div>

        {allBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isSeller ? 'No consultation bookings yet' : 'No consultations yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isSeller 
                ? 'When buyers book consultations with you, they\'ll appear here.'
                : 'Book your first consultation with a seller to get started.'
              }
            </p>
            {!isSeller && (
              <Link
                to="/browse"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Sellers
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upcoming {isSeller ? 'Bookings' : 'Consultations'} ({upcomingBookings.length})
                </h2>
                <div className="grid gap-6">
                  {upcomingBookings.map((booking) => (
                    <ConsultationBookingCard 
                      key={booking.id} 
                      booking={booking} 
                      userRole={isSeller ? 'seller' : 'buyer'}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Past {isSeller ? 'Bookings' : 'Consultations'} ({pastBookings.length})
                </h2>
                <div className="grid gap-6">
                  {pastBookings.map((booking) => (
                    <ConsultationBookingCard 
                      key={booking.id} 
                      booking={booking} 
                      userRole={isSeller ? 'seller' : 'buyer'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 