import React from 'react';
import type { ConsultationStatus as Status } from '../../../types/consultations';

interface ConsultationStatusProps {
  status: Status;
}

export function ConsultationStatus({ status }: ConsultationStatusProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-50 text-green-700';
      case 'completed':
        return 'bg-gray-50 text-gray-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}