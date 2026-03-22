import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, Boxes, Heart, Eye, Package, TrendingUp, Sparkles, Target, Layers,
} from 'lucide-react';
import UserService from '../core/services/UserService';
import '../styles/Analytics.css';

const StatCard = ({ icon, label, value, delay = 0 }) => (
    <motion.div
        className="analytics-stat-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        <div className="analytics-stat-icon">
            {React.createElement(icon, { size: 20, strokeWidth: 2 })}
        </div>
        <div className="analytics-stat-content">
            <p>{label}</p>
            <h3>{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        </div>
    </motion.div>
);

const BarList = ({ rows, valueKey, labelKey, emptyMessage }) => {
    const maxV = useMemo(
        () => Math.max(...rows.map((r) => Number(r[valueKey]) || 0), 1),
        [rows, valueKey],
    );

    if (!rows.length) {
        return <div className="analytics-empty analytics-empty--inline">{emptyMessage}</div>;
    }

    return (
        <div className="analytics-bars">
            {rows.map((row, i) => {
                const v = Number(row[valueKey]) || 0;
                const pct = (v / maxV) * 100;
                const label = row[labelKey] || '—';
                return (
                    <div key={row.id || `${label}-${i}`} className="analytics-bar-row">
                        <div className="analytics-bar-meta">
                            <span className="analytics-bar-name" title={label}>{label}</span>
                            <span className="analytics-bar-num">{v.toLocaleString()}</span>
                        </div>
                        <div className="analytics-bar-track">
                            <motion.div
                                className="analytics-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{
                                    duration: 0.65,
                                    delay: 0.04 * i,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const EngagementRing = ({ views, likes }) => {
    const v = Number(views) || 0;
    const l = Number(likes) || 0;
    const t = v + l;
    const deg = t > 0 ? (v / t) * 360 : 180;

    return (
        <div className="analytics-ring-wrap">
            <div className="analytics-ring-host">
                <div
                    className="analytics-ring"
                    style={{
                        background: `conic-gradient(
                            var(--color-accent) 0deg ${deg}deg,
                            rgba(124, 58, 237, 0.55) ${deg}deg 360deg
                        )`,
                    }}
                    aria-hidden
                />
                <div className="analytics-ring-center">
                    <TrendingUp size={18} strokeWidth={2} />
                    <span>Mix</span>
                </div>
            </div>
            <ul className="analytics-ring-legend">
                <li><span className="dot dot--accent" /> Views {v.toLocaleString()}</li>
                <li><span className="dot dot--purple" /> Likes {l.toLocaleString()}</li>
            </ul>
        </div>
    );
};

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await UserService.getAnalytics();
                setAnalytics(response?.analytics || null);
            } catch (err) {
                setError(err?.message || 'Failed to load analytics.');
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, []);

    const collectionRows = useMemo(() => analytics?.collections?.data ?? [], [analytics]);
    const productRows = useMemo(() => analytics?.products?.data ?? [], [analytics]);

    const totalViews = analytics?.collections?.total_views || 0;
    const totalLikes = analytics?.products?.likes_count || 0;

    const kpis = useMemo(() => {
        const rows = collectionRows;
        const n = rows.length;
        const avgViews = n ? Math.round(totalViews / n) : 0;
        const collLikes = rows.reduce((s, r) => s + (Number(r.likes) || 0), 0);
        const productsInCollections = rows.reduce(
            (s, r) => s + (Number(r.numberOfProducts) || 0),
            0,
        );
        const top = [...rows].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
        return {
            avgViews,
            collLikes,
            productsInCollections,
            topTitle: top?.title ? String(top.title).slice(0, 28) : null,
            topViews: top?.views ?? 0,
        };
    }, [collectionRows, totalViews]);

    return (
        <motion.div
            className="analytics-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="analytics-hero">
                <div className="analytics-hero-mesh" aria-hidden />
                <div className="analytics-hero-glow" aria-hidden />
                <motion.div
                    className="analytics-hero-inner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.45 }}
                >
                    <span className="analytics-hero-pill">
                        <Sparkles size={14} strokeWidth={2.2} />
                        Creator insights
                    </span>
                    <h1 className="analytics-hero-title">Analytics</h1>
                    <p className="analytics-hero-sub">
                        How your collections and drops perform across Dropp.
                    </p>
                </motion.div>
            </div>

            <div className="analytics-container">
                {loading && <div className="analytics-empty">Loading analytics…</div>}
                {!loading && error && <div className="analytics-error">{error}</div>}

                {!loading && !error && (
                    <>
                        <section className="analytics-summary">
                            <StatCard
                                icon={Boxes}
                                label="Collections"
                                value={analytics?.collections?.total_collections || 0}
                                delay={0}
                            />
                            <StatCard
                                icon={Package}
                                label="Products"
                                value={analytics?.products?.total_products || 0}
                                delay={0.05}
                            />
                            <StatCard
                                icon={Eye}
                                label="Collection views"
                                value={totalViews}
                                delay={0.1}
                            />
                            <StatCard
                                icon={Heart}
                                label="Product likes"
                                value={totalLikes}
                                delay={0.15}
                            />
                        </section>

                        <section className="analytics-kpi-strip" aria-label="Key metrics">
                            <motion.div
                                className="analytics-kpi-tile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Target size={18} strokeWidth={2} />
                                <div>
                                    <span className="analytics-kpi-label">Avg views / collection</span>
                                    <strong className="analytics-kpi-value">{kpis.avgViews.toLocaleString()}</strong>
                                </div>
                            </motion.div>
                            <motion.div
                                className="analytics-kpi-tile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.26 }}
                            >
                                <Layers size={18} strokeWidth={2} />
                                <div>
                                    <span className="analytics-kpi-label">Items across collections</span>
                                    <strong className="analytics-kpi-value">{kpis.productsInCollections.toLocaleString()}</strong>
                                </div>
                            </motion.div>
                            <motion.div
                                className="analytics-kpi-tile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.32 }}
                            >
                                <Heart size={18} strokeWidth={2} />
                                <div>
                                    <span className="analytics-kpi-label">Likes on collections</span>
                                    <strong className="analytics-kpi-value">{kpis.collLikes.toLocaleString()}</strong>
                                </div>
                            </motion.div>
                        </section>

                        {kpis.topTitle && (
                            <p className="analytics-top-spotlight">
                                <Sparkles size={14} strokeWidth={2.2} className="analytics-top-spotlight-icon" />
                                Top spotlight:
                                {' '}
                                <strong>{kpis.topTitle}</strong>
                                {' '}
                                <span className="analytics-top-spotlight-meta">
                                    ({kpis.topViews.toLocaleString()} views)
                                </span>
                            </p>
                        )}

                        <section className="analytics-split">
                            <div className="analytics-panel analytics-panel--chart">
                                <h2 className="analytics-panel-title">
                                    <BarChart3 size={18} strokeWidth={2} />
                                    Engagement
                                </h2>
                                <EngagementRing views={totalViews} likes={totalLikes} />
                            </div>
                            <div className="analytics-panel analytics-panel--hint">
                                <h3>Keep curating</h3>
                                <p>
                                    Stronger titles and covers pull more views. Pin your best
                                    collections so they surface first on your profile.
                                </p>
                            </div>
                        </section>

                        <section className="analytics-dual-panels">
                            <div className="analytics-panel analytics-panel--tight">
                                <h2 className="analytics-panel-title">
                                    <Eye size={18} strokeWidth={2} />
                                    Views by collection
                                </h2>
                                <BarList
                                    rows={collectionRows}
                                    valueKey="views"
                                    labelKey="title"
                                    emptyMessage="No collection views yet."
                                />
                            </div>
                            <div className="analytics-panel analytics-panel--tight">
                                <h2 className="analytics-panel-title">
                                    <Heart size={18} strokeWidth={2} />
                                    Likes by collection
                                </h2>
                                <BarList
                                    rows={collectionRows}
                                    valueKey="likes"
                                    labelKey="title"
                                    emptyMessage="No collection likes yet."
                                />
                            </div>
                        </section>

                        <section className="analytics-panel analytics-panel--wide">
                            <h2 className="analytics-panel-title">
                                <Package size={18} strokeWidth={2} />
                                Products listed per collection
                            </h2>
                            <BarList
                                rows={collectionRows}
                                valueKey="numberOfProducts"
                                labelKey="title"
                                emptyMessage="Add products to collections to see this breakdown."
                            />
                        </section>

                        <section className="analytics-panel analytics-panel--wide">
                            <h2 className="analytics-panel-title">
                                <Heart size={18} strokeWidth={2} />
                                Product likes by drop
                            </h2>
                            <BarList
                                rows={productRows}
                                valueKey="likes"
                                labelKey="name"
                                emptyMessage="No product analytics yet — add products to your collections."
                            />
                        </section>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default Analytics;
