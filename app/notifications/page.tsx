'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    MessageSquare,
    Clock,
    Trash2,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { notifications, setNotifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchNotifications();
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.USER.NOTIFICATIONS);
            if (response.success) {
                setNotifications(response.data.data || response.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await api.put(`${API_ENDPOINTS.USER.NOTIFICATIONS}/${notificationId}/read`);
            markAsRead(notificationId);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put(`${API_ENDPOINTS.USER.NOTIFICATIONS}/read-all`);
            markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'complaint_update':
                return <AlertCircle className="h-5 w-5 text-blue-600" />;
            case 'new_comment':
                return <MessageSquare className="h-5 w-5 text-green-600" />;
            case 'assignment':
                return <CheckCircle2 className="h-5 w-5 text-purple-600" />;
            case 'escalation':
                return <TrendingUp className="h-5 w-5 text-orange-600" />;
            case 'resolution':
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Bell className="h-8 w-8" />
                            Notifications
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button onClick={handleMarkAllAsRead} variant="outline">
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                    >
                        All ({notifications.length})
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </Button>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
                        >
                            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-600">
                                {filter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
                            </p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((notification, index) => (
                            <motion.div
                                key={notification.notification_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${!notification.is_read ? 'border-l-4 border-l-blue-600' : ''
                                    }`}
                                onClick={() => {
                                    if (!notification.is_read) {
                                        handleMarkAsRead(notification.notification_id);
                                    }
                                    // Navigate to related complaint if available
                                    if (notification.data?.complaint_id) {
                                        router.push(`/issues/${notification.data.complaint_id}`);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${!notification.is_read ? 'bg-blue-50' : 'bg-gray-100'}`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                                        {notification.data && (
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {notification.data.complaint_id && (
                                                    <span className="font-mono">ID: {notification.data.complaint_id.substring(0, 8)}</span>
                                                )}
                                                {notification.data.status && (
                                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                                        Status: {notification.data.status}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {!notification.is_read && (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Load More (if pagination needed) */}
                {filteredNotifications.length > 0 && filteredNotifications.length % 20 === 0 && (
                    <div className="mt-8 text-center">
                        <Button variant="outline">Load More</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
