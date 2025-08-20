import React, { useState } from 'react';
import { Camera } from 'lucide-react';

export function AccountSettings() {
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop');

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={avatar}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Profile Photo</h3>
            <p className="text-sm text-gray-600">
              Upload a new profile photo
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                defaultValue="John"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                defaultValue="Doe"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue="john@example.com"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows={4}
              defaultValue="I'm a software developer passionate about AI and machine learning."
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}