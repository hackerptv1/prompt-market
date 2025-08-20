export type ConsultationStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Consultation {
  id: string;
  expert: {
    id: string;
    name: string;
    avatar: string;
  };
  date: string;
  time: string;
  duration: string;
  status: ConsultationStatus;
  meetingUrl?: string;
}