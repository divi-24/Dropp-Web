import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, UserCheck, MapPin, Link as LinkIcon, Users, X, Loader, Sparkles } from 'lucide-react';
import UserService from '../core/services/UserService';
import { ShimmerCreatorGrid } from '../components/Shimmer';
import FollowListModal from '../components/FollowListModal';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../core/config/apiConfig';
import '../styles/Creators.css';

/* gradient palette for avatar fallbacks */
const GRADIENTS = [
    'linear-gradient(135deg, #F0057A, #FF80C0)',
    'linear-gradient(135deg, #4F46E5, #818CF8)',
    'linear-gradient(135deg, #7C3AED, #C4B5FD)',
    'linear-gradient(135deg, #F59E0B, #FDE68A)',
    'linear-gradient(135deg, #10B981, #6EE7B7)',
    'linear-gradient(135deg, #EF4444, #FCA5A5)',
    'linear-gradient(135deg, #0EA5E9, #7DD3FC)',
    'linear-gradient(135deg, #EC4899, #F9A8D4)',
];

/* banner color to match */
const BANNER_COLORS = [
    'linear-gradient(135deg, #3b0a2a, #6b1045)',
    'linear-gradient(135deg, #1e1b4b, #3730a3)',
    'linear-gradient(135deg, #2e1065, #5b21b6)',
    'linear-gradient(135deg, #451a03, #92400e)',
    'linear-gradient(135deg, #022c22, #065f46)',
    'linear-gradient(135deg, #450a0a, #991b1b)',
    'linear-gradient(135deg, #082f49, #0369a1)',
    'linear-gradient(135deg, #500724, #9d174d)',
];

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

    useEffect(() => { fetchCreators(); }, []);

    useEffect(() => {
        const myId = currentUser?.id || currentUser?._id;
        if (!myId || creators.length === 0) return;
        UserService.getFollowing(myId)
            .then(list => {
                const ids = new Set(list.map(u => u._id || u.id));
                setFollowing(prev => {
                    const upd = { ...prev };
                    creators.forEach(c => { const id = c._id || c.id; upd[id] = ids.has(id); });
                    return upd;
                });
            })
            .catch(() => { });
    }, [currentUser?._id, creators.length]);

    useEffect(() => {
        const t = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true); setSearchLoading(true);
                try { setSearchResults(await UserService.searchUsers(searchQuery)); }
                catch { setSearchResults([]); }
                finally { setSearchLoading(false); }
            } else { setIsSearching(false); setSearchResults([]); }
        }, 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchCreators = async () => {
        try {
            setLoading(true);
            const users = await UserService.getAllUsers();
            setCreators(users);
            const map = {};
            users.forEach(c => { map[c._id || c.id] = c.isFollowing === true; });
            setFollowing(map);
        } catch { /* noop */ }
        finally { setLoading(false); }
    };

    const handleFollow = async (creatorId, e) => {
        e.stopPropagation();
        if (!isAuthenticated) { navigate('/signup'); return; }
        const was = following[creatorId];
        setFollowing(prev => ({ ...prev, [creatorId]: !prev[creatorId] }));
        const upd = list => list.map(c => {
            const cId = c._id || c.id;
            if (cId !== creatorId) return c;
            return { ...c, followers: was ? Math.max(0, (c.followers || 0) - 1) : (c.followers || 0) + 1 };
        });
        setCreators(prev => upd(prev));
        if (isSearching) setSearchResults(prev => upd(prev));
        try { await UserService.followUser(creatorId); }
        catch {
            setFollowing(prev => ({ ...prev, [creatorId]: was }));
            const rev = list => list.map(c => {
                const cId = c._id || c.id;
                if (cId !== creatorId) return c;
                return { ...c, followers: was ? (c.followers || 0) + 1 : Math.max(0, (c.followers || 0) - 1) };
            });
            setCreators(prev => rev(prev));
            if (isSearching) setSearchResults(prev => rev(prev));
        }
    };

    const formatCount = n => {
        if (!n) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    const getImageUrl = url => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const getGradient = (idx) => GRADIENTS[idx % GRADIENTS.length];
    const getBanner = (idx) => BANNER_COLORS[idx % BANNER_COLORS.length];

    const displayed = isSearching ? searchResults : creators;

    const stagger = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
    };
    const cardVariants = {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
        <motion.div
            className="creators-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* ── Hero Banner ── */}
            <motion.div
                className="creators-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="creators-hero-inner">
                    <div>
                        <div className="creators-hero-label">
                            <Sparkles size={11} /> Creators
                        </div>
                        <h1 className="creators-hero-title">
                            Discover <span className="accent">creators</span>
                        </h1>
                        <p className="creators-hero-subtitle">
                            Follow curators you love and explore their handpicked collections.
                        </p>
                    </div>

                    <div className="creators-hero-stats">
                        <div className="creators-hero-stat">
                            <span className="creators-hero-stat-val">{formatCount(creators.length)}+</span>
                            <span className="creators-hero-stat-lbl">Creators</span>
                        </div>
                        <div className="creators-hero-stat">
                            <span className="creators-hero-stat-val">
                                {formatCount(creators.reduce((a, c) => a + (c.followers || 0), 0))}
                            </span>
                            <span className="creators-hero-stat-lbl">Followers</span>
                        </div>
                        <div className="creators-hero-stat">
                            <span className="creators-hero-stat-val">
                                {Object.values(following).filter(Boolean).length}
                            </span>
                            <span className="creators-hero-stat-lbl">Following</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Controls ── */}
            <div className="creators-controls">
                <div className="creators-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search creators by name, username or interest..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <AnimatePresence>
                        {searchQuery && (
                            <motion.button
                                className="clear-search-btn"
                                onClick={() => setSearchQuery('')}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                            >
                                <X size={13} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                    {searchLoading && <Loader className="search-spinner" size={16} />}
                </div>
                {!loading && (
                    <span className="creators-results-count">
                        {isSearching
                            ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
                            : `${creators.length} creator${creators.length !== 1 ? 's' : ''}`}
                    </span>
                )}
            </div>

            {/* ── Grid ── */}
            <div className="creators-content">
                {isSearching && (
                    <p className="search-results-title">
                        {searchLoading ? 'Searching...' : `Results for "${searchQuery}"`}
                    </p>
                )}

                {loading || (isSearching && searchLoading) ? (
                    <ShimmerCreatorGrid count={6} />
                ) : displayed.length > 0 ? (
                    <motion.div
                        className="creators-grid"
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                    >
                        {displayed.map((creator, i) => {
                            const cId = creator._id || creator.id;
                            const avatarUrl = getImageUrl(creator.profileImageUrl);
                            const isFollowing = following[cId];

                            return (
                                <motion.div
                                    key={cId}
                                    className="creator-card-new"
                                    variants={cardVariants}
                                    onClick={() => navigate(`/user/${cId}`)}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    {/* Banner */}
                                    <div
                                        className="creator-card-banner"
                                        style={{ background: getBanner(i) }}
                                    >
                                        {/* Avatar */}
                                        <div className="creator-card-avatar-wrap">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={creator.fullName || creator.username}
                                                    className="creator-card-avatar"
                                                    onError={e => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="creator-card-avatar-placeholder"
                                                style={{
                                                    display: avatarUrl ? 'none' : 'flex',
                                                    background: getGradient(i),
                                                }}
                                            >
                                                {(creator.fullName || creator.username || '?')[0].toUpperCase()}
                                            </div>
                                            <div className="creator-card-verified">✓</div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="creator-card-body">
                                        <div className="creator-card-name-row">
                                            <div>
                                                <div className="creator-card-name">
                                                    {creator.fullName || creator.username}
                                                </div>
                                                <span className="creator-card-handle">@{creator.username}</span>
                                            </div>
                                            <button
                                                className={`creator-follow-btn ${isFollowing ? 'following' : ''}`}
                                                onClick={e => handleFollow(cId, e)}
                                            >
                                                {isFollowing
                                                    ? <><UserCheck size={14} /> Following</>
                                                    : <><UserPlus size={14} /> Follow</>}
                                            </button>
                                        </div>

                                        {creator.bio && (
                                            <p className="creator-card-bio">{creator.bio}</p>
                                        )}

                                        {/* Meta */}
                                        {(creator.location || creator.link) && (
                                            <div className="creator-card-meta">
                                                {creator.location && (
                                                    <span className="meta-item">
                                                        <MapPin size={12} /> {creator.location}
                                                    </span>
                                                )}
                                                {creator.link && (
                                                    <a
                                                        href={creator.link.startsWith('http') ? creator.link : `https://${creator.link}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="meta-item link"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <LinkIcon size={12} />
                                                        {creator.link.replace(/^https?:\/\//, '').split('/')[0]}
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Stats strip */}
                                        <div className="creator-card-stats">
                                            <div
                                                className="creator-stat"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setFollowModal({ isOpen: true, type: 'followers', userId: cId, username: creator.username });
                                                }}
                                            >
                                                <span className="creator-stat-val">{formatCount(creator.followers || 0)}</span>
                                                <span className="creator-stat-lbl">Followers</span>
                                            </div>
                                            <div
                                                className="creator-stat"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setFollowModal({ isOpen: true, type: 'following', userId: cId, username: creator.username });
                                                }}
                                            >
                                                <span className="creator-stat-val">{formatCount(creator.following || 0)}</span>
                                                <span className="creator-stat-lbl">Following</span>
                                            </div>
                                            <div className="creator-stat">
                                                <span className="creator-stat-val">{formatCount(creator.productCount || 0)}</span>
                                                <span className="creator-stat-lbl">Drops</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        className="no-creators"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Users size={48} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)' }} />
                        <h3>No creators found</h3>
                        <p>{searchQuery ? `No creators matching "${searchQuery}"` : 'Be the first to join our creator community!'}</p>
                    </motion.div>
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
