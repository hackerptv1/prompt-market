/**
 * Utility functions for consistent date handling across the app
 * Prevents timezone issues when working with date strings
 */

/**
 * Format a date string (YYYY-MM-DD) to a localized date string
 * Handles timezone issues by treating the date as local time
 */
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}): string {
  // Fix timezone issue: treat the date as local time, not UTC
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day); // month is 0-indexed
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return localDate.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date string to a short format (e.g., "Mon, Jan 20")
 */
export function formatDateShort(dateString: string): string {
  return formatDate(dateString, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Create a Date object from a date string, treating it as local time
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Check if a date string represents a past date
 */
export function isPastDate(dateString: string): boolean {
  const date = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date and time combination
 */
export function formatDateTime(dateString: string, timeString: string): string {
  const date = parseLocalDate(dateString);
  const [hours, minutes] = timeString.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
} 