import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import '../styles/Collection.css';

const MasonryGrid = ({ collections, columns = { desktop: 4, tablet: 3, mobile: 2 } }) => {
    const navigate = useNavigate();

    const handleCollectionClick = (collectionId) => {
        navigate(`/c/${collectionId}`);
    };

    return (
        <div className="masonry-grid">
            {collections && collections.length > 0 ? (
                collections.map((collection) => {
                    const displayImage = collection.displayImageUrl?.startsWith('http')
                        ? collection.displayImageUrl
                        : API_CONFIG.BASE_URL + collection.displayImageUrl;

                    return (
                        <div
                            key={collection._id}
                            className="masonry-item"
                            onClick={() => handleCollectionClick(collection._id)}
                        >
                            <img
                                src={displayImage}
                                alt={collection.title}
                                onError={(e) => {
                                    e.target.src = PLACEHOLDER_IMAGE;
                                }}
                            />
                            <div className="masonry-item-overlay">
                                <h3>{collection.title}</h3>
                                {collection.desc && <p>{collection.desc}</p>}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="masonry-empty">
                    <p>No collections available</p>
                </div>
            )}
        </div>
    );
};

export default MasonryGrid;
