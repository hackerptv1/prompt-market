import React from 'react';
import { Calendar, Clock, Video, User, ExternalLink, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ExpandableSection } from '../shared/ExpandableSection';
import { useConsultationBookings } from '../../hooks/useConsultationBookings';
import { useAuth } from '../../contexts/AuthContext';

interface ConsultationBookingCardProps {
  booking: any;
}

function ConsultationBookingCard({ booking }: ConsultationBookingCardProps) {
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

  const getSellerInfo = () => {
    // Use the seller information from the booking data
    if (booking.seller) {
      return {
        name: booking.seller.display_name || booking.seller.full_name || 'Unknown Seller',
        email: booking.seller.email || 'No email',
        profile_picture_url: booking.seller.profile_picture_url
      };
    }
    
    // Fallback if seller info is not available
    return {
      name: 'Unknown Seller',
      email: 'No email',
      profile_picture_url: undefined
    };
  };

  const sellerInfo = getSellerInfo();

  return (
    <div className={`border rounded-lg p-4 ${isUpcoming() ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {sellerInfo.profile_picture_url ? (
              <img 
                src={sellerInfo.profile_picture_url} 
                alt={sellerInfo.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{sellerInfo.name}</h3>
            <p className="text-sm text-gray-600">{sellerInfo.email}</p>
          </div>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(booking.booking_date)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
        </div>
        {booking.notes && (
          <div className="text-sm text-gray-600">
            <strong>Notes:</strong> {booking.notes}
          </div>
        )}
      </div>

      {booking.meeting_link && ['confirmed', 'pending'].includes(booking.status) && (
        <div className="mb-3">
          <a
            href={booking.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Video className="w-4 h-4 mr-2" />
            Join Meeting
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Amount: ${booking.payment_amount}</span>
        <span>Payment: {booking.payment_status}</span>
      </div>
    </div>
  );
}

export function ConsultationsSection() {
  const { user } = useAuth();
  const { 
    bookings, 
    isLoading, 
    error, 
    getUpcomingBookings, 
    getPastBookings 
  } = useConsultationBookings({
    includeSellerInfo: true // Fetch seller info for buyers
  });

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">My Consultations</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">My Consultations</h2>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load consultations</p>
        </div>
      </div>
    );
  }

  const allBookings = [...upcomingBookings, ...pastBookings];

  if (allBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">My Consultations</h2>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations yet</h3>
          <p className="text-gray-600 mb-4">Book your first consultation with a seller to get started.</p>
          <a
            href="/browse"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Sellers
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">My Consultations</h2>
      
      {upcomingBookings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Upcoming ({upcomingBookings.length})</h3>
      <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <ConsultationBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Past ({pastBookings.length})</h3>
        <ExpandableSection 
            initialItems={3} 
            items={pastBookings.map((booking) => (
              <ConsultationBookingCard key={booking.id} booking={booking} />
            ))}
          gridCols="grid-cols-1"
          gap="gap-4"
        />
      </div>
      )}
    </div>
  );
}