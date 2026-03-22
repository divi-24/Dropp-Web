import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    User, MessageCircle, MoreHorizontal, MapPin,
    Link as LinkIcon, ArrowLeft, Share2, Ban, Flag,
    Settings, BarChart3,
} from 'lucide-react';
import FollowListModal from './FollowListModal';
import '../styles/Profile.css';

const ProfileHeader = ({
    user,
    isOwnProfile,
    onFollow,
    onMessage,
    onEditProfile,
    onShareProfile,
    onBlock,
    onReport,
    onAvatarClick
}) => {
    const [showOptions, setShowOptions] = useState(false);
    const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers' });
    const navigate = useNavigate();
    const { avatar, fullName, username, bio, location, link, pronoun, stats, isFollowing, followsMe } = user;
    const userId = user._id || user.id;

    // Close menu on outside click
    useEffect(() => {
        if (!showOptions) return;
        const handleClickOutside = () => setShowOptions(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showOptions]);

    const openFollowModal = (type) => {
        setFollowModal({ isOpen: true, type });
    };

    return (
        <div className={`profile-header${isOwnProfile ? ' profile-header--own' : ''}`}>
            {isOwnProfile && (
                <>
                    <Link to="/settings" className="profile-corner-btn profile-corner-btn--left" aria-label="Settings" title="Settings">
                        <Settings size={22} strokeWidth={2} />
                    </Link>
                    <Link to="/analytics" className="profile-corner-btn profile-corner-btn--right" aria-label="Analytics" title="Analytics">
                        <BarChart3 size={22} strokeWidth={2} />
                    </Link>
                </>
            )}

            {/* Back navigation for visitor view */}
            {!isOwnProfile && (
                <button className="profile-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
            )}

            <div className="profile-header-top">
                <div className="profile-avatar-section">
                    <div
                        className="profile-avatar"
                        onClick={onAvatarClick}
                        style={onAvatarClick ? { cursor: 'pointer' } : {}}
                    >
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={fullName}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="profile-avatar-placeholder"
                            style={{
                                display: avatar ? 'none' : 'flex',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <User size={48} />
                        </div>
                    </div>
                </div>

                <div className="profile-info-section">
                    <div className="profile-username-row">
                        <h1 className="profile-username">{username}</h1>

                        <div className="profile-actions">
                            {!isOwnProfile && (
                                <>
                                    <button
                                        className={`profile-follow-btn ${isFollowing ? 'following' : ''}`}
                                        onClick={() => { if (onFollow) onFollow(); }}
                                    >
                                        {isFollowing ? 'Following' : (followsMe ? 'Follow Back' : 'Follow')}
                                    </button>
                                    <button
                                        className="profile-message-btn"
                                        onClick={() => { if (onMessage) onMessage(); }}
                                    >
                                        <MessageCircle size={18} />
                                        Message
                                    </button>
                                </>
                            )}

                            {isOwnProfile && (
                                <button
                                    className="profile-edit-btn"
                                    onClick={onEditProfile}
                                >
                                    Edit Profile
                                </button>
                            )}

                            {!isOwnProfile && (
                                <div className="profile-menu-container">
                                    <button
                                        className="profile-options-btn"
                                        onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {showOptions && (
                                            <motion.div
                                                className="profile-options-menu"
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onShareProfile) onShareProfile();
                                                    setShowOptions(false);
                                                }}>
                                                    <Share2 size={16} />
                                                    Share Profile
                                                </button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onBlock) onBlock();
                                                    setShowOptions(false);
                                                }}>
                                                    <Ban size={16} />
                                                    Block
                                                </button>
                                                <button className="danger" onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onReport) onReport();
                                                    setShowOptions(false);
                                                }}>
                                                    <Flag size={16} />
                                                    Report
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div className="profile-stat">
                            <span className="stat-value">{stats?.collections?.toLocaleString() || '0'}</span>
                            <span className="stat-label">Collections</span>
                        </div>
                        <div 
                            className="profile-stat clickable" 
                            onClick={() => openFollowModal('followers')}
                        >
                            <span className="stat-value">{stats?.followers?.toLocaleString() || '0'}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div 
                            className="profile-stat clickable" 
                            onClick={() => openFollowModal('following')}
                        >
                            <span className="stat-value">{stats?.following?.toLocaleString() || '0'}</span>
                            <span className="stat-label">Following</span>
                        </div>
                    </div>

                    <div className="profile-bio">
                        {fullName && <p className="profile-fullname">{fullName}</p>}
                        {pronoun && <p className="profile-pronoun" style={{ fontSize: '0.9em', color: '#888', marginTop: '4px' }}>{pronoun}</p>}
                        {bio && <p className="profile-bio-text">{bio}</p>}
                        {location && (
                            <p className="profile-location">
                                <MapPin size={14} />
                                {location}
                            </p>
                        )}
                        {link && (
                            <a
                                href={link.startsWith('http') ? link : `https://${link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="profile-website"
                            >
                                <LinkIcon size={14} />
                                {link.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <FollowListModal
                isOpen={followModal.isOpen}
                onClose={() => setFollowModal({ ...followModal, isOpen: false })}
                userId={userId}
                type={followModal.type}
                username={username}
            />
        </div>
    );
};

export default ProfileHeader;
