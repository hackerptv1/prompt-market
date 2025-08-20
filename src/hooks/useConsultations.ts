import { useState } from 'react';
import type { Consultation } from '../types/consultations';

export function useConsultations() {
  const [consultations] = useState<Consultation[]>([
    {
      id: '1',
      expert: {
        id: 'exp1',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      date: '2024-03-20',
      time: '10:00 AM',
      duration: '60 min',
      status: 'upcoming',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      expert: {
        id: 'exp2',
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
      date: '2024-03-18',
      time: '2:00 PM',
      duration: '30 min',
      status: 'completed',
    },
    {
      id: '3',
      expert: {
        id: 'exp3',
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      },
      date: '2024-03-25',
      time: '11:30 AM',
      duration: '45 min',
      status: 'upcoming',
      meetingUrl: 'https://meet.google.com/xyz-uvwx-yz',
    },
    {
      id: '4',
      expert: {
        id: 'exp4',
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      },
      date: '2024-03-22',
      time: '3:30 PM',
      duration: '60 min',
      status: 'upcoming',
      meetingUrl: 'https://meet.google.com/123-456-789',
    },
    {
      id: '5',
      expert: {
        id: 'exp5',
        name: 'Lisa Wang',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      },
      date: '2024-03-15',
      time: '1:00 PM',
      duration: '45 min',
      status: 'cancelled',
    }
  ]);

  return { consultations };
}