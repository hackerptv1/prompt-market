import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    setShowConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 text-red-600 mb-6">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Danger Zone</h2>
      </div>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Once you delete your account, there is no going back. Please be certain.
        </p>

        {showConfirm ? (
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
}