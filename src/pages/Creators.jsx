import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, UserCheck, MapPin, Link as LinkIcon, Users, X, Loader } from 'lucide-react';
import UserService from '../core/services/UserService';
import { ShimmerCreatorGrid } from '../components/Shimmer';
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

    useEffect(() => {
        fetchCreators();
    }, []);

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

            // Initialize follow state from data
            const myId = currentUser?.id || currentUser?._id;
            if (myId) {
                const followMap = {};
                users.forEach(creator => {
                    const cId = creator._id || creator.id;
                    const followers = creator.followers || [];
                    followMap[cId] = followers.some(f => (f?._id || f) === myId);
                });
                setFollowing(followMap);
            }
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

        try {
            await UserService.followUser(creatorId);
        } catch (error) {
            console.error('Failed to follow user:', error);
            setFollowing(prev => ({ ...prev, [creatorId]: wasFollowing }));
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

    const creatorFollowsMe = (creator) => {
        const myId = currentUser?.id || currentUser?._id;
        if (!myId) return false;
        const theirFollowing = creator.following || [];
        return theirFollowing.some(f => (f?._id || f) === myId);
    };

    const getImageUrl = (url) => {
        if (!url) return API_CONFIG.BASE_URL + '/images/default.webp';
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
                                    <img
                                        src={getImageUrl(creator.profileImageUrl)}
                                        alt={creator.fullName || creator.username}
                                        className="creator-avatar"
                                        onError={(e) => { e.target.src = API_CONFIG.BASE_URL + '/images/default.webp'; }}
                                    />
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
                                        <div className="stat">
                                            <span className="stat-value">{formatCount(creator.followers?.length || creator.followers || 0)}</span>
                                            <span className="stat-label">Followers</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{formatCount(creator.following?.length || creator.following || 0)}</span>
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
        </motion.div>
    );
};

export default Creators;
