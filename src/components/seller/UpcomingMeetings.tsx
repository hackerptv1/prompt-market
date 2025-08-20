import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, MessageSquare, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';
import { useConsultationBookings } from '../../hooks/useConsultationBookings';
import { AddMeetingLinkModal } from './AddMeetingLinkModal';
import { getMeetingStatusDisplay, getMeetingTimeInfo, formatTimeUntilMeeting, markMeetingCompleted } from '../../utils/meetingStatusUtils';
import { supabase } from '../../utils/supabase';

export function UpcomingMeetings() {
  const { 
    bookings, 
    isLoading, 
    error, 
    fetchBookings, 
    updateBookingStatus,
    addMeetingLink
  } = useConsultationBookings({
    status: ['confirmed', 'pending', 'in_progress'], // Only fetch relevant statuses
    includeBuyerInfo: true
  });

  const [showMeetingLinkModal, setShowMeetingLinkModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Auto-refresh meetings every minute to update statuses
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [fetchBookings]);

  // Filter for upcoming meetings using time-based logic
  const upcomingMeetings = bookings.filter(booking => {
    const now = new Date();
    const startTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const endTime = new Date(`${booking.booking_date}T${booking.end_time}`);
    
    // Show meetings that haven't ended yet (including in-progress)
    return now < endTime;
  });

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

  const handleJoinMeeting = (meeting: any) => {
    if (meeting.meeting_link) {
      window.open(meeting.meeting_link, '_blank');
    } else {
      alert('Meeting link not available yet. Please add a meeting link first.');
    }
  };

  const handleUpdateStatus = async (meetingId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    const success = await updateBookingStatus(meetingId, newStatus);
    if (!success) {
      alert('Failed to update meeting status');
    }
  };

  const handleMarkCompleted = async (meetingId: string) => {
    const result = await markMeetingCompleted(meetingId);
    
    if (result.success) {
      fetchBookings(); // Refresh the list
    } else {
      alert(result.error || 'Failed to mark meeting as completed');
    }
  };

  const handleAddMeetingLink = (meeting: any) => {
    setSelectedBooking(meeting);
    setShowMeetingLinkModal(true);
  };

  const handleSaveMeetingLink = async (meetingLink: string) => {
    if (!selectedBooking) return false;
    return await addMeetingLink(selectedBooking.id, meetingLink);
  };

  const handleCloseMeetingLinkModal = () => {
    setShowMeetingLinkModal(false);
    setSelectedBooking(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
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
          <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
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
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Upcoming Consultations</h2>
          <p className="text-sm text-gray-600 mt-1">
            {upcomingMeetings.length === 0 
              ? 'No upcoming consultations' 
              : `${upcomingMeetings.length} consultation${upcomingMeetings.length === 1 ? '' : 's'} with buyer${upcomingMeetings.length === 1 ? '' : 's'}`
            }
          </p>
        </div>
        
        {upcomingMeetings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p>No upcoming consultations scheduled</p>
            <p className="text-sm">When buyers book consultations, they'll appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {upcomingMeetings.map((meeting) => (
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
                        {(() => {
                          const statusDisplay = getMeetingStatusDisplay(meeting);
                          const timeInfo = getMeetingTimeInfo(meeting);
                          return (
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                                <span className="mr-1">{statusDisplay.icon}</span>
                                <span>{statusDisplay.status}</span>
                              </span>
                              {timeInfo.isUpcoming && (
                                <span className="text-xs text-gray-500">
                                  {formatTimeUntilMeeting(timeInfo)}
                                </span>
                              )}
                            </div>
                          );
                        })()}
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

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          disabled={!meeting.meeting_link}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Video className="h-3 w-3 mr-1" />
                          {meeting.meeting_link ? 'Join Meeting' : 'No Link'}
                        </button>

                        {meeting.status === 'confirmed' && !meeting.meeting_link && (
                          <button
                            onClick={() => handleAddMeetingLink(meeting)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Link
                          </button>
                        )}

                        {meeting.status === 'confirmed' && meeting.meeting_link && (
                          <button
                            onClick={() => handleAddMeetingLink(meeting)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Update Link
                          </button>
                        )}

                        {meeting.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(meeting.id, 'confirmed')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(meeting.id, 'cancelled')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </button>
                          </>
                        )}

                        {(meeting.status === 'confirmed' || meeting.status === 'in_progress') && (
                          <>
                            <button
                              onClick={() => handleMarkCompleted(meeting.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Complete
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(meeting.id, 'cancelled')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </button>
                          </>
                        )}

                        {meeting.status === 'missed' && (
                          <button
                            onClick={() => handleMarkCompleted(meeting.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buyer Contact Info */}
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-end space-x-1 mb-1">
                      <User className="h-4 w-4" />
                      <span>{meeting.buyer?.email || 'Unknown Email'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Booked {new Date(meeting.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Link Modal */}
      <AddMeetingLinkModal
        isOpen={showMeetingLinkModal}
        onClose={handleCloseMeetingLinkModal}
        bookingId={selectedBooking?.id || ''}
        onSave={handleSaveMeetingLink}
        currentLink={selectedBooking?.meeting_link}
      />
    </>
  );
} 