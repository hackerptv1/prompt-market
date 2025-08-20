import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

export function OAuthDebug() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      addLog(`Session: ${session ? 'Found' : 'Not found'}`);
      
      if (session?.user) {
        addLog(`User ID: ${session.user.id}`);
        addLog(`User Email: ${session.user.email}`);
        addLog(`User Metadata: ${JSON.stringify(session.user.user_metadata)}`);
        
        // Check profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          addLog(`Profile Error: ${error.message}`);
        } else {
          setProfile(profileData);
          addLog(`Profile Found: ${JSON.stringify(profileData)}`);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth State Change: ${event}`);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    addLog('Signed out');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">OAuth Debug</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Logs
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Session</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Profile</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Logs</h4>
          <div className="bg-gray-100 p-2 rounded max-h-60 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 