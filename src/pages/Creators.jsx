import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, UserCheck, MapPin, Link as LinkIcon, Users, X, Loader } from 'lucide-react';
import UserService from '../core/services/UserService';
import { ShimmerCreatorGrid } from '../components/Shimmer';
import FollowListModal from '../components/FollowListModal';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../core/config/apiConfig';
import '../styles/Creators.css';

const Creators = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user: currentUser } = useAuth();
    const [creators, setCreators] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [following, setFollowing] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers', userId: null, username: '' });

    useEffect(() => {
        fetchCreators();
    }, []);

    // Once creators are loaded AND we know who the current user is,
    // fetch the current user's following list to initialize follow state correctly.
    useEffect(() => {
        const myId = currentUser?.id || currentUser?._id;
        if (!myId || creators.length === 0) return;

        UserService.getFollowing(myId)
            .then(myFollowingList => {
                const followingIds = new Set(myFollowingList.map(u => u._id || u.id));
                setFollowing(prev => {
                    const updated = { ...prev };
                    creators.forEach(creator => {
                        const cId = creator._id || creator.id;
                        updated[cId] = followingIds.has(cId);
                    });
                    return updated;
                });
            })
            .catch(() => { /* leave existing state */ });
    }, [currentUser?._id, creators.length]);

    // Debounced search using API
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                setSearchLoading(true);
                try {
                    const results = await UserService.searchUsers(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error('User search failed:', error);
                    setSearchResults([]);
                } finally {
                    setSearchLoading(false);
                }
            } else {
                setIsSearching(false);
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchCreators = async () => {
        try {
            setLoading(true);
            const users = await UserService.getAllUsers();
            setCreators(users);

            // Initialize follow state from isFollowing field returned by API
            const followMap = {};
            users.forEach(creator => {
                const cId = creator._id || creator.id;
                followMap[cId] = creator.isFollowing === true;
            });
            setFollowing(followMap);
        } catch (error) {
            console.error('Failed to fetch creators:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (creatorId, e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/signup');
            return;
        }

        const wasFollowing = following[creatorId];
        setFollowing(prev => ({ ...prev, [creatorId]: !prev[creatorId] }));

        const updateFollowerCount = (list) => 
            list.map(creator => {
                const cId = creator._id || creator.id;
                if (cId === creatorId) {
                    const currentFollowers = creator.followers || 0;
                    return { 
                        ...creator, 
                        followers: wasFollowing ? Math.max(0, currentFollowers - 1) : currentFollowers + 1 
                    };
                }
                return creator;
            });

        setCreators(prev => updateFollowerCount(prev));
        if (isSearching) {
            setSearchResults(prev => updateFollowerCount(prev));
        }

        try {
            await UserService.followUser(creatorId);
        } catch (error) {
            console.error('Failed to follow user:', error);
            setFollowing(prev => ({ ...prev, [creatorId]: wasFollowing }));
            
            // Revert follower count on failure
            const revertFollowerCount = (list) => 
                list.map(creator => {
                    const cId = creator._id || creator.id;
                    if (cId === creatorId) {
                        const currentFollowers = creator.followers || 0;
                        return { 
                            ...creator, 
                            followers: wasFollowing ? currentFollowers + 1 : Math.max(0, currentFollowers - 1) 
                        };
                    }
                    return creator;
                });
                
            setCreators(prev => revertFollowerCount(prev));
            if (isSearching) {
                setSearchResults(prev => revertFollowerCount(prev));
            }
        }
    };

    const handleCreatorClick = (creatorId) => {
        navigate(`/user/${creatorId}`);
    };

    const formatCount = (count) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count?.toString() || '0';
    };

    // "Follow Back" is not determinable from the list API (following is a count).
    // This is intentionally left as false; the profile page handles it with an extra API call.
    const creatorFollowsMe = () => false;

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    // Use search results when searching, otherwise show all creators
    const displayedCreators = isSearching ? searchResults : creators;

    return (
        <motion.div
            className="creators-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="creators-header">
                <div className="creators-header-text">
                    <h1 className="creators-title">Discover <span className="accent">Creators</span></h1>
                    <p className="creators-subtitle">Follow your favorite creators and explore their curated collections</p>
                </div>

                <div className="creators-search-container">
                    <div className="creators-search">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search creators by name, username or interest..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="clear-search-btn"
                                onClick={() => setSearchQuery('')}
                            >
                                <X size={16} />
                            </button>
                        )}
                        {searchLoading && <Loader className="search-spinner" size={18} />}
                    </div>
                </div>
            </div>

            <div className="creators-content">
                {isSearching && (
                    <h2 className="search-results-title">
                        {searchLoading ? 'Searching...' : `Search Results (${searchResults.length})`}
                    </h2>
                )}

                {loading || searchLoading ? (
                    <ShimmerCreatorGrid count={6} />
                ) : displayedCreators.length > 0 ? (
                    <div className="creators-grid landscape">
                        {displayedCreators.map((creator) => (
                            <motion.div
                                key={creator._id || creator.id}
                                className="creator-card landscape"
                                onClick={() => handleCreatorClick(creator._id || creator.id)}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="creator-card-left">
                                    <div className="creator-avatar-wrap" style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                                        {getImageUrl(creator.profileImageUrl) ? (
                                            <img
                                                src={getImageUrl(creator.profileImageUrl)}
                                                alt={creator.fullName || creator.username}
                                                className="creator-avatar"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="creator-avatar-placeholder"
                                            style={{
                                                display: getImageUrl(creator.profileImageUrl) ? 'none' : 'flex',
                                                width: '100%',
                                                height: '100%',
                                                fontSize: '24px'
                                            }}
                                        >
                                            {(creator.fullName || creator.username || '?')[0].toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="creator-info">
                                        <h3 className="creator-name">{creator.fullName || creator.username}</h3>
                                        <span className="creator-username">@{creator.username}</span>
                                        {creator.bio && (
                                            <p className="creator-bio">{creator.bio}</p>
                                        )}
                                        <div className="creator-meta">
                                            {creator.location && (
                                                <span className="meta-item">
                                                    <MapPin size={12} />
                                                    {creator.location}
                                                </span>
                                            )}
                                            {creator.link && (
                                                <a
                                                    href={creator.link.startsWith('http') ? creator.link : `https://${creator.link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="meta-item link"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <LinkIcon size={12} />
                                                    {creator.link.replace(/^https?:\/\//, '').split('/')[0]}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="creator-card-right">
                                    <div className="creator-stats">
                                        <div 
                                            className="stat clickable"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFollowModal({ 
                                                    isOpen: true, 
                                                    type: 'followers', 
                                                    userId: creator._id || creator.id,
                                                    username: creator.username
                                                });
                                            }}
                                        >
                                            <span className="stat-value">{formatCount(creator.followers || 0)}</span>
                                            <span className="stat-label">Followers</span>
                                        </div>
                                        <div 
                                            className="stat clickable"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFollowModal({ 
                                                    isOpen: true, 
                                                    type: 'following', 
                                                    userId: creator._id || creator.id,
                                                    username: creator.username
                                                });
                                            }}
                                        >
                                            <span className="stat-value">{formatCount(creator.following || 0)}</span>
                                            <span className="stat-label">Following</span>
                                        </div>
                                    </div>

                                    <button
                                        className={`creator-follow-btn ${following[creator._id || creator.id] ? 'following' : ''}`}
                                        onClick={(e) => handleFollow(creator._id || creator.id, e)}
                                    >
                                        {following[creator._id || creator.id] ? (
                                            <>
                                                <UserCheck size={16} />
                                                Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={16} />
                                                {creatorFollowsMe(creator) ? 'Follow Back' : 'Follow'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="no-creators">
                        <Users size={48} strokeWidth={1.5} />
                        <h3>No creators found</h3>
                        <p>{searchQuery ? `No creators matching "${searchQuery}"` : 'Be the first to join our creator community!'}</p>
                    </div>
                )}
            </div>

            <FollowListModal
                isOpen={followModal.isOpen}
                onClose={() => setFollowModal({ ...followModal, isOpen: false })}
                userId={followModal.userId}
                type={followModal.type}
                username={followModal.username}
            />
        </motion.div>
    );
};

export default Creators;
