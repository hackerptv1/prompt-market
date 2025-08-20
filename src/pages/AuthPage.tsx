import React, { useState } from 'react';
import { RoleSelection } from '../components/auth/RoleSelection';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { BackButton } from '../components/shared/BackButton';

type AuthMode = 'role-select' | 'login' | 'signup';
export type UserRole = 'buyer' | 'seller' | 'admin' | null;

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('role-select');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <BackButton />
        </div>
        
        <div className="space-y-8">
          {mode === 'role-select' && (
            <RoleSelection onSelect={handleRoleSelect} />
          )}
          
          {mode === 'login' && (
            <LoginForm 
              role={selectedRole} 
              onModeChange={() => setMode('signup')}
            />
          )}
          
          {mode === 'signup' && (
            <SignUpForm 
              role={selectedRole} 
              onModeChange={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}