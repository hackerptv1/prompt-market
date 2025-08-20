import React from 'react';
import { BookingsList } from './BookingsList';
import { BookingStats } from './BookingStats';
import { BookingFilters } from './BookingFilters';

export function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          Export Data
        </button>
      </div>

      <BookingStats />
      <BookingFilters />
      <BookingsList />
    </div>
  );
}