import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { UploadPromptForm } from '../components/seller/UploadPromptForm';
import { PromptsList } from '../components/seller/PromptsList';
import { EarningsSummary } from '../components/seller/EarningsSummary';
import { MediaLinksSection } from '../components/seller/MediaLinksSection';
import { SellerInfoSection } from '../components/seller/SellerInfoSection';
import { RecentFollowers } from '../components/seller/RecentFollowers';
import { ConsultationSettings } from '../components/seller/ConsultationSettings';
import { ConsultationSlotsManager } from '../components/seller/ConsultationSlotsManager';
import { UpcomingMeetings } from '../components/seller/UpcomingMeetings';
import { MeetingHistory } from '../components/seller/MeetingHistory';
import { BackButton } from '../components/shared/BackButton';

export function SellerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your prompts, earnings, and consultations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload New Prompt */}
            <UploadPromptForm />
            
            {/* Your Prompts */}
            <PromptsList />
            
            {/* Consultation Settings */}
            <ConsultationSettings />
            
            {/* Consultation Slots Manager */}
            <ConsultationSlotsManager />
            
            {/* Upcoming Meetings */}
            <UpcomingMeetings />
            
            {/* Meeting History */}
            <MeetingHistory />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Seller Info */}
            <SellerInfoSection />
            
            {/* Earnings Summary */}
            <EarningsSummary />
            
            {/* Recent Followers */}
            <RecentFollowers />
            
            {/* Media Links */}
            <MediaLinksSection />
          </div>
        </div>
      </div>
    </div>
  );
}