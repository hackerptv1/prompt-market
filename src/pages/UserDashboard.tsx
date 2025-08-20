import React from 'react';
import { PurchasedPrompts } from '../components/dashboard/PurchasedPrompts';
import { SavedPrompts } from '../components/dashboard/SavedPrompts';
import { FollowedSellers } from '../components/dashboard/FollowedSellers';
import { FollowedSellerPrompts } from '../components/dashboard/FollowedSellerPrompts';
import { UserReviews } from '../components/dashboard/UserReviews';
import { AccountDetails } from '../components/dashboard/AccountDetails';
import { WalletSection } from '../components/dashboard/WalletSection';
import { ConsultationsSection } from '../components/dashboard/ConsultationsSection';
import { SupportSection } from '../components/dashboard/SupportSection';
import { NotificationsSection } from '../components/dashboard/NotificationsSection';
import { BackButton } from '../components/shared/BackButton';

export function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <NotificationsSection />
            <PurchasedPrompts />
            <SavedPrompts />
            <FollowedSellers />
            <FollowedSellerPrompts />
            <UserReviews />
            <ConsultationsSection />
            <SupportSection />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            <div className="sticky top-24">
              <AccountDetails />
              <div className="mt-6 sm:mt-8">
                <WalletSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}