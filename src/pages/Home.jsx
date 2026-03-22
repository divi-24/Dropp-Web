import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, Sparkles, Grid, Bell, User } from 'lucide-react';
import ProductMasonryGrid from '../components/ProductMasonryGrid';
import HomeAnalyticsMarquee from '../components/HomeAnalyticsMarquee';
import { ShimmerCollectionGrid } from '../components/Shimmer';
import FloatingActionButton from '../components/FloatingActionButton';
import ProductService from '../core/services/ProductService';
import UserService from '../core/services/UserService';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { API_CONFIG } from '../core/config/apiConfig';
import { categories } from '../data/mockData';
import '../styles/Home.css';
import '../styles/Profile.css';

const Home = () => {
    const { user } = useAuth();
    const { unreadCount } = useNotifications();
    const [activeCategory, setActiveCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const firstName = user?.fullName?.split(' ')[0] || user?.username || 'Creator';

    const avatarUrl = (() => {
        const url = user?.profileImageUrl;
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    })();

    useEffect(() => {
        if (!isSearching) fetchProducts();
    }, [isSearching]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (searchQuery.trim()) handleSearch(searchQuery);
            else { setIsSearching(false); setSearchResults([]); }
        }, 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setAnalyticsLoading(true);
                const res = await UserService.getAnalytics();
                if (!cancelled) setAnalytics(res?.analytics || null);
            } catch {
                if (!cancelled) setAnalytics(null);
            } finally {
                if (!cancelled) setAnalyticsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleSearch = async (query) => {
        if (!query.trim()) return;
        try {
            setSearchLoading(true);
            setIsSearching(true);
            const results = await ProductService.searchProducts(query);
            setSearchResults(results);
        } catch { /* noop */ }
        finally { setSearchLoading(false); }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await ProductService.getExploreProducts();
            setProducts(data);
        } catch { /* noop */ }
        finally { setLoading(false); }
    };

    const displayedItems = isSearching ? searchResults : products;

    return (
        <motion.div
            className="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="home-mobile-top-bar">
                <div className="home-mobile-top-spacer" aria-hidden="true" />
                <Link to="/" className="home-mobile-brand home-mobile-brand--wordmark" aria-label="Dropp home">
                    <span className="home-mobile-dropp-wordmark" aria-hidden="true">
                        {'DROPP'.split('').map((char, i) => (
                            <span key={i} className="home-mobile-dropp-char">{char}</span>
                        ))}
                    </span>
                    <span className="home-mobile-dropp-tagline">curate · share · earn</span>
                </Link>
                <div className="home-mobile-top-actions">
                    <Link to="/notifications" className="home-mobile-notify" aria-label="Notifications">
                        <span className="home-mobile-notify-inner">
                            <Bell size={20} strokeWidth={2} />
                        </span>
                        {unreadCount > 0 && (
                            <span className="home-mobile-notify-badge">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* ── Welcome Banner ── */}
            <motion.div
                className="welcome-banner"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="welcome-banner-main">
                    {avatarUrl ? (
                        <img className="welcome-avatar" src={avatarUrl} alt="" />
                    ) : (
                        <div className="welcome-avatar-placeholder" aria-hidden>
                            <User size={32} strokeWidth={1.5} />
                        </div>
                    )}
                    <div className="welcome-banner-left">
                        <div className="welcome-badge">
                            <Sparkles size={12} />
                            <span>Creator Dashboard</span>
                        </div>
                        <h1 className="welcome-title">
                            Hey, <span className="welcome-name">{firstName}</span> 👋
                        </h1>
                        <p className="welcome-sub">Your curated drops are waiting to go viral.</p>
                    </div>
                </div>
                <div className="welcome-banner-right">
                    <motion.div
                        className="aurora-orb orb-1"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="aurora-orb orb-2"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />
                    <motion.div
                        className="aurora-orb orb-3"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    />
                </div>
            </motion.div>

            <HomeAnalyticsMarquee
                analytics={analytics}
                loading={analyticsLoading}
                feedProductCount={products.length}
            />

            {/* ── Search + Filters ── */}
            <div className="home-controls">
                <div className="home-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products, creators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <AnimatePresence>
                        {searchQuery && (
                            <motion.button
                                className="clear-search-btn"
                                onClick={() => setSearchQuery('')}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <X size={14} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                    {searchLoading && <Loader className="search-spinner" size={16} />}
                </div>

                {!isSearching && (
                    <div className="category-filters">
                        {categories.map((cat, i) => (
                            <motion.button
                                key={cat}
                                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03, duration: 0.3 }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {cat}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {isSearching && (
                <div className="search-results-header">
                    <span className="search-results-label">
                        {searchLoading ? 'Searching...' : `${searchResults.length} results for "${searchQuery}"`}
                    </span>
                </div>
            )}

            <div className="home-content">
                {loading || (isSearching && searchLoading) ? (
                    <ShimmerCollectionGrid count={8} />
                ) : displayedItems.length > 0 ? (
                    <ProductMasonryGrid products={displayedItems} />
                ) : (
                    <motion.div
                        className="no-results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="no-results-icon"><Grid size={32} /></div>
                        <p className="no-results-title">No products yet</p>
                        <p className="no-results-sub">
                            {isSearching ? `No results for "${searchQuery}"` : 'Be the first to drop something amazing.'}
                        </p>
                    </motion.div>
                )}
            </div>

            <FloatingActionButton />
        </motion.div>
    );
};

export default Home;
