import { ConsultationBooking } from '../types';
import { supabase } from './supabase';

export interface MeetingTimeInfo {
  isUpcoming: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  isMissed: boolean;
  isCancelled: boolean;
  timeUntilStart: number; // minutes
  timeUntilEnd: number; // minutes
  isOverdue: boolean;
}

export function getMeetingTimeInfo(booking: ConsultationBooking): MeetingTimeInfo {
  const now = new Date();
  const meetingDate = new Date(booking.booking_date);
  const startTime = new Date(`${booking.booking_date}T${booking.start_time}`);
  const endTime = new Date(`${booking.booking_date}T${booking.end_time}`);
  const gracePeriodEnd = new Date(endTime.getTime() + 15 * 60 * 1000); // 15 minutes after end

  const timeUntilStart = Math.floor((startTime.getTime() - now.getTime()) / (1000 * 60));
  const timeUntilEnd = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));
  const isOverdue = now > gracePeriodEnd;

  return {
    isUpcoming: now < startTime,
    isInProgress: now >= startTime && now <= endTime,
    isCompleted: booking.status === 'completed',
    isMissed: booking.status === 'missed' || (isOverdue && booking.status === 'confirmed'),
    isCancelled: booking.status === 'cancelled',
    timeUntilStart,
    timeUntilEnd,
    isOverdue
  };
}

export function getMeetingStatusDisplay(booking: ConsultationBooking): {
  status: string;
  color: string;
  icon: string;
  description: string;
} {
  const timeInfo = getMeetingTimeInfo(booking);

  if (booking.status === 'cancelled') {
    return {
      status: 'Cancelled',
      color: 'text-red-600 bg-red-50',
      icon: '❌',
      description: 'This meeting was cancelled'
    };
  }

  if (booking.status === 'completed') {
    return {
      status: 'Completed',
      color: 'text-green-600 bg-green-50',
      icon: '✅',
      description: 'This meeting was successfully completed'
    };
  }

  if (timeInfo.isMissed) {
    return {
      status: 'Missed',
      color: 'text-red-600 bg-red-50',
      icon: '⏰',
      description: 'This meeting was missed'
    };
  }

  if (timeInfo.isInProgress) {
    return {
      status: 'In Progress',
      color: 'text-blue-600 bg-blue-50',
      icon: '🔄',
      description: 'This meeting is currently happening'
    };
  }

  if (timeInfo.isUpcoming) {
    if (timeInfo.timeUntilStart < 60) {
      return {
        status: 'Starting Soon',
        color: 'text-orange-600 bg-orange-50',
        icon: '⏳',
        description: `Meeting starts in ${timeInfo.timeUntilStart} minutes`
      };
    } else {
      return {
        status: 'Upcoming',
        color: 'text-gray-600 bg-gray-50',
        icon: '📅',
        description: `Meeting starts in ${Math.floor(timeInfo.timeUntilStart / 60)} hours`
      };
    }
  }

  return {
    status: 'Confirmed',
    color: 'text-gray-600 bg-gray-50',
    icon: '📋',
    description: 'Meeting is confirmed'
  };
}

export function formatTimeUntilMeeting(timeInfo: MeetingTimeInfo): string {
  if (timeInfo.isInProgress) {
    return 'Happening now';
  }

  if (timeInfo.isOverdue) {
    return 'Overdue';
  }

  if (timeInfo.timeUntilStart < 0) {
    return 'Started';
  }

  if (timeInfo.timeUntilStart < 60) {
    return `${timeInfo.timeUntilStart} minutes`;
  }

  const hours = Math.floor(timeInfo.timeUntilStart / 60);
  const minutes = timeInfo.timeUntilStart % 60;

  if (hours < 24) {
    return `${hours}h ${minutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return `${days}d ${remainingHours}h`;
}

// Function to manually trigger status updates from frontend
export async function triggerStatusUpdate(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('update_meeting_statuses');
    
    if (error) {
      console.error('Error updating meeting statuses:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error triggering status update:', err);
    return { success: false, error: 'Failed to update meeting statuses' };
  }
}

// Function to mark a meeting as completed
export async function markMeetingCompleted(bookingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('mark_meeting_completed', {
      p_booking_id: bookingId
    });

    if (error) {
      console.error('Error marking meeting as completed:', error);
      return { success: false, error: error.message };
    }

    if (data?.success) {
      return { success: true };
    } else {
      return { success: false, error: data?.error || 'Failed to mark meeting as completed' };
    }
  } catch (err) {
    console.error('Error marking meeting as completed:', err);
    return { success: false, error: 'Failed to mark meeting as completed' };
  }
} 