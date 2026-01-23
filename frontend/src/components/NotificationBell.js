import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Mail, Gift, FileText, AlertCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=10');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({ title: "All notifications marked as read" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to mark all as read" });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
      toast({ title: "Notification deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete notification" });
    }
  };

  const getIcon = (type) => {
    const icons = {
      verification: <CheckCheck className="h-4 w-4 text-green-500" />,
      sponsorship: <Gift className="h-4 w-4 text-purple-500" />,
      document: <FileText className="h-4 w-4 text-blue-500" />,
      progress: <FileText className="h-4 w-4 text-amber-500" />,
      message: <Mail className="h-4 w-4 text-indigo-500" />,
      system: <Settings className="h-4 w-4 text-gray-500" />,
      payment: <Gift className="h-4 w-4 text-green-500" />,
    };
    return icons[type] || <Bell className="h-4 w-4 text-gray-500" />;
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        data-testid="notification-bell"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border z-50 max-h-[70vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-indigo-950">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-red-100 text-red-700">{unreadCount} new</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[50vh]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''} text-gray-900`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={() => deleteNotification(notification.notification_id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.created_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            {notification.action_url && (
                              <a
                                href={notification.action_url}
                                className="text-xs text-indigo-600 hover:underline"
                              >
                                {notification.action_text || 'View'}
                              </a>
                            )}
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.notification_id)}
                                className="text-xs text-gray-500 hover:text-indigo-600"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <a href="/notifications" className="text-sm text-indigo-600 hover:underline">
                  View all notifications
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
