import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, MoreHorizontal, Edit, Trash2, Link2, Copy, Check, Heart } from 'lucide-react';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import '../styles/Profile.css';

const CollectionCard = ({
    collection,
    onShare,
    onEdit,
    onDelete,
    isOwner = false
}) => {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(collection.likes?.length || 0);

    const collectionId = collection._id || collection.id;
    const creator = collection.createdBy;

    const handleCardClick = (e) => {
        if (e.target.closest('.board-actions') || e.target.closest('.share-popup')) return;
        navigate(`/c/${collectionId}`);
    };

    const handleCreatorClick = (e) => {
        e.stopPropagation();
        if (creator?._id) {
            navigate(`/user/${creator._id}`);
        }
    };

    const handleLikeClick = (e) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        // TODO: Implement like API call
    };

    const handleShareClick = (e) => {
        e.stopPropagation();
        setShowShare(!showShare);
        setOpenMenu(false);
        setCopied(false);
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setOpenMenu(!openMenu);
        setShowShare(false);
    };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        const basePath = import.meta.env.BASE_URL || '/';
        const url = `${window.location.origin}${basePath}#/c/${collectionId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => {
            setShowShare(false);
            setCopied(false);
        }, 1500);
    };

    const getImageUrl = (url) => {
        if (!url) return PLACEHOLDER_IMAGE;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const getGridImages = () => {
        // Fix: Use generic placeholder if no display image, NEVER use profile image for collection cover
        const mainImage = collection.displayImageUrl
            ? getImageUrl(collection.displayImageUrl)
            : PLACEHOLDER_IMAGE;

        return [mainImage, mainImage, mainImage];
    };

    const gridImages = getGridImages();
    const creatorImage = creator?.profileImageUrl ? getImageUrl(creator.profileImageUrl) : API_CONFIG.BASE_URL + '/images/default.webp';

    // Close popups on outside click
    React.useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenu(false);
            setShowShare(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="pinterest-board" onClick={handleCardClick}>
            <div className="board-preview">
                <div className="board-main-image">
                    <img
                        src={gridImages[0]}
                        alt={collection.title}
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                </div>
                <div className="board-side-images">
                    <div className="board-side-image">
                        <img
                            src={gridImages[1]}
                            alt=""
                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                    </div>
                    <div className="board-side-image">
                        <img
                            src={gridImages[2]}
                            alt=""
                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                    </div>
                </div>

                {/* Hover Actions */}
                <div className="board-actions">
                    <button
                        className="board-action-btn"
                        onClick={handleShareClick}
                        title="Share"
                    >
                        <Share2 size={18} />
                    </button>

                    {isOwner && (
                        <div className="board-menu-container">
                            <button
                                className="board-action-btn"
                                onClick={handleMenuClick}
                                title="More"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            {openMenu && (
                                <div className="board-dropdown" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(collection); setOpenMenu(false); }}>
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(collection); setOpenMenu(false); }}>
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Share Popup */}
            {showShare && (
                <div className="share-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="share-popup-header">
                        <Link2 size={16} />
                        <span>Copy Link</span>
                    </div>
                    <div className="share-popup-content">
                        <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}${import.meta.env.BASE_URL || '/'}#/c/${collectionId}`}
                            className="share-link-input"
                        />
                        <button
                            className={`copy-link-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopyLink}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Board Info with Creator Avatar */}
            <div className="board-info-row">
                {creator && (
                    <img
                        src={creatorImage}
                        alt={creator.fullName || creator.username}
                        className="board-creator-avatar"
                        onClick={handleCreatorClick}
                        onError={(e) => { e.target.src = API_CONFIG.BASE_URL + '/images/default.webp'; }}
                    />
                )}
                <div className="board-info">
                    <h4 className="board-title">{collection.title}</h4>
                    {creator && (
                        <span className="board-creator-name" onClick={handleCreatorClick}>
                            {creator.fullName || creator.username} • {collection.products?.length || 0} products • {likeCount} likes
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionCard;
