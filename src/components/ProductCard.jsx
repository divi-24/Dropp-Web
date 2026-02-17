import React, { useState } from 'react';
import { Share2, MoreHorizontal, Trash2, Link2, Copy, Check, Heart } from 'lucide-react';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import ProductService from '../core/services/ProductService';
import Snackbar from './Snackbar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const ProductCard = ({ product, onDelete }) => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(
        product?.likes?.some(likeId => likeId === user?._id) || false
    );
    const [likeCount, setLikeCount] = useState(product.likes?.length || 0);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });

    const productId = product._id || product.id;
    const creator = product.createdBy;
    const isOwner = isAuthenticated && user && (creator?._id === user._id || creator === user._id);

    const handleCardClick = (e) => {
        if (e.target.closest('.board-actions') || e.target.closest('.share-popup') || e.target.closest('.board-menu-container')) return;
        navigate(`/product/${productId}`);
    };

    const handleCreatorClick = (e) => {
        e.stopPropagation();
        if (creator?._id) {
            navigate(`/user/${creator._id}`);
        }
    };

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const prevLiked = isLiked;
        const prevCount = likeCount;
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await ProductService.likeProduct(productId);
        } catch (error) {
            console.error('Failed to like product:', error);
            setIsLiked(prevLiked);
            setLikeCount(prevCount);
            setSnackbar({ show: true, message: 'Failed to like product', type: 'error' });
        }
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
        const url = product.link || window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => {
            setShowShare(false);
            setCopied(false);
        }, 1500);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        setOpenMenu(false);
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await ProductService.deleteProduct(productId);
            setSnackbar({ show: true, message: 'Product deleted', type: 'success' });
            if (onDelete) onDelete(productId);
        } catch (error) {
            console.error('Failed to delete product:', error);
            setSnackbar({ show: true, message: 'Failed to delete product', type: 'error' });
        }
    };

    const getImageUrl = (url) => {
        if (!url) return PLACEHOLDER_IMAGE;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const displayImage = getImageUrl(product.image || product.imageUrl || (product.media && product.media[0]));
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
        <>
            <div className="pinterest-board" onClick={handleCardClick}>
                <div className="board-preview product-board-preview">
                    <div className="board-main-image product-single-image">
                        <img
                            src={displayImage}
                            alt={product.name || product.title}
                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                    </div>

                    {/* Hover Actions */}
                    <div className="board-actions">
                        <button
                            className={`board-action-btn like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLikeClick}
                            title={isLiked ? 'Unlike' : 'Like'}
                        >
                            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>

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
                                        <button className="delete-btn" onClick={handleDelete}>
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
                                value={product.link || window.location.href}
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
                    {creator && typeof creator === 'object' && (
                        <img
                            src={creatorImage}
                            alt={creator.fullName || creator.username}
                            className="board-creator-avatar"
                            onClick={handleCreatorClick}
                            onError={(e) => { e.target.src = API_CONFIG.BASE_URL + '/images/default.webp'; }}
                        />
                    )}
                    <div className="board-info">
                        <h4 className="board-title">{product.name || product.title}</h4>
                        <span className="board-creator-name">
                            {creator && typeof creator === 'object'
                                ? `${creator.fullName || creator.username} • `
                                : ''}
                            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                        </span>
                    </div>
                </div>
            </div>

            {snackbar.show && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar({ ...snackbar, show: false })}
                />
            )}
        </>
    );
};

export default ProductCard;
