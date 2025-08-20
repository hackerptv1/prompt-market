import React, { useState } from 'react';
import { Trash2, RefreshCw, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  runConsultationCleanup, 
  cleanupAllPastSlots, 
  markBookedSlotsForDeletion, 
  deleteOldBookedSlots, 
  cleanupOldConsultationBookings 
} from '../../../utils/consultationCleanup';

interface CleanupResult {
  past_slots_cleaned: number;
  old_booked_slots_deleted: number;
  old_bookings_deleted: number;
  timestamp: string;
}

export function ConsultationCleanup() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFullCleanup = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await runConsultationCleanup();
      if (result) {
        setLastCleanup(result);
      } else {
        setError('Failed to run cleanup');
      }
    } catch (err) {
      setError('Error running cleanup');
      console.error('Cleanup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePastSlotsCleanup = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cleanupAllPastSlots();
      if (result !== null) {
        setLastCleanup({
          past_slots_cleaned: result,
          old_booked_slots_deleted: 0,
          old_bookings_deleted: 0,
          timestamp: new Date().toISOString()
        });
      } else {
        setError('Failed to clean up past slots');
      }
    } catch (err) {
      setError('Error cleaning up past slots');
      console.error('Cleanup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkBookedSlots = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await markBookedSlotsForDeletion();
      if (result !== null) {
        setLastCleanup({
          past_slots_cleaned: 0,
          old_booked_slots_deleted: result,
          old_bookings_deleted: 0,
          timestamp: new Date().toISOString()
        });
      } else {
        setError('Failed to mark booked slots');
      }
    } catch (err) {
      setError('Error marking booked slots');
      console.error('Cleanup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOldBookedSlots = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await deleteOldBookedSlots();
      if (result !== null) {
        setLastCleanup({
          past_slots_cleaned: 0,
          old_booked_slots_deleted: result,
          old_bookings_deleted: 0,
          timestamp: new Date().toISOString()
        });
      } else {
        setError('Failed to delete old booked slots');
      }
    } catch (err) {
      setError('Error deleting old booked slots');
      console.error('Cleanup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupOldBookings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cleanupOldConsultationBookings();
      if (result !== null) {
        setLastCleanup({
          past_slots_cleaned: 0,
          old_booked_slots_deleted: 0,
          old_bookings_deleted: result,
          timestamp: new Date().toISOString()
        });
      } else {
        setError('Failed to clean up old bookings');
      }
    } catch (err) {
      setError('Error cleaning up old bookings');
      console.error('Cleanup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Consultation Cleanup</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Auto-cleanup runs daily at 2 AM UTC</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {lastCleanup && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-900">Last Cleanup Results</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-green-700 font-medium">{lastCleanup.past_slots_cleaned}</div>
              <div className="text-green-600">Past Slots Cleaned</div>
            </div>
            <div>
              <div className="text-green-700 font-medium">{lastCleanup.old_booked_slots_deleted}</div>
              <div className="text-green-600">Old Booked Slots Deleted</div>
            </div>
            <div>
              <div className="text-green-700 font-medium">{lastCleanup.old_bookings_deleted}</div>
              <div className="text-green-600">Old Bookings Deleted</div>
            </div>
          </div>
          <div className="text-xs text-green-600 mt-2">
            {new Date(lastCleanup.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleFullCleanup}
            disabled={isLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-3"
          >
            <RefreshCw className={`w-5 h-5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <div className="font-medium text-gray-900">Full Cleanup</div>
              <div className="text-sm text-gray-600">Run all cleanup operations</div>
            </div>
          </button>

          <button
            onClick={handlePastSlotsCleanup}
            disabled={isLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-3"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Clean Past Slots</div>
              <div className="text-sm text-gray-600">Remove all past slots</div>
            </div>
          </button>

          <button
            onClick={handleMarkBookedSlots}
            disabled={isLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-3"
          >
            <Clock className="w-5 h-5 text-orange-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Mark Old Booked</div>
              <div className="text-sm text-gray-600">Mark 20+ day old booked slots</div>
            </div>
          </button>

          <button
            onClick={handleDeleteOldBookedSlots}
            disabled={isLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-3"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Delete Old Booked</div>
              <div className="text-sm text-gray-600">Delete 20+ day old booked slots</div>
            </div>
          </button>

          <button
            onClick={handleCleanupOldBookings}
            disabled={isLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-3"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Clean Old Bookings</div>
              <div className="text-sm text-gray-600">Delete 20+ day old bookings</div>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Cleanup Policy</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>All past slots:</strong> Moved to meeting history and deleted from slots table</li>
            <li>• <strong>Booked slots:</strong> Deleted after 20 days</li>
            <li>• <strong>Consultation bookings:</strong> Deleted after 90 days (preserves history)</li>
            <li>• <strong>Automatic cleanup:</strong> Runs daily at 2 AM UTC</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 