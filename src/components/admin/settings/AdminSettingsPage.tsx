import React from 'react';
import { GeneralSettings } from './GeneralSettings';
import { SecuritySettings } from './SecuritySettings';
import { EmailSettings } from './EmailSettings';
import { ApiSettings } from './ApiSettings';
import { BackupSettings } from './BackupSettings';

export function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
      <div className="space-y-6">
        <GeneralSettings />
        <SecuritySettings />
        <EmailSettings />
        <ApiSettings />
        <BackupSettings />
      </div>
    </div>
  );
}