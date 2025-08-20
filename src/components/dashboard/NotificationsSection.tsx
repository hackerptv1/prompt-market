import React, { useState } from 'react';
import { Bell, Check, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsSection() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_prompt':
        return '🎯';
      case 'new_follower':
        return '👤';
      default:
        return '📢';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 'No notifications yet'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Follow sellers to get notified when they create new prompts
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleNotificationClick(notification)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Mark read
                        </button>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  {notification.type === 'new_prompt' && notification.data?.prompt_id && (
                    <div className="mt-3">
                      <Link
                        to={`/prompt/${notification.data.prompt_id}`}
                        onClick={() => handleNotificationClick(notification)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Prompt →
                      </Link>
                    </div>
                  )}
                  {notification.type === 'new_follower' && (
                    <div className="mt-3">
                      <Link
                        to="/seller"
                        onClick={() => handleNotificationClick(notification)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Dashboard →
                      </Link>
                    </div>
                  )}
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 