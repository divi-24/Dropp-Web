import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import '../styles/ExploreCard.css';

const ExploreCard = ({ collection }) => {
    const navigate = useNavigate();
    const collectionId = collection._id || collection.id;
    const creator = collection.createdBy;

    const handleCardClick = () => {
        navigate(`/c/${collectionId}`);
    };

    const handleCreatorClick = (e) => {
        e.stopPropagation();
        if (creator?._id) {
            navigate(`/user/${creator._id}`);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return PLACEHOLDER_IMAGE;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const displayImage = getImageUrl(collection.displayImageUrl);
    const creatorImage = getImageUrl(creator?.profileImageUrl);

    return (
        <motion.div
            className="explore-card"
            onClick={handleCardClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            {/* Collection Image */}
            <div className="explore-card-image-container">
                <img
                    src={displayImage}
                    alt={collection.title}
                    className="explore-card-image"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />

                {/* Hover Overlay */}
                <div className="explore-card-overlay">
                    <div className="explore-card-actions">
                        <button className="explore-action-btn save-btn">
                            <Heart size={18} />
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Collection Info */}
            <div className="explore-card-content">
                <h3 className="explore-card-title">{collection.title}</h3>
                {collection.desc && (
                    <p className="explore-card-desc">{collection.desc}</p>
                )}
            </div>

            {/* Creator Info */}
            {creator && (
                <div className="explore-card-creator" onClick={handleCreatorClick}>
                    <div className="creator-avatar-wrap" style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
                        {creatorImage ? (
                            <img
                                src={creatorImage}
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
                                display: creatorImage ? 'none' : 'flex',
                                width: '100%',
                                height: '100%',
                                fontSize: '12px'
                            }}
                        >
                            {(creator.fullName || creator.username || '?')[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="creator-details">
                        <span className="creator-name">{creator.fullName || creator.username}</span>
                        <span className="creator-meta">
                            @{creator.username} · {creator.followers || 0} followers
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ExploreCard;
