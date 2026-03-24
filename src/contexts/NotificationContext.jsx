import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import UserService from '../core/services/UserService';
import Snackbar from '../components/Snackbar';
import { useNavigate } from 'react-router-dom';
import { getNotificationMessage } from '../pages/Notifications';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, token, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotification, setRecentNotification] = useState(null);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await UserService.getNotifications();
            setNotifications(data);
            const unread = data.filter(n => !n.hasRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isAuthenticated && token) {
            const socketUrl = import.meta.env.VITE_API_BASE_URL || 'https://dropp-0oxl.onrender.com';
            const socketInstance = io(socketUrl, {
                auth: {
                    token: token,
                },
            });

            socketInstance.on('connect', () => {
                console.log('Connected to socket:', socketInstance.id);
            });

            socketInstance.on('new_notification', (notification) => {
                console.log('Notification received:', notification);
                
                if (notification.receiver === user?._id || notification.receiver === user?.id) {
                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    setRecentNotification(notification);
                    setShowSnackbar(true);
                }
            });

            socketInstance.on('connect_error', (err) => {
                console.log('Socket connection failed:', err.message);
            });

            return () => {
                socketInstance.disconnect();
            };
        }
    }, [isAuthenticated, token]);

    const markAsRead = useCallback(async (id) => {
        setNotifications(prev => prev.map(n =>
            (n._id === id || n.id === id) ? { ...n, hasRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        try {
            await UserService.markNotificationRead(id);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, hasRead: true })));
        setUnreadCount(0);
        try {
            await UserService.markAllNotificationsRead();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }, []);

    const value = {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        recentNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <Snackbar
                isVisible={showSnackbar}
                message={recentNotification ? getNotificationMessage(recentNotification) : ''}
                type="info"
                onClose={() => setShowSnackbar(false)}
                action={{
                    label: 'View',
                    onClick: () => {
                        navigate('/notifications');
                        setShowSnackbar(false);
                    }
                }}
                position="top"
            />
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
