import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Spark = () => (
    <span className="home-marquee-spark" aria-hidden>
        <Sparkles size={10} strokeWidth={2} className="home-marquee-spark-icon" />
    </span>
);

const Pill = ({ stat, label }) => (
    <span className="home-marquee-pill">
        <span className="home-marquee-stat">{stat}</span>
        <span className="home-marquee-pill-label">{label}</span>
    </span>
);

/**
 * Infinite horizontal marquee from user analytics — pill stats rail.
 */
const HomeAnalyticsMarquee = ({ analytics, loading, feedProductCount = 0 }) => {
    const pills = useMemo(() => {
        const list = [];
        if (analytics) {
            const c = analytics.collections || {};
            const p = analytics.products || {};
            list.push(
                { stat: c.total_collections ?? 0, label: 'collections' },
                { stat: p.total_products ?? 0, label: 'products' },
                { stat: c.total_views ?? 0, label: 'collection views' },
                { stat: p.likes_count ?? 0, label: 'likes' },
            );
            (c.data || []).slice(0, 4).forEach((row) => {
                const title = (row.title || 'Untitled').slice(0, 22);
                list.push({ stat: row.views ?? 0, label: `views · ${title}` });
            });
            (p.data || []).slice(0, 4).forEach((row) => {
                const name = (row.name || 'Drop').slice(0, 22);
                list.push({ stat: row.likes ?? 0, label: `likes · ${name}` });
            });
        }
        if (list.length === 0) {
            list.push(
                { stat: feedProductCount, label: 'products in your feed' },
                { stat: '—', label: loading ? 'syncing…' : 'curate to grow reach' },
                { stat: '↗', label: 'open analytics' },
            );
        }
        return list;
    }, [analytics, loading, feedProductCount]);

    const duration = Math.max(32, Math.min(85, pills.length * 14));

    const renderPills = (copyKey) => (
        <div className="home-marquee-track-inner" key={copyKey}>
            {pills.map((pill, i) => (
                <React.Fragment key={`${copyKey}-${i}`}>
                    {i > 0 && <Spark />}
                    <Pill stat={pill.stat} label={pill.label} />
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="home-analytics-marquee" aria-live="polite">
            <div className="home-analytics-marquee-inner">
                <motion.div
                    className="home-analytics-marquee-track"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                        duration,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                >
                    <div className="home-analytics-marquee-duo">
                        {renderPills('a')}
                        {renderPills('b')}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HomeAnalyticsMarquee;
