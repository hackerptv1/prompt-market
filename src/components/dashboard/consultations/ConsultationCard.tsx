import React from 'react';
import { Calendar, Clock, Video, ExternalLink, X } from 'lucide-react';
import type { Consultation } from '../../../types/consultations';
import { ConsultationStatus } from './ConsultationStatus';

interface ConsultationCardProps {
  consultation: Consultation;
}

export function ConsultationCard({ consultation }: ConsultationCardProps) {
  const handleCancel = () => {
    // TODO: Implement cancellation logic
    if (window.confirm('Are you sure you want to cancel this consultation?')) {
      console.log('Cancelling consultation:', consultation.id);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Video className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{consultation.expert.name}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{consultation.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{consultation.time}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status and buttons for mobile */}
      <div className="mt-4 sm:mt-0 sm:hidden">
        <ConsultationStatus status={consultation.status} />
        {consultation.status === 'upcoming' && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
            {consultation.meetingUrl && (
              <a 
                href={consultation.meetingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Call
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>
      
      {/* Status and buttons for desktop */}
      <div className="hidden sm:flex items-center gap-4">
        <ConsultationStatus status={consultation.status} />
        {consultation.status === 'upcoming' && (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            {consultation.meetingUrl && (
              <a 
                href={consultation.meetingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Call
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}