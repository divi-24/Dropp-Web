import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, TrendingUp, Users, Package, Star, Sparkles, ArrowUpRight, Grid } from 'lucide-react';
import ProductMasonryGrid from '../components/ProductMasonryGrid';
import { ShimmerCollectionGrid } from '../components/Shimmer';
import FloatingActionButton from '../components/FloatingActionButton';
import ProductService from '../core/services/ProductService';
import { useAuth } from '../contexts/AuthContext';
import { categories } from '../data/mockData';
import '../styles/Home.css';
import '../styles/Profile.css';

/* ─── Animated Counter ─── */
const Counter = ({ end, duration = 1.5, suffix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = end / (duration * 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [end, duration]);
    return <>{count.toLocaleString()}{suffix}</>;
};

/* ─── Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, suffix, color, delay }) => (
    <motion.div
        className="stat-card"
        style={{ '--card-accent': color }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        <div className="stat-card-icon">
            <Icon size={20} />
        </div>
        <div className="stat-card-body">
            <span className="stat-card-value">
                <Counter end={value} suffix={suffix} />
            </span>
            <span className="stat-card-label">{label}</span>
        </div>
        <div className="stat-card-glow" />
    </motion.div>
);

/* ─── Shimmer / Skeleton Card ─── */
const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img" />
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
    </div>
);

const Home = () => {
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const firstName = user?.fullName?.split(' ')[0] || user?.username || 'Creator';

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
            {/* ── Welcome Banner ── */}
            <motion.div
                className="welcome-banner"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
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

            {/* ── Stats Row ── */}
            <div className="stats-row">
                <StatCard icon={Package}   label="Total Products"   value={products.length} suffix=""   color="#F0057A" delay={0.05} />
                <StatCard icon={TrendingUp} label="Trending Today"   value={Math.max(1, Math.floor(products.length * 0.3))} suffix=""   color="#7C3AED" delay={0.1} />
                <StatCard icon={Users}     label="Creators Live"    value={142}  suffix="+"   color="#4F46E5" delay={0.15} />
                <StatCard icon={Star}      label="Avg. Rating"      value={4.8}  suffix="★"   color="#F59E0B" delay={0.2} />
            </div>

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

            {/* ── Section Header ── */}
            {!isSearching && (
                <div className="section-header">
                    <div className="section-header-left">
                        <span className="section-tag">Feed</span>
                        <h2 className="section-title">Discover <span className="gradient-text">Products</span></h2>
                    </div>
                    <button className="section-view-all">
                        View All <ArrowUpRight size={14} />
                    </button>
                </div>
            )}

            {isSearching && (
                <div className="search-results-header">
                    <span className="search-results-label">
                        {searchLoading ? 'Searching...' : `${searchResults.length} results for "${searchQuery}"`}
                    </span>
                </div>
            )}

            {/* ── Product Grid ── */}
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