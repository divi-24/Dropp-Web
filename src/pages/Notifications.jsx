import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, UserPlus, Bell as BellIcon, Check, Package, BookOpen, ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import '../styles/Notifications.css';

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getNotificationMessage = (notification) => {
    const username = notification.entitySnapshot?.username;
    const entityName = notification.entitySnapshot?.name || notification.entitySnapshot?.title;
    switch (notification.type) {
        case 'follow':
            return `${username || 'Someone'} started following you`;
        case 'product_like':
            return entityName ? `${username} liked your product ${entityName}` : 'Someone liked your product';
        case 'collection_like':
            return entityName ? `${username} liked your collection ${entityName}` : 'Someone liked your collection';
        case 'invite_collection':
            return entityName
                ? `${username || 'Someone'} invited you to their collection ${entityName}`
                : `${username || 'Someone'} invited you to a collection`;
        default:
            return 'New notification';
    }
};

const getTypeConfig = (type) => {
    switch (type) {
        case 'follow':
            return {
                itemClass: 'notif--follow',
                badgeClass: 'notif-badge--follow',
                badgeIcon: <UserPlus size={11} strokeWidth={2.5} />,
                label: 'Follow',
                labelClass: 'notif-label--follow',
                entityIcon: null,
            };
        case 'product_like':
            return {
                itemClass: 'notif--like',
                badgeClass: 'notif-badge--like',
                badgeIcon: <Heart size={11} fill="currentColor" strokeWidth={0} />,
                label: 'Product',
                labelClass: 'notif-label--like',
                entityIcon: <Package size={19} strokeWidth={1.6} />,
            };
        case 'collection_like':
            return {
                itemClass: 'notif--like',
                badgeClass: 'notif-badge--like',
                badgeIcon: <Heart size={11} fill="currentColor" strokeWidth={0} />,
                label: 'Collection',
                labelClass: 'notif-label--like',
                entityIcon: <BookOpen size={19} strokeWidth={1.6} />,
            };
        case 'invite_collection':
            return {
                itemClass: 'notif--invite',
                badgeClass: 'notif-badge--invite',
                badgeIcon: <Mail size={11} strokeWidth={2.5} />,
                label: 'Invite',
                labelClass: 'notif-label--invite',
                entityIcon: <BookOpen size={19} strokeWidth={1.6} />,
            };
        default:
            return {
                itemClass: '',
                badgeClass: '',
                badgeIcon: <BellIcon size={11} />,
                label: '',
                labelClass: '',
                entityIcon: null,
            };
    }
};

const getNavigationPath = (notification) => {
    switch (notification.type) {
        case 'follow':
            return notification.entity ? `/user/${notification.entity}` : null;
        case 'product_like':
            return notification.entity ? `/product/${notification.entity}` : null;
        case 'collection_like':
            return notification.entity ? `/c/${notification.entity}` : null;
        case 'invite_collection':
            return notification.entitySnapshot?.id ? `/c/${notification.entitySnapshot.id}` : null;
        default:
            return null;
    }
};

// ─── Notification Item ────────────────────────────────────────────────────────

