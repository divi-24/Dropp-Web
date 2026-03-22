import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Boxes, Heart, Eye, Package } from 'lucide-react';
import UserService from '../core/services/UserService';
import '../styles/Analytics.css';

const StatCard = ({ icon: Icon, label, value }) => (
    <div className="analytics-stat-card">
        <div className="analytics-stat-icon"><Icon size={18} /></div>
        <div className="analytics-stat-content">
            <p>{label}</p>
            <h3>{value}</h3>
        </div>
    </div>
);

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

    const collectionStats = analytics?.collections || {};
    const productStats = analytics?.products || {};
    const collectionRows = useMemo(() => collectionStats.data || [], [collectionStats]);
    const productRows = useMemo(() => productStats.data || [], [productStats]);

    return (
        <motion.div
            className="analytics-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="analytics-container">
                <h1 className="analytics-title">Analytics</h1>

                {loading && <div className="analytics-empty">Loading analytics...</div>}
                {!loading && error && <div className="analytics-error">{error}</div>}

                {!loading && !error && (
                    <>
                        <section className="analytics-grid">
                            <StatCard icon={Boxes} label="Total Collections" value={collectionStats.total_collections || 0} />
                            <StatCard icon={Package} label="Total Products" value={productStats.total_products || 0} />
                            <StatCard icon={Eye} label="Collection Views" value={collectionStats.total_views || 0} />
                            <StatCard icon={Heart} label="Product Likes" value={productStats.likes_count || 0} />
                        </section>

                        <section className="analytics-section">
                            <h2><BarChart3 size={18} /> Collection Performance</h2>
                            {collectionRows.length === 0 ? (
                                <div className="analytics-empty">No collection analytics yet.</div>
                            ) : (
                                <div className="analytics-table-wrap">
                                    <table className="analytics-table">
                                        <thead>
                                            <tr>
                                                <th>Collection</th>
                                                <th>Products</th>
                                                <th>Views</th>
                                                <th>Likes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {collectionRows.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.title || 'Untitled'}</td>
                                                    <td>{item.numberOfProducts || 0}</td>
                                                    <td>{item.views || 0}</td>
                                                    <td>{item.likes || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section className="analytics-section">
                            <h2><Package size={18} /> Product Performance</h2>
                            {productRows.length === 0 ? (
                                <div className="analytics-empty">No product analytics yet.</div>
                            ) : (
                                <div className="analytics-table-wrap">
                                    <table className="analytics-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Views</th>
                                                <th>Likes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productRows.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.name || 'Untitled'}</td>
                                                    <td>{item.views || 0}</td>
                                                    <td>{item.likes || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default Analytics;
