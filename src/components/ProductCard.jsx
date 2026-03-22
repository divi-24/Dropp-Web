import React, { useState, useEffect } from 'react';
import { Share2, MoreHorizontal, Trash2, Link2, Copy, Check, Heart, Edit2, Lock, Pin } from 'lucide-react';
import AddProductModal from './AddProductModal';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import ProductService from '../core/services/ProductService';
import Snackbar from './Snackbar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const ProductCard = ({ product, onDelete, isCollectionOwner = false }) => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(
        product?.likes?.some(likeId => likeId === user?._id) || false
    );
    const [likeCount, setLikeCount] = useState(product.likes?.length || 0);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [isPinned, setIsPinned] = useState(!!product.isPinned);
    const [pinLoading, setPinLoading] = useState(false);

    useEffect(() => {
        setIsPinned(!!product.isPinned);
    }, [product._id, product.id, product.isPinned]);

    const productId = product._id || product.id;
    const creator = product.createdBy;
    // Product owner = user who added this product; collection owner can manage all products
    const isOwner = isAuthenticated && user && (creator?._id === user._id || creator === user._id);
    const canManageProduct = isOwner || isCollectionOwner;

    const handleCardClick = (e) => {
        if (
            e.target.closest('.board-actions')
            || e.target.closest('.share-popup')
            || e.target.closest('.board-menu-container')
            || e.target.closest('.product-card-pin-btn')
        ) return;
        navigate(`/product/${productId}`);
    };

    const handlePinClick = async (e) => {
        e.stopPropagation();
        if (!isOwner || pinLoading) return;
        const nextPinned = !isPinned;
        setIsPinned(nextPinned);
        setPinLoading(true);
        try {
            await ProductService.pinProduct(productId);
            setSnackbar({
                show: true,
                message: nextPinned ? 'Product pinned' : 'Product unpinned',
                type: 'success',
            });
        } catch (error) {
            console.error('Failed to pin product:', error);
            setIsPinned(!nextPinned);
            setSnackbar({ show: true, message: 'Failed to update pin', type: 'error' });
        } finally {
            setPinLoading(false);
        }
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
        const url = `${window.location.origin}/product/${productId}`;
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

    const getImageUrl = (urlOrObj) => {
        if (!urlOrObj) return PLACEHOLDER_IMAGE;
        
        // Handle if it's an object with a url property (from the new API response)
        const url = typeof urlOrObj === 'object' ? urlOrObj.url : urlOrObj;
        
        if (!url || typeof url !== 'string') return PLACEHOLDER_IMAGE;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const firstMedia = Array.isArray(product.media) && product.media.length > 0 ? product.media[0] : null;
    const displayImage = getImageUrl(product.image || product.imageUrl || firstMedia);
    const creatorImage = creator?.profileImageUrl ? getImageUrl(creator.profileImageUrl) : null;

    const handleEdit = (e) => {
        e.stopPropagation();
        setOpenMenu(false);
        setShowEditModal(true);
    };

    const handleProductUpdated = () => {
        // Refresh logic - ideally we should reload the product or parent list.
        // For now, we rely on the parent or page refresh.
        // If onDelete is actually onRefresh, we could call it.
        // Or we assume the user will see changes after refresh.
        // A simple way is to reload window or navigate.
        window.location.reload();
    };

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
                        {isOwner && (
                            <button
                                type="button"
                                className={`board-action-btn product-card-pin-btn ${isPinned ? 'is-pinned' : ''}`}
                                onClick={handlePinClick}
                                disabled={pinLoading}
                                title={isPinned ? 'Unpin product' : 'Pin product'}
                            >
                                <Pin size={16} strokeWidth={2.25} fill={isPinned ? 'currentColor' : 'none'} />
                            </button>
                        )}
                    </div>

                    {product.isPrivate && (
                        <div className="card-privacy-badge">
                            <Lock size={11} /> Private
                        </div>
                    )}

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

                        {canManageProduct && (
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
                                        <button className="edit-btn" onClick={handleEdit}>
                                            <Edit2 size={16} />
                                            Edit
                                        </button>
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
                                value={`${window.location.origin}/product/${productId}`}
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
                        <>
                            {creatorImage ? (
                                <img
                                    src={creatorImage}
                                    alt={creator.fullName || creator.username}
                                    className="board-creator-avatar"
                                    onClick={handleCreatorClick}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="board-creator-avatar-placeholder"
                                style={{
                                    display: creatorImage ? 'none' : 'flex',
                                    width: '32px',
                                    height: '32px',
                                    fontSize: '14px'
                                }}
                                onClick={handleCreatorClick}
                            >
                                {(creator.fullName || creator.username || '?')[0].toUpperCase()}
                            </div>
                        </>
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

            <Snackbar
                isVisible={snackbar.show}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar((s) => ({ ...s, show: false }))}
            />

            {/* Edit Modal */}
            <AddProductModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                productToEdit={product}
                onProductAdded={handleProductUpdated}
            />
        </>
    );
};

export default ProductCard;
