import React, { useState, useEffect } from 'react';
import { Settings, Save, Video, Clock, DollarSign, Edit3, Mail, Calendar, User, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { initiateGoogleOAuth, handleGoogleOAuthCallback } from '../../utils/googleOAuth';
import { diagnoseGoogleCalendarConnection, fixGoogleCalendarConnection } from '../../utils/testGoogleCalendar';

interface ConsultationSettings {
  consultation_enabled: boolean;
  consultation_price: number;
  consultation_duration: number;
  consultation_description: string;
  consultation_platform: string;
  google_calendar_email?: string;
  google_calendar_connected?: boolean;
  auto_generate_meeting_links?: boolean;
}

export function ConsultationSettings() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [settings, setSettings] = useState<ConsultationSettings>({
    consultation_enabled: false,
    consultation_price: 99.00,
    consultation_duration: 60,
    consultation_description: 'Get personalized help with your prompt engineering needs. I\'ll help you create, refine, and optimize your AI prompts for better results.',
    consultation_platform: 'Google Meet',
    google_calendar_email: '',
    google_calendar_connected: false,
    auto_generate_meeting_links: true
  });
  const [formData, setFormData] = useState({
    consultation_enabled: false,
    consultation_price: '99.00',
    consultation_duration: '60',
    consultation_description: '',
    consultation_platform: 'Google Meet',
    google_calendar_email: '',
    google_calendar_connected: false,
    auto_generate_meeting_links: true
  });
  const [validation, setValidation] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [savedFormState, setSavedFormState] = useState<any>(null);
  
  // Helper functions for localStorage
  const saveFormStateToStorage = (formData: any) => {
    console.log('Saving form state to localStorage:', formData);
    localStorage.setItem('consultation_form_state', JSON.stringify(formData));
  };
  
  const getFormStateFromStorage = () => {
    const saved = localStorage.getItem('consultation_form_state');
    const parsed = saved ? JSON.parse(saved) : null;
    console.log('Retrieved form state from localStorage:', parsed);
    return parsed;
  };
  
  const clearFormStateFromStorage = () => {
    console.log('Clearing form state from localStorage');
    localStorage.removeItem('consultation_form_state');
  };

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '90 minutes' },
    { value: 120, label: '120 minutes' }
  ];

  useEffect(() => {
    fetchConsultationSettings();
  }, [user?.id]);

  // Cleanup saved form state when component unmounts
  useEffect(() => {
    return () => {
      setSavedFormState(null);
      clearFormStateFromStorage();
    };
  }, []);

  // Debug: Monitor formData changes
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Handle OAuth callback results
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        // Handle OAuth callback
        const result = await handleGoogleOAuthCallback();
        
        if (result.success) {
          console.log('Direct OAuth callback success, checking for saved form state...');
          setValidation({ isValid: true, message: 'Google Calendar connected successfully!' });
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
          
          // Check localStorage for saved form state first, then component state
          const storedFormState = getFormStateFromStorage();
          console.log('Direct OAuth - Stored form state from localStorage:', storedFormState);
          console.log('Direct OAuth - Component saved form state:', savedFormState);
          
          if (storedFormState) {
            console.log('Direct OAuth - Restoring form state from localStorage');
            setFormData(prev => ({
              ...storedFormState,
              google_calendar_connected: true
            }));
            clearFormStateFromStorage();
            setValidation(prev => ({ 
              ...prev, 
              message: 'Google Calendar connected successfully! Your form data has been preserved.' 
            }));
          } else if (savedFormState) {
            console.log('Direct OAuth - Restoring form state from component state');
            setFormData(prev => ({
              ...savedFormState,
              google_calendar_connected: true
            }));
            setSavedFormState(null);
            setValidation(prev => ({ 
              ...prev, 
              message: 'Google Calendar connected successfully! Your form data has been preserved.' 
            }));
          } else {
            console.log('Direct OAuth - No saved form state found, updating current form');
            setFormData(prev => ({ ...prev, google_calendar_connected: true }));
          }
        } else {
          setValidation({ isValid: false, message: result.error || 'Failed to connect Google Calendar. Please try again.' });
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
          
          // Check localStorage for saved form state first, then component state
          const storedFormState = getFormStateFromStorage();
          if (storedFormState) {
            setFormData(storedFormState);
            clearFormStateFromStorage();
          } else if (savedFormState) {
            setFormData(savedFormState);
            setSavedFormState(null);
          }
        }
      }
    };

    // Check for success/error messages from OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const googleConnected = urlParams.get('google_connected');
    const googleError = urlParams.get('google_error');

    if (googleConnected === 'true') {
      console.log('Google Calendar connected successfully, checking for saved form state...');
      setValidation({ isValid: true, message: 'Google Calendar connected successfully!' });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Check localStorage for saved form state first, then component state
      const storedFormState = getFormStateFromStorage();
      console.log('Stored form state from localStorage:', storedFormState);
      console.log('Component saved form state:', savedFormState);
      
      if (storedFormState) {
        console.log('Restoring form state from localStorage');
        setFormData(prev => ({
          ...storedFormState,
          google_calendar_connected: true
        }));
        clearFormStateFromStorage();
        setValidation(prev => ({ 
          ...prev, 
          message: 'Google Calendar connected successfully! Your form data has been preserved.' 
        }));
      } else if (savedFormState) {
        console.log('Restoring form state from component state');
        setFormData(prev => ({
          ...savedFormState,
          google_calendar_connected: true
        }));
        setSavedFormState(null);
        setValidation(prev => ({ 
          ...prev, 
          message: 'Google Calendar connected successfully! Your form data has been preserved.' 
        }));
      } else {
        console.log('No saved form state found, fetching from database');
        // Refresh settings to get updated data
        fetchConsultationSettings();
      }
    } else if (googleError === 'true') {
      setValidation({ isValid: false, message: 'Failed to connect Google Calendar. Please try again.' });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Check localStorage for saved form state first, then component state
      const storedFormState = getFormStateFromStorage();
      if (storedFormState) {
        setFormData(storedFormState);
        clearFormStateFromStorage();
      } else if (savedFormState) {
        setFormData(savedFormState);
        setSavedFormState(null);
      }
    }

    handleOAuthCallback();
  }, []);

  const fetchConsultationSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('consultation_enabled, consultation_price, consultation_duration, consultation_description, consultation_platform, google_calendar_email, google_calendar_connected, auto_generate_meeting_links')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const consultationSettings = {
        consultation_enabled: data.consultation_enabled || false,
        consultation_price: data.consultation_price || 99.00,
        consultation_duration: data.consultation_duration || 60,
        consultation_description: data.consultation_description || 'Get personalized help with your prompt engineering needs. I\'ll help you create, refine, and optimize your AI prompts for better results.',
        consultation_platform: 'Google Meet', // Force Google Meet
        google_calendar_email: data.google_calendar_email || '',
        google_calendar_connected: data.google_calendar_connected || false,
        auto_generate_meeting_links: data.auto_generate_meeting_links !== false
      };

      setSettings(consultationSettings);
      setFormData({
        consultation_enabled: consultationSettings.consultation_enabled,
        consultation_price: consultationSettings.consultation_price.toString(),
        consultation_duration: consultationSettings.consultation_duration.toString(),
        consultation_description: consultationSettings.consultation_description,
        consultation_platform: 'Google Meet',
        google_calendar_email: consultationSettings.google_calendar_email,
        google_calendar_connected: consultationSettings.google_calendar_connected,
        auto_generate_meeting_links: consultationSettings.auto_generate_meeting_links
      });
    } catch (error) {
      console.error('Error fetching consultation settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Validate Google Calendar email
    if (name === 'google_calendar_email') {
      const email = value.trim();
      if (email && !isValidEmail(email)) {
        setValidation({ isValid: false, message: 'Please enter a valid email address' });
      } else if (email && !email.includes('@gmail.com') && !email.includes('@googlemail.com')) {
        setValidation({ isValid: false, message: 'Please use a Gmail address for Google Calendar integration' });
      } else {
        setValidation({ isValid: true, message: 'Valid Gmail address for Google Calendar integration' });
      }
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleConnectGoogleCalendar = async () => {
    if (!user) return;
    
    // Save current form state to localStorage before initiating OAuth
    console.log('Saving form state before OAuth:', formData);
    saveFormStateToStorage(formData);
    setSavedFormState({ ...formData });
    
    setIsConnecting(true);
    try {
      initiateGoogleOAuth(user.id);
    } catch (error) {
      console.error('Error initiating Google OAuth:', error);
      alert('Error connecting to Google Calendar. Please try again.');
      // Restore form state on error
      clearFormStateFromStorage();
      setSavedFormState(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    try {
      setFormData(prev => ({ ...prev, google_calendar_connected: false }));
      
      const { error } = await supabase
        .from('profiles')
        .update({
          google_calendar_connected: false,
          google_calendar_access_token: null,
          google_calendar_refresh_token: null,
          google_calendar_token_expires_at: null
        })
        .eq('id', user?.id);

      if (error) throw error;

      setValidation({ isValid: true, message: 'Google Calendar disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      setValidation({ isValid: false, message: 'Failed to disconnect Google Calendar' });
    }
  };

  const handleTestGoogleCalendar = async () => {
    if (!user) return;
    
    setIsTesting(true);
    setTestResult('');
    
    try {
      const result = await diagnoseGoogleCalendarConnection(user.id);
      setTestResult(`${result.message}\n\nAction needed: ${result.needsAction ? 'Yes' : 'No'}\n${result.action ? `Action: ${result.action}` : ''}`);
      
      if (result.needsAction && result.action?.includes('Reconnect')) {
        const shouldFix = confirm('Google Calendar connection needs to be fixed. Would you like to reset and reconnect?');
        if (shouldFix) {
          const fixResult = await fixGoogleCalendarConnection(user.id);
          setTestResult(prev => prev + `\n\nFix result: ${fixResult.message}`);
          if (fixResult.nextStep) {
            setTestResult(prev => prev + `\n\nNext step: ${fixResult.nextStep}`);
          }
        }
      }
    } catch (error) {
      console.error('Error testing Google Calendar:', error);
      setTestResult(`Error testing Google Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          consultation_enabled: formData.consultation_enabled,
          consultation_price: parseFloat(formData.consultation_price),
          consultation_duration: parseInt(formData.consultation_duration),
          consultation_description: formData.consultation_description,
          consultation_platform: 'Google Meet',
          google_calendar_email: formData.google_calendar_email?.trim() || null,
          auto_generate_meeting_links: formData.auto_generate_meeting_links
        })
        .eq('id', user.id);

      if (error) throw error;

      setSettings({
        consultation_enabled: formData.consultation_enabled,
        consultation_price: parseFloat(formData.consultation_price),
        consultation_duration: parseInt(formData.consultation_duration),
        consultation_description: formData.consultation_description,
        consultation_platform: 'Google Meet',
        google_calendar_email: formData.google_calendar_email,
        google_calendar_connected: formData.google_calendar_connected,
        auto_generate_meeting_links: formData.auto_generate_meeting_links
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating consultation settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Consultation Settings</h2>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enable/Disable Consultation */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Enable Consultations</h3>
                <p className="text-sm text-gray-500">Allow buyers to book consultation sessions with you</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="consultation_enabled"
                  checked={formData.consultation_enabled}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {formData.consultation_enabled && (
              <>
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="consultation_price"
                      value={formData.consultation_price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="99.00"
                      required
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Duration
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="consultation_duration"
                      value={formData.consultation_duration}
                      onChange={handleInputChange}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      {durationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Google Calendar Integration */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Google Calendar Integration</h3>
                      <p className="text-sm text-gray-500">Connect your Google Calendar to automatically schedule meetings and send calendar invites</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="auto_generate_meeting_links"
                        checked={formData.auto_generate_meeting_links}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {formData.auto_generate_meeting_links && (
                    <div className="space-y-4">
                      {/* Google Calendar Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gmail Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            name="google_calendar_email"
                            value={formData.google_calendar_email}
                            onChange={handleInputChange}
                            className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="your-email@gmail.com"
                            disabled={formData.google_calendar_connected}
                          />
                        </div>
                      </div>

                      {/* Google Calendar Connection Status */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">
                              Google Calendar Integration
                            </h4>
                            <p className="text-sm text-blue-800 mb-3">
                              When connected, meetings will be automatically scheduled on both your and the buyer's Google Calendar with Google Meet links.
                            </p>
                            
                            {formData.google_calendar_connected ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                  <span className="text-sm text-green-700">Connected to {formData.google_calendar_email}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleDisconnectGoogleCalendar}
                                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                  Disconnect
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-orange-500" />
                                  <span className="text-sm text-orange-700">Not connected</span>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Google Calendar Email
                                    </label>
                                    <input
                                      type="email"
                                      name="google_calendar_email"
                                      value={formData.google_calendar_email}
                                      onChange={handleInputChange}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                      placeholder="your-email@gmail.com"
                                    />
                                    {!validation.isValid && (
                                      <p className="mt-1 text-sm text-red-600">{validation.message}</p>
                                    )}
                                  </div>

                                  <div className="flex space-x-3">
                                    <button
                                      type="button"
                                      onClick={handleConnectGoogleCalendar}
                                      disabled={isConnecting}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                      {isConnecting ? 'Connecting...' : 'Connect Calendar'}
                                    </button>
                                    
                                    <button
                                      type="button"
                                      onClick={handleTestGoogleCalendar}
                                      disabled={isTesting}
                                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                      {isTesting ? 'Testing...' : 'Test Connection'}
                                    </button>
                                  </div>

                                  {testResult && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">Test Result:</h4>
                                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">{testResult}</pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Validation Status */}
                      {formData.google_calendar_email && (
                        <div className="flex items-center gap-2">
                          {validation.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className={`text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {validation.message}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Description
                  </label>
                  <textarea
                    name="consultation_description"
                    value={formData.consultation_description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describe what buyers can expect from your consultation..."
                    required
                  />
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <div className="space-y-6">
            {/* Current Settings Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Status</h3>
                  <p className={`text-sm ${settings.consultation_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {settings.consultation_enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Price</h3>
                  <p className="text-sm text-gray-600">${settings.consultation_price}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Duration</h3>
                  <p className="text-sm text-gray-600">{settings.consultation_duration} minutes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Platform</h3>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-gray-600">Google Meet</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Calendar Integration</h3>
                  <div className="flex items-center gap-2">
                    {settings.google_calendar_connected ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <span className="text-sm text-orange-600">Not connected</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Description</h3>
                  <p className="text-sm text-gray-600">{settings.consultation_description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 