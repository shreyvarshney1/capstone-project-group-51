'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { WS_EVENTS } from '@/lib/constants';
import { WebSocketMessage } from '@/types';
import { toast } from 'sonner';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

export function useWebSocket() {
    const socketRef = useRef<Socket | null>(null);
    const { token, isAuthenticated } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Initialize socket connection
        const socket = io(WS_URL, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setIsConnected(false);
        });

        // Complaint update event
        socket.on(WS_EVENTS.COMPLAINT_UPDATE, (data: WebSocketMessage) => {
            console.log('Complaint update:', data);

            // Show toast notification
            toast.info(`Complaint ${data.data.complaint_id} updated`, {
                description: `Status: ${data.data.status}`,
            });

            // Add to notification store
            addNotification({
                notification_id: `ws-${Date.now()}`,
                user_id: '',
                type: 'complaint_update',
                title: 'Complaint Updated',
                message: `Your complaint has been updated to ${data.data.status}`,
                data: data.data,
                is_read: false,
                created_at: new Date().toISOString(),
            });
        });

        // New comment event
        socket.on(WS_EVENTS.NEW_COMMENT, (data: WebSocketMessage) => {
            console.log('New comment:', data);

            toast.info('New comment on your complaint', {
                description: data.data.content?.substring(0, 50) + '...',
            });

            addNotification({
                notification_id: `ws-${Date.now()}`,
                user_id: '',
                type: 'new_comment',
                title: 'New Comment',
                message: 'Someone commented on your complaint',
                data: data.data,
                is_read: false,
                created_at: new Date().toISOString(),
            });
        });

        // New vote event
        socket.on(WS_EVENTS.NEW_VOTE, (data: WebSocketMessage) => {
            console.log('New vote:', data);
        });

        // Assignment event
        socket.on(WS_EVENTS.ASSIGNMENT, (data: WebSocketMessage) => {
            console.log('Complaint assigned:', data);

            toast.success('Complaint Assigned', {
                description: `Assigned to ${data.data.officer_name}`,
            });

            addNotification({
                notification_id: `ws-${Date.now()}`,
                user_id: '',
                type: 'assignment',
                title: 'Complaint Assigned',
                message: `Your complaint has been assigned to ${data.data.officer_name}`,
                data: data.data,
                is_read: false,
                created_at: new Date().toISOString(),
            });
        });

        // Escalation event
        socket.on(WS_EVENTS.ESCALATION, (data: WebSocketMessage) => {
            console.log('Complaint escalated:', data);

            toast.warning('Complaint Escalated', {
                description: `Escalated to ${data.data.to_level}`,
            });

            addNotification({
                notification_id: `ws-${Date.now()}`,
                user_id: '',
                type: 'escalation',
                title: 'Complaint Escalated',
                message: `Your complaint has been escalated to ${data.data.to_level}`,
                data: data.data,
                is_read: false,
                created_at: new Date().toISOString(),
            });
        });

        // Resolution event
        socket.on(WS_EVENTS.RESOLUTION, (data: WebSocketMessage) => {
            console.log('Complaint resolved:', data);

            toast.success('Complaint Resolved!', {
                description: 'Your complaint has been marked as resolved',
            });

            addNotification({
                notification_id: `ws-${Date.now()}`,
                user_id: '',
                type: 'resolution',
                title: 'Complaint Resolved',
                message: 'Your complaint has been successfully resolved',
                data: data.data,
                is_read: false,
                created_at: new Date().toISOString(),
            });
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [isAuthenticated, token, addNotification]);

    const emit = (event: string, data: any) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        emit,
    };
}

// WebSocket Provider Component
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    useWebSocket();
    return <>{children}</>;
}
