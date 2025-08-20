import React from 'react';
import { Database, Download, Upload } from 'lucide-react';

export function BackupSettings() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Backup & Restore</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Automatic Backups
            </label>
            <select className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retention Period (days)
            </label>
            <input
              type="number"
              defaultValue="30"
              min="1"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <h3 className="font-medium text-gray-900">Manual Backup</h3>
              <p className="text-sm text-gray-600">Download a backup of your data</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-5 w-5" />
              Download Backup
            </button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <h3 className="font-medium text-gray-900">Restore Backup</h3>
              <p className="text-sm text-gray-600">Upload a previous backup file</p>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
              <Upload className="h-5 w-5" />
              Upload Backup
              <input type="file" className="hidden" accept=".sql,.zip" />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Backup Settings
          </button>
        </div>
      </div>
    </div>
  );
}