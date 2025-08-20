export interface Prompt {
  id: string;
  title: string;
  description: string;
  requirements: string;
  price: number;
  category: string[];
  rating: number;
  total_reviews?: number;
  sales: number;
  thumbnail?: string;
  media_urls?: string[];
  fileUrls?: string[];
  author: {
    id?: string;
    name: string;
    avatar: string;
    rating?: number;
    total_reviews?: number;
    sales_count?: number;
  };
  platform: {
    name: string;
    logo: string;
    type: 'ai' | 'automation';
  };
  createdAt: string;
  aiRunningCost: number;
  estimatedRunTime: string;
  productType: string;
  media_links?: Array<{
    id: string;
    title: string;
    url: string;
    platform: string;
  }>;
}

export type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

export interface ConsultationSettings {
  consultation_enabled: boolean;
  consultation_price: number;
  consultation_duration: number;
  consultation_description: string;
  consultation_platform: string; // Now always 'Google Meet'
  google_calendar_email?: string;
  google_calendar_connected?: boolean;
  auto_generate_meeting_links?: boolean;
}

export interface ConsultationSlot {
  id?: string;
  seller_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  booked_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultationBooking {
  id?: string;
  slot_id: string;
  buyer_id: string;
  seller_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'missed' | 'in_progress';
  meeting_link?: string;
  notes?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_amount?: number;
  payment_intent_id?: string;
  payment_method_id?: string;
  payment_date?: string;
  platform_meeting_id?: string;
  platform_meeting_password?: string;
  platform_join_url?: string;
  // Google Calendar integration fields
  google_calendar_event_id?: string;
  google_calendar_meet_link?: string;
  google_calendar_invite_sent?: boolean;
  google_calendar_invite_sent_at?: string;
  buyer_calendar_invite_sent?: boolean;
  buyer_calendar_invite_sent_at?: string;
  created_at?: string;
  updated_at?: string;
}