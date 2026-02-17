import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Share2,
    Heart,
    Trash2,
    ExternalLink,
    Calendar,
    Tag,
    Link2,
    Copy,
    Check,
    UserPlus,
    UserCheck,
    Package
} from 'lucide-react';
import ProductService from '../core/services/ProductService';
import UserService from '../core/services/UserService';
import Snackbar from '../components/Snackbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../core/config/apiConfig';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followsMe, setFollowsMe] = useState(false);

    const creator = product?.createdBy;
    const currentUserId = user?.id || user?._id;
    const isOwner = isAuthenticated && currentUserId && (creator?._id === currentUserId || creator?.id === currentUserId);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await ProductService.getProductById(id);
            const productData = data?.result || data;
            setProduct(productData);
            setLikeCount(productData?.likes?.length || 0);

            if (isAuthenticated && user) {
                const userId = user.id || user._id;
                const hasLiked = productData?.likes?.some(likeId => likeId === userId || likeId?._id === userId);
                setIsLiked(!!hasLiked);

                const creatorData = productData?.createdBy;
                if (creatorData && typeof creatorData === 'object') {
                    const followers = creatorData.followers || [];
                    setIsFollowing(followers.some(f => (f?._id || f) === userId));
                    const theirFollowing = creatorData.following || [];
                    setFollowsMe(theirFollowing.some(f => (f?._id || f) === userId));
                }
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            setSnackbar({ show: true, message: 'Failed to load product', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const prevLiked = isLiked;
        const prevCount = likeCount;
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await ProductService.likeProduct(id);
        } catch (error) {
            console.error('Failed to like product:', error);
            setIsLiked(prevLiked);
            setLikeCount(prevCount);
            setSnackbar({ show: true, message: 'Failed to like product', type: 'error' });
        }
    };

    const handleShare = () => {
        const url = product?.link || window.location.href;
        if (navigator.share) {
            navigator.share({
                title: product?.name || product?.title,
                text: product?.desc || product?.description,
                url: url,
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setSnackbar({ show: true, message: 'Link copied to clipboard!', type: 'success' });
        }
    };

    const handleDelete = async () => {
        if (!isOwner) return;
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        try {
            await ProductService.deleteProduct(id);
            setSnackbar({ show: true, message: 'Product deleted successfully', type: 'success' });
            setTimeout(() => navigate(-1), 1000);
        } catch (error) {
            console.error('Failed to delete product:', error);
            setSnackbar({ show: true, message: 'Failed to delete product', type: 'error' });
        }
    };

    const handleCreatorClick = () => {
        if (creator?._id) {
            navigate(`/user/${creator._id}`);
        }
    };

    const handleFollow = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const prevFollowing = isFollowing;
        setIsFollowing(!isFollowing);

        try {
            await UserService.followUser(creator?._id || creator?.id);
            setSnackbar({
                show: true,
                message: isFollowing ? `Unfollowed @${creator?.username}` : `Following @${creator?.username}`,
                type: 'success'
            });
        } catch (error) {
            console.error('Failed to follow user:', error);
            setIsFollowing(prevFollowing);
            setSnackbar({ show: true, message: 'Failed to update follow', type: 'error' });
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCount = (count) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count?.toString() || '0';
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-container">
                    <div className="product-detail-shimmer">
                        <div className="shimmer-image"></div>
                        <div className="shimmer-info">
                            <div className="shimmer-line wide"></div>
                            <div className="shimmer-line medium"></div>
                            <div className="shimmer-line narrow"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-error">
                <Package size={48} strokeWidth={1.5} />
                <h2>Product not found</h2>
                <p>This product may have been deleted or doesn't exist.</p>
                <button onClick={() => navigate(-1)} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={16} />
                    Go Back
                </button>
            </div>
        );
    }

    const productName = product.name || product.title || 'Untitled Product';
    const productDesc = product.desc || product.description;
    const productLink = product.link;
    const productImage = getImageUrl(product.image || product.imageUrl || (product.media && product.media[0]));
    const creatorImage = creator?.profileImageUrl ? getImageUrl(creator.profileImageUrl) : null;
    const createdDate = formatDate(product.createdAt);
    const productTags = product.tags || product.categories || [];

    return (
        <>
            <motion.div
                className={`product-detail-page ${!isAuthenticated ? 'public-view' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="product-detail-container">
                    <button
                        onClick={() => navigate(-1)}
                        className="product-back-link"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <div className="product-detail-layout">
                        {/* Image Section */}
                        <div className="product-detail-image-section">
                            {productImage ? (
                                <img
                                    src={productImage}
                                    alt={productName}
                                    className="product-detail-image"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.classList.add('show-placeholder'); }}
                                />
                            ) : null}
                            <div className="product-detail-placeholder">
                                <Package size={64} strokeWidth={1} />
                                <span>{productName[0]?.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="product-detail-info-section">
                            {/* Actions Row */}
                            <div className="product-detail-actions">
                                <button
                                    className={`action-btn-label ${isLiked ? 'liked' : ''}`}
                                    onClick={handleLike}
                                >
                                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                                </button>

                                <button className="action-btn-label" onClick={handleShare}>
                                    {copied ? <Check size={18} /> : <Share2 size={18} />}
                                    <span>{copied ? 'Copied!' : 'Share'}</span>
                                </button>

                                {productLink && (
                                    <a
                                        href={productLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn-label primary"
                                    >
                                        <ExternalLink size={18} />
                                        <span>Visit</span>
                                    </a>
                                )}

                                {isOwner && (
                                    <button className="action-btn-label delete-action" onClick={handleDelete}>
                                        <Trash2 size={18} />
                                        <span>Delete</span>
                                    </button>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="product-detail-title">{productName}</h1>

                            {/* Description */}
                            {productDesc && (
                                <p className="product-detail-desc">{productDesc}</p>
                            )}

                            {/* Meta Info */}
                            <div className="product-detail-meta">
                                <div className="product-meta-item">
                                    <Heart size={16} />
                                    <span>{formatCount(likeCount)} {likeCount === 1 ? 'like' : 'likes'}</span>
                                </div>
                                {createdDate && (
                                    <div className="product-meta-item">
                                        <Calendar size={16} />
                                        <span>{createdDate}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {productTags.length > 0 && (
                                <div className="product-detail-tags">
                                    {productTags.map((tag, index) => (
                                        <span key={index} className="product-tag">
                                            <Tag size={12} />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Product Link */}
                            {productLink && (
                                <div className="product-detail-link-card">
                                    <Link2 size={18} />
                                    <a href={productLink} target="_blank" rel="noopener noreferrer">
                                        {productLink}
                                    </a>
                                </div>
                            )}

                            {/* Creator Card */}
                            {creator && typeof creator === 'object' && (
                                <div className="product-creator-card">
                                    <div className="product-creator-left" onClick={handleCreatorClick}>
                                        {creatorImage ? (
                                            <img
                                                src={creatorImage}
                                                alt={creator.fullName || creator.username}
                                                className="product-creator-avatar"
                                                onError={(e) => { e.target.src = API_CONFIG.BASE_URL + '/images/default.webp'; }}
                                            />
                                        ) : (
                                            <div className="product-creator-avatar-placeholder">
                                                {(creator.fullName || creator.username || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div className="product-creator-info">
                                            <h3 className="product-creator-name">{creator.fullName || creator.username}</h3>
                                            <span className="product-creator-username">@{creator.username}</span>
                                            {creator.bio && (
                                                <span className="product-creator-bio">{creator.bio}</span>
                                            )}
                                            <span className="product-creator-followers">
                                                {formatCount(creator.followers?.length || creator.followers || 0)} followers
                                            </span>
                                        </div>
                                    </div>
                                    {!isOwner && (
                                        <button
                                            className={`creator-follow-btn ${isFollowing ? 'following' : ''}`}
                                            onClick={handleFollow}
                                        >
                                            {isFollowing ? (
                                                <><UserCheck size={16} /> Following</>
                                            ) : (
                                                <><UserPlus size={16} /> {followsMe ? 'Follow Back' : 'Follow'}</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
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
            </motion.div>

            {!isAuthenticated && <Footer />}
        </>
    );
};

export default ProductDetailPage;
