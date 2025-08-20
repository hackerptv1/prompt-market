import React from 'react';
import { BackButton } from '../components/shared/BackButton';
import { AccountSettings } from '../components/settings/AccountSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { PaymentSettings } from '../components/settings/PaymentSettings';
import { DangerZone } from '../components/settings/DangerZone';

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        
        <div className="space-y-6 sm:space-y-8">
          <AccountSettings />
          <NotificationSettings />
          <SecuritySettings />
          <PaymentSettings />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}