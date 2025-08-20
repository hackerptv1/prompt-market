// Platform integration utilities for automatic meeting link generation

export interface PlatformConfig {
  platform: string;
  email?: string;
  username?: string;
  phone?: string;
}

export interface MeetingLink {
  join_url: string;
  meeting_id?: string;
  password?: string;
  platform: string;
}

// Validate email format - more permissive and robust
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Trim whitespace
  const trimmedEmail = email.trim();
  if (trimmedEmail === '') return false;
  
  // More permissive email regex that handles most valid email formats
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(trimmedEmail);
}

// Validate phone number format
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Generate Zoom meeting link
export function generateZoomMeetingLink(config: PlatformConfig, startTime: Date, duration: number): MeetingLink {
  if (!config.email || !validateEmail(config.email)) {
    throw new Error('Valid Zoom email is required');
  }

  // Generate a unique meeting ID (in real implementation, you'd use Zoom API)
  const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const password = Math.random().toString(36).substring(2, 8);
  
  const joinUrl = `https://zoom.us/j/${meetingId}?pwd=${password}`;
  
  return {
    join_url: joinUrl,
    meeting_id: meetingId,
    password: password,
    platform: 'Zoom Meeting'
  };
}

// Generate Google Meet link
export function generateGoogleMeetLink(config: PlatformConfig, startTime: Date, duration: number): MeetingLink {
  if (!config.email || !validateEmail(config.email)) {
    throw new Error('Valid Google Calendar email is required');
  }

  // Generate a unique meeting code (in real implementation, you'd use Google Calendar API)
  const meetingCode = Math.random().toString(36).substring(2, 10);
  
  const joinUrl = `https://meet.google.com/${meetingCode}`;
  
  return {
    join_url: joinUrl,
    meeting_id: meetingCode,
    platform: 'Google Meet'
  };
}

// Generate Microsoft Teams link
export function generateTeamsMeetingLink(config: PlatformConfig, startTime: Date, duration: number): MeetingLink {
  if (!config.email || !validateEmail(config.email)) {
    throw new Error('Valid Teams email is required');
  }

  // Generate a unique meeting link (in real implementation, you'd use Microsoft Graph API)
  const meetingId = Math.random().toString(36).substring(2, 15);
  
  const joinUrl = `https://teams.microsoft.com/l/meetup-join/19:meeting_${meetingId}@thread.v2/0?context={"Tid":"tenant-id"}`;
  
  return {
    join_url: joinUrl,
    meeting_id: meetingId,
    platform: 'Microsoft Teams'
  };
}

// Generate Skype link
export function generateSkypeLink(config: PlatformConfig): MeetingLink {
  if (!config.username) {
    throw new Error('Skype username is required');
  }

  const joinUrl = `https://join.skype.com/invite/${config.username}`;
  
  return {
    join_url: joinUrl,
    platform: 'Skype'
  };
}

// Generate phone call link
export function generatePhoneCallLink(config: PlatformConfig): MeetingLink {
  if (!config.phone || !validatePhoneNumber(config.phone)) {
    throw new Error('Valid phone number is required');
  }

  const joinUrl = `tel:${config.phone}`;
  
  return {
    join_url: joinUrl,
    platform: 'Phone Call'
  };
}

// Main function to generate meeting link based on platform
export function generateMeetingLink(
  platform: string, 
  config: PlatformConfig, 
  startTime: Date, 
  duration: number
): MeetingLink {
  switch (platform) {
    case 'Zoom Meeting':
      return generateZoomMeetingLink(config, startTime, duration);
    
    case 'Google Meet':
      return generateGoogleMeetLink(config, startTime, duration);
    
    case 'Microsoft Teams':
      return generateTeamsMeetingLink(config, startTime, duration);
    
    case 'Skype':
      return generateSkypeLink(config);
    
    case 'Phone Call':
      return generatePhoneCallLink(config);
    
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Get platform-specific configuration from seller settings
export function getPlatformConfig(platform: string, settings: any): PlatformConfig {
  switch (platform) {
    case 'Zoom Meeting':
      return {
        platform,
        email: settings.zoom_email
      };
    
    case 'Google Meet':
      return {
        platform,
        email: settings.google_calendar_email
      };
    
    case 'Microsoft Teams':
      return {
        platform,
        email: settings.teams_email
      };
    
    case 'Skype':
      return {
        platform,
        username: settings.skype_username
      };
    
    case 'Phone Call':
      return {
        platform,
        phone: settings.phone_number
      };
    
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Validate platform configuration
export function validatePlatformConfig(platform: string, settings: any): { isValid: boolean; message: string } {
  try {
    const config = getPlatformConfig(platform, settings);
    
    switch (platform) {
      case 'Zoom Meeting':
        if (!config.email || config.email.trim() === '') {
          return { isValid: false, message: 'Zoom email is required' };
        }
        if (!validateEmail(config.email)) {
          return { isValid: false, message: 'Invalid Zoom email format' };
        }
        break;
      
      case 'Google Meet':
        if (!config.email || config.email.trim() === '') {
          return { isValid: false, message: 'Google Calendar email is required' };
        }
        if (!validateEmail(config.email)) {
          return { isValid: false, message: 'Invalid Google Calendar email format' };
        }
        break;
      
      case 'Microsoft Teams':
        if (!config.email || config.email.trim() === '') {
          return { isValid: false, message: 'Teams email is required' };
        }
        if (!validateEmail(config.email)) {
          return { isValid: false, message: 'Invalid Teams email format' };
        }
        break;
      
      case 'Skype':
        if (!config.username || config.username.trim() === '') {
          return { isValid: false, message: 'Skype username is required' };
        }
        break;
      
      case 'Phone Call':
        if (!config.phone || config.phone.trim() === '') {
          return { isValid: false, message: 'Phone number is required' };
        }
        if (!validatePhoneNumber(config.phone)) {
          return { isValid: false, message: 'Invalid phone number format' };
        }
        break;
    }
    
    return { isValid: true, message: 'Configuration is valid' };
  } catch (error) {
    return { isValid: false, message: error instanceof Error ? error.message : 'Invalid configuration' };
  }
}

// Format meeting time for different platforms
export function formatMeetingTime(startTime: Date, duration: number): string {
  const endTime = new Date(startTime.getTime() + duration * 60000);
  
  return `${startTime.toLocaleString()} - ${endTime.toLocaleString()}`;
}

// Get platform-specific instructions
export function getPlatformInstructions(platform: string): string {
  switch (platform) {
    case 'Zoom Meeting':
      return 'Enter your Zoom account email. Meeting links will be automatically generated when bookings are confirmed.';
    
    case 'Google Meet':
      return 'Enter your Google Calendar email. Meeting links will be automatically generated when bookings are confirmed.';
    
    case 'Microsoft Teams':
      return 'Enter your Microsoft Teams email. Meeting links will be automatically generated when bookings are confirmed.';
    
    case 'Skype':
      return 'Enter your Skype username. Buyers will receive your Skype contact information.';
    
    case 'Phone Call':
      return 'Enter your phone number. Buyers will receive your contact information for phone consultations.';
    
    default:
      return 'Configure your platform settings to enable automatic meeting link generation.';
  }
} 