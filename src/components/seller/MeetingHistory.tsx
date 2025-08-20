import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useConsultationBookings } from '../../hooks/useConsultationBookings';
import { getMeetingStatusDisplay, getMeetingTimeInfo } from '../../utils/meetingStatusUtils';

export function MeetingHistory() {
  const { 
    bookings, 
    isLoading, 
    error, 
    fetchBookings 
  } = useConsultationBookings({
    status: ['completed', 'missed', 'cancelled'],
    includeBuyerInfo: true
  });

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'missed' | 'cancelled'>('all');

  // Auto-refresh meetings every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [fetchBookings]);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filter meetings based on selected filter
  const filteredMeetings = bookings.filter(meeting => {
    if (selectedFilter === 'all') return true;
    return meeting.status === selectedFilter;
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    missed: bookings.filter(b => b.status === 'missed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completionRate: bookings.length > 0 ? 
      Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) : 0
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Meeting History</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Meeting History</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <p>{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Meeting History</h2>
        <p className="text-sm text-gray-600 mt-1">
          Track your consultation performance and completion rates
        </p>
      </div>

      {/* Statistics */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Meetings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
            <div className="text-sm text-gray-600">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'missed', label: 'Missed', count: stats.missed },
            { key: 'cancelled', label: 'Cancelled', count: stats.cancelled }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Meeting List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="divide-y divide-gray-200">
        {filteredMeetings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p>No {selectedFilter === 'all' ? '' : selectedFilter} meetings found</p>
            <p className="text-sm">Your meeting history will appear here</p>
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const statusDisplay = getMeetingStatusDisplay(meeting);
            const timeInfo = getMeetingTimeInfo(meeting);
            
            return (
              <div key={meeting.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Buyer Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={meeting.buyer?.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                        alt={meeting.buyer?.full_name || 'Unknown Buyer'}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </div>

                    {/* Meeting Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Consultation with {meeting.buyer?.full_name || 'Unknown Buyer'}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                          <span className="mr-1">{statusDisplay.icon}</span>
                          <span>{statusDisplay.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(meeting.booking_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">${meeting.payment_amount}</span>
                        </div>
                      </div>

                      {meeting.notes && (
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Buyer Notes:</span> {meeting.notes}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        {statusDisplay.description}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Contact Info */}
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-end space-x-1 mb-1">
                      <User className="h-4 w-4" />
                      <span>{meeting.buyer?.email || 'Unknown Email'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {meeting.status === 'completed' ? 'Completed' : 'Booked'} {formatDate(meeting.booking_date)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 