const NotificationItem = ({ notification, index }) => {
    const navigate = useNavigate();
    const isFollow = notification.type === 'follow';

    const [imgError, setImgError] = useState(false);

    const config = getTypeConfig(notification.type);
    const path = getNavigationPath(notification);

    const senderUsername = notification.entitySnapshot?.username;
    const entityName = notification.entitySnapshot?.name || notification.entitySnapshot?.title;
    const profileImageUrl = notification.entitySnapshot?.profileImageUrl;
    const showProfileImage = profileImageUrl && !imgError;

    const avatarLetter = senderUsername?.[0]?.toUpperCase()
        || entityName?.[0]?.toUpperCase()
        || '?';

    const line1 = (() => {
        switch (notification.type) {
            case 'follow':
                return (
                    <><span className="notif-username">@{senderUsername || 'Someone'}</span> started following you</>
                );
            case 'product_like':
            case 'collection_like': {
                const kind = notification.type === 'product_like' ? 'product' : 'collection';
                const nameChip = entityName
                    ? <span className="notif-entity-ref">{entityName}</span>
                    : null;
                if (senderUsername && nameChip) {
                    return <><span className="notif-username">@{senderUsername}</span> liked your {kind} {nameChip}</>;
                }
                if (senderUsername) {
                    return <><span className="notif-username">@{senderUsername}</span> liked your {kind}</>;
                }
                if (nameChip) {
                    return <>Your {kind} {nameChip} received a like</>;
                }
                return <>Your {kind} received a like</>;
            }
            case 'invite_collection': {
                const collectionName = entityName
                    ? <span className="notif-entity-ref">{entityName}</span>
                    : 'a collection';
                return (
                    <><span className="notif-username">@{senderUsername || 'Someone'}</span> invited you to {collectionName}</>
                );
            }
            default:
                return <>New notification</>;
        }
    })();

    const handleClick = () => { if (path) navigate(path); };

    return (
        <motion.div
            className={`notification-item ${config.itemClass} ${!notification.hasRead ? 'unread' : ''} ${path ? 'clickable' : ''}`}
            onClick={handleClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            whileHover={path ? { x: 3 } : {}}
        >
            {/* ── Avatar + badge ── */}
            <div className="notif-avatar-wrap">
                <div className={`notif-avatar ${config.itemClass}-avatar`}>
                    {showProfileImage ? (
                        <img
                            src={profileImageUrl}
                            alt={senderUsername || ''}
                            className="notif-avatar-img"
                            onError={() => setImgError(true)}
                        />
                    ) : config.entityIcon && !isFollow ? (
                        <span className="notif-avatar-icon">{config.entityIcon}</span>
                    ) : (
                        avatarLetter
                    )}
                </div>
                <div className={`notif-badge ${config.badgeClass}`}>
                    {config.badgeIcon}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="notif-body">
                <div className="notif-top">
                    <p className="notif-text">{line1}</p>
                    {config.label && (
                        <span className={`notif-label ${config.labelClass}`}>{config.label}</span>
                    )}
                </div>
                <span className="notif-time">{formatTime(notification.createdAt)}</span>
            </div>

            {/* ── Right action ── */}
            {path && (
                <div className="notif-action" onClick={e => e.stopPropagation()}>
                    <div className="notif-arrow" onClick={handleClick}>
                        <ArrowRight size={15} strokeWidth={2} />
                    </div>
                </div>
            )}

            {!notification.hasRead && <span className="notif-dot" />}
        </motion.div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Notifications = () => {
    const [filter, setFilter] = useState('all');
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const hasMarkedRef = useRef(false);


    // Auto-mark all as read 2 seconds after page opens
    useEffect(() => {
        if (hasMarkedRef.current) return;
        if (notifications.length === 0) return;
        if (unreadCount === 0) return;
        hasMarkedRef.current = true;
        const timer = setTimeout(() => { markAllAsRead(); }, 2000);
        return () => clearTimeout(timer);
    }, [notifications, unreadCount, markAllAsRead]);

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.hasRead);

    return (
        <motion.div
            className="notifications-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="notifications-container">
                <div className="notifications-header">
                    <div>
                        <h1 className="notifications-title">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="notifications-subtitle">{unreadCount} unread</p>
                        )}
                    </div>
                    <div className="notifications-filters">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >All</button>
                        <button
                            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                            onClick={() => setFilter('unread')}
                        >
                            Unread {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                    </div>
                </div>

                <div className="notifications-list">
                    <AnimatePresence>
                        {filteredNotifications.length === 0 ? (
                            <motion.div
                                className="empty-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="empty-state-icon">
                                    <BellIcon size={28} strokeWidth={1.5} />
                                </div>
                                <h2>All caught up</h2>
                                <p>New activity will show up here</p>
                            </motion.div>
                        ) : (
                            filteredNotifications.map((notification, index) => (
                                <NotificationItem
                                    key={notification._id || notification.id}
                                    notification={notification}
                                    index={index}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {unreadCount > 0 && (
                    <div className="notifications-actions">
                        <button className="action-btn" onClick={markAllAsRead}>
                            <Check size={14} strokeWidth={2.5} />
                            Mark all as read
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Notifications;
