import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UserService from '../core/services/UserService';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../core/config/apiConfig';
import '../styles/FollowListModal.css';

const FollowListModal = ({ isOpen, onClose, userId, type, username }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && userId) {
            fetchUsers();
        }
    }, [isOpen, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            let data = [];
            if (type === 'followers') {
                data = await UserService.getFollowers(userId);
            } else {
                data = await UserService.getFollowing(userId);
            }
            setUsers(data || []);
        } catch (err) {
            console.error(`Failed to fetch ${type}:`, err);
            setError(`Failed to load ${type}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (targetUserId) => {
        onClose();
        navigate(`/user/${targetUserId}`);
    };

    if (!isOpen) return null;

    const title = type === 'followers' ? 'Followers' : 'Following';

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="follow-list-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div className="header-spacer"></div>
                        <h2>{title}</h2>
                        <button
                            className="modal-close-btn"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {loading ? (
                            <div className="modal-loading">
                                <Loader className="spinner" size={32} />
                            </div>
                        ) : error ? (
                            <div className="modal-error">{error}</div>
                        ) : users.length === 0 ? (
                            <div className="modal-empty">
                                <div className="empty-icon">
                                    <User size={48} />
                                </div>
                                <p>No {type} yet</p>
                            </div>
                        ) : (
                            <div className="user-list">
                                {users.map((user) => (
                                    <div key={user._id || user.id} className="user-item">
                                        <div 
                                            className="user-info"
                                            onClick={() => handleUserClick(user._id || user.id)}
                                        >
                                            <div className="user-avatar">
                                                {user.profileImageUrl ? (
                                                    <img 
                                                        src={user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `${API_CONFIG.BASE_URL}${user.profileImageUrl}`} 
                                                        alt={user.fullName} 
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="avatar-placeholder" style={{ display: user.profileImageUrl ? 'none' : 'flex' }}>
                                                    {user.fullName?.charAt(0) || user.username?.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="user-details">
                                                <span className="username">{user.username}</span>
                                                <span className="full-name">{user.fullName}</span>
                                            </div>
                                        </div>
                                        
                                        {currentUser && (currentUser.id !== (user._id || user.id) && currentUser._id !== (user._id || user.id)) && (
                                            <div className="user-action">
                                                <button 
                                                    className="view-profile-btn"
                                                    onClick={() => handleUserClick(user._id || user.id)}
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FollowListModal;
