import { create } from 'zustand';
import { Notification } from '@/types';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;

    // Actions
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,

    setNotifications: (notifications) => {
        const unread = notifications.filter(n => !n.is_read).length;
        set({ notifications, unreadCount: unread });
    },

    addNotification: (notification) => {
        const current = get().notifications;
        const updated = [notification, ...current];
        const unread = updated.filter(n => !n.is_read).length;
        set({ notifications: updated, unreadCount: unread });
    },

    markAsRead: (notificationId) => {
        const current = get().notifications;
        const updated = current.map(n =>
            n.notification_id === notificationId ? { ...n, is_read: true } : n
        );
        const unread = updated.filter(n => !n.is_read).length;
        set({ notifications: updated, unreadCount: unread });
    },

    markAllAsRead: () => {
        const current = get().notifications;
        const updated = current.map(n => ({ ...n, is_read: true }));
        set({ notifications: updated, unreadCount: 0 });
    },

    clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
    },
}));
