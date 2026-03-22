import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Heart, Share2,
    ExternalLink, Calendar, MoreHorizontal, Flag, UserX,
    UserPlus, UserCheck, Package, Check, Layers, Grid3X3,
    Link2, Pin, Sparkles
} from 'lucide-react';
import ProductService from '../core/services/ProductService';
import UserService from '../core/services/UserService';
import CollectionService from '../core/services/CollectionService';
import CollectionCard from '../components/CollectionCard';
import Snackbar from '../components/Snackbar';
import Footer from '../components/Footer';
import FollowListModal from '../components/FollowListModal';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [product, setProduct] = useState(null);
    const [creator, setCreator] = useState(null);
    const [creatorCollections, setCreatorCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [copied, setCopied] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers' });
    const [pinLoading, setPinLoading] = useState(false);
    const [featureLoading, setFeatureLoading] = useState(false);

    const touchStartX = useRef(null);
    const optionsRef = useRef(null);

    const currentUserId = user?.id || user?._id;
    const isOwner = isAuthenticated && creator && currentUserId &&
        ((creator._id || creator.id) === currentUserId);

    useEffect(() => {
        if (isAuthenticated) fetchProductData();
    }, [id, isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            const productData = await ProductService.getProductByPId(id);
            setProduct(productData);
            setLikeCount(productData?.likes?.length || 0);

            if (isAuthenticated && user) {
                const userId = user.id || user._id;
                const hasLiked = productData?.likes?.some(
                    likeId => likeId === userId || likeId?._id === userId
                );
                setIsLiked(!!hasLiked);
            }

            // Fetch creator data and collections in parallel
            const creatorId = typeof productData?.createdBy === 'string'
                ? productData.createdBy
                : productData?.createdBy?._id || productData?.createdBy?.id;

            if (creatorId) {
                const [userData, collectionsData] = await Promise.allSettled([
                    UserService.getUserById(creatorId),
                    CollectionService.getUserCollections(creatorId)
                ]);

                if (userData.status === 'fulfilled' && userData.value) {
                    const creatorData = userData.value;
                    setCreator(creatorData);
                    setFollowerCount(creatorData?.followers?.length || 0);

                    if (isAuthenticated && user) {
                        const myId = user.id || user._id;
                        if (creatorData?.isFollowing !== undefined) {
                            setIsFollowing(creatorData.isFollowing);
                        } else if (Array.isArray(creatorData?.followers)) {
                            setIsFollowing(creatorData.followers.some(f => (f?._id || f) === myId));
                        } else {
                            setIsFollowing(false);
                        }
                    }
                } else if (typeof productData?.createdBy === 'object' && productData?.createdBy) {
                    setCreator(productData.createdBy);
                    setFollowerCount(productData.createdBy?.followers?.length || 0);
                }

                if (collectionsData.status === 'fulfilled') {
                    setCreatorCollections(collectionsData.value || []);
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
        if (!isAuthenticated) { navigate('/login'); return; }
        const prevLiked = isLiked;
        const prevCount = likeCount;
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        try {
            await ProductService.likeProduct(id);
        } catch (error) {
            setIsLiked(prevLiked);
            setLikeCount(prevCount);
            setSnackbar({ show: true, message: 'Failed to like product', type: 'error' });
        }
    };

    const handleFollow = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        const prevFollowing = isFollowing;
        const prevCount = followerCount;
        setIsFollowing(!isFollowing);
        setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
        try {
            const creatorId = creator?._id || creator?.id;
            await UserService.followUser(creatorId);
            setSnackbar({
                show: true,
                message: isFollowing ? `Unfollowed @${creator?.username}` : `Following @${creator?.username}`,
                type: 'success'
            });
        } catch (error) {
            setIsFollowing(prevFollowing);
            setFollowerCount(prevCount);
            setSnackbar({ show: true, message: 'Failed to update follow', type: 'error' });
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/product/${id}`;
        if (navigator.share) {
            navigator.share({ title: product?.name, text: product?.desc, url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setSnackbar({ show: true, message: 'Link copied to clipboard!', type: 'success' });
        }
    };

    const handleReport = () => {
        setShowOptions(false);
        setSnackbar({ show: true, message: 'Report submitted. Thanks for keeping Dropp safe.', type: 'info' });
    };

    const handleBlock = () => {
        setShowOptions(false);
        setSnackbar({ show: true, message: `@${creator?.username} has been blocked`, type: 'warning' });
    };

    const handlePinProduct = async () => {
        if (!isOwner || pinLoading) return;
        const nextPinned = !product?.isPinned;
        setPinLoading(true);
        setProduct((prev) => ({ ...prev, isPinned: nextPinned }));
        try {
            await ProductService.pinProduct(id);
            setSnackbar({ show: true, message: nextPinned ? 'Product pinned' : 'Product unpinned', type: 'success' });
        } catch (error) {
            setProduct((prev) => ({ ...prev, isPinned: !nextPinned }));
            setSnackbar({ show: true, message: 'Failed to update pin status', type: 'error' });
        } finally {
            setPinLoading(false);
        }
    };

    const handleFeatureProduct = async () => {
        if (!isOwner || featureLoading) return;
        const nextFeatured = !product?.isFeatured;
        setFeatureLoading(true);
        setProduct((prev) => ({ ...prev, isFeatured: nextFeatured }));
        try {
            await ProductService.featureProduct(id);
            setSnackbar({
                show: true,
                message: nextFeatured ? 'Product marked as featured' : 'Product unfeatured',
                type: 'success'
            });
        } catch (error) {
            setProduct((prev) => ({ ...prev, isFeatured: !nextFeatured }));
            setSnackbar({ show: true, message: 'Failed to update featured status', type: 'error' });
        } finally {
            setFeatureLoading(false);
        }
    };

    const mediaList = (product?.media || []).map(item => {
        if (!item) return null;
        const url = typeof item === 'object' ? item.url : item;
        if (!url || typeof url !== 'string') return null;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    }).filter(Boolean);

    const goPrev = () => setActiveMedia(prev => prev > 0 ? prev - 1 : mediaList.length - 1);
    const goNext = () => setActiveMedia(prev => prev < mediaList.length - 1 ? prev + 1 : 0);

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
        touchStartX.current = null;
    };

    const getImageUrl = (urlOrObj) => {
        if (!urlOrObj) return null;
        const url = typeof urlOrObj === 'object' ? urlOrObj.url : urlOrObj;
        if (!url || typeof url !== 'string') return null;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatCount = (count) => {
        if (!count && count !== 0) return '0';
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    if (!isAuthenticated) {
        return (
            <>
                <div className="pdp-auth-gate-page">
                    <div className="pdp-auth-gate">
                        <div className="pdp-auth-gate-icon">
                            <Package size={36} strokeWidth={1.2} />
                        </div>
                        <h2 className="pdp-auth-gate-title">Sign in to view this product</h2>
                        <p className="pdp-auth-gate-sub">
                            Create an account or sign in to explore curated products and collections from creators on Dropp.
                        </p>
                        <div className="pdp-auth-gate-btns">
                            <button className="pdp-auth-gate-primary" onClick={() => navigate('/signup')}>
                                Create Account
                            </button>
                            <button className="pdp-auth-gate-secondary" onClick={() => navigate('/login')}>
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (loading) {
        return (
            <div className="pdp-page">
                <div className="pdp-container">
                    <div className="pdp-shimmer-back"></div>
                    <div className="pdp-shimmer-layout">
                        <div className="pdp-shimmer-left">
                            <div className="pdp-shimmer-media"></div>
                            <div className="pdp-shimmer-title"></div>
                            <div className="pdp-shimmer-desc"></div>
                            <div className="pdp-shimmer-meta"></div>
                        </div>
                        <div className="pdp-shimmer-right">
                            <div className="pdp-shimmer-avatar"></div>
                            <div className="pdp-shimmer-name"></div>
                            <div className="pdp-shimmer-line"></div>
                            <div className="pdp-shimmer-line short"></div>
                            <div className="pdp-shimmer-stats-row">
                                <div className="pdp-shimmer-stat"></div>
                                <div className="pdp-shimmer-stat"></div>
                                <div className="pdp-shimmer-stat"></div>
                            </div>
                            <div className="pdp-shimmer-btn"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pdp-error-state">
                <Package size={56} strokeWidth={1} />
                <h2>Product not found</h2>
                <p>This product may have been deleted or doesn't exist.</p>
                <button onClick={() => navigate(-1)} className="pdp-back-btn">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    const productName = product.name || product.title || 'Untitled Product';
    const productDesc = product.desc || product.description;
    const productLink = product.link;
    const productLinks = productLink
        ? productLink.split(',').map(l => l.trim()).filter(Boolean)
        : [];
    const creatorName = creator?.fullName || creator?.username || 'Unknown Creator';
    const creatorUsername = creator?.username;
    const creatorAvatar = creator?.profileImageUrl ? getImageUrl(creator.profileImageUrl) : null;
    const creatorBio = creator?.bio;
    const creatorFollowingCount = Array.isArray(creator?.following)
        ? creator.following.length
        : (creator?.following || 0);

    return (
        <>
            <motion.div
                className={`pdp-page${!isAuthenticated ? ' pdp-public' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="pdp-container">
                    <button className="pdp-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="pdp-layout">
                        {/* ── LEFT COLUMN ── */}
                        <div className="pdp-left">

                            {/* ROW 1 — Product Card */}
                            <div className="pdp-product-card">

                                {/* Media Carousel */}
                                {mediaList.length > 0 ? (
                                    <div className="pdp-media-wrapper">
                                        <div
                                            className="pdp-media-viewport"
                                            onTouchStart={handleTouchStart}
                                            onTouchEnd={handleTouchEnd}
                                        >
                                            <div
                                                className="pdp-media-track"
                                                style={{ transform: `translateX(-${activeMedia * 100}%)` }}
                                            >
                                                {mediaList.map((src, i) => (
                                                    <div key={i} className="pdp-media-slide">
                                                        <img
                                                            src={src}
                                                            alt={`${productName} ${i + 1}`}
                                                            draggable="false"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {mediaList.length > 1 && (
                                                <>
                                                    <button
                                                        className="pdp-media-nav pdp-media-prev"
                                                        onClick={goPrev}
                                                        aria-label="Previous image"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                    <button
                                                        className="pdp-media-nav pdp-media-next"
                                                        onClick={goNext}
                                                        aria-label="Next image"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                    <div className="pdp-media-counter">
                                                        {activeMedia + 1} / {mediaList.length}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {mediaList.length > 1 && (
                                            <div className="pdp-media-dots">
                                                {mediaList.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        className={`pdp-dot${i === activeMedia ? ' active' : ''}`}
                                                        onClick={() => setActiveMedia(i)}
                                                        aria-label={`Go to image ${i + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="pdp-media-placeholder">
                                        <img src={PLACEHOLDER_IMAGE} alt="No media available" />
                                    </div>
                                )}

                                {/* Product Info */}
                                <div className="pdp-product-info">
                                    <h1 className="pdp-product-title">{productName}</h1>

                                    {productDesc && (
                                        <p className="pdp-product-desc">{productDesc}</p>
                                    )}

                                    <div className="pdp-product-meta-row">
                                        {product.createdAt && (
                                            <div className="pdp-meta-chip">
                                                <Calendar size={13} />
                                                <span>{formatDate(product.createdAt)}</span>
                                            </div>
                                        )}
                                        <div className="pdp-meta-chip">
                                            <Heart size={13} />
                                            <span>{formatCount(likeCount)} {likeCount === 1 ? 'like' : 'likes'}</span>
                                        </div>
                                    </div>

                                    <div className="pdp-product-actions">
                                        <button
                                            className={`pdp-action-btn${isLiked ? ' pdp-liked' : ''}`}
                                            onClick={handleLike}
                                        >
                                            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                                            {isLiked ? 'Liked' : 'Like'}
                                        </button>

                                        <button className="pdp-action-btn" onClick={handleShare}>
                                            {copied ? <Check size={16} /> : <Share2 size={16} />}
                                            {copied ? 'Copied!' : 'Share'}
                                        </button>

                                        {productLinks.length > 0 && (
                                            <a
                                                href={productLinks[0]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pdp-action-btn pdp-visit-btn"
                                            >
                                                <ExternalLink size={16} />
                                                Visit
                                            </a>
                                        )}

                                        {isOwner && (
                                            <>
                                                <button
                                                    className={`pdp-action-btn${product?.isPinned ? ' pdp-liked' : ''}`}
                                                    onClick={handlePinProduct}
                                                    disabled={pinLoading}
                                                >
                                                    <Pin size={16} />
                                                    {product?.isPinned ? 'Pinned' : 'Pin'}
                                                </button>
                                                <button
                                                    className={`pdp-action-btn${product?.isFeatured ? ' pdp-liked' : ''}`}
                                                    onClick={handleFeatureProduct}
                                                    disabled={featureLoading}
                                                >
                                                    <Sparkles size={16} />
                                                    {product?.isFeatured ? 'Featured' : 'Feature'}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {productLinks.length > 0 && (
                                        <div className="pdp-links-list">
                                            {productLinks.map((link, i) => {
                                                let label = link;
                                                try { label = new URL(link).hostname.replace('www.', ''); } catch {}
                                                return (
                                                    <a
                                                        key={i}
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="pdp-link-card"
                                                    >
                                                        <Link2 size={15} />
                                                        <span className="pdp-link-label">{label}</span>
                                                        <ExternalLink size={13} className="pdp-link-external" />
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* ── RIGHT COLUMN — Creator Panel ── */}
                        <div className="pdp-right">
                            {creator ? (
                                <div className="pdp-creator-panel">
                                    {/* Avatar */}
                                    <div
                                        className="pdp-creator-avatar-wrap"
                                        onClick={() => creator?._id && navigate(`/user/${creator._id}`)}
                                        title={`View ${creatorName}'s profile`}
                                    >
                                        {creatorAvatar ? (
                                            <img
                                                src={creatorAvatar}
                                                alt={creatorName}
                                                className="pdp-creator-avatar"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="pdp-creator-avatar-placeholder"
                                            style={{ display: creatorAvatar ? 'none' : 'flex' }}
                                        >
                                            {creatorName[0].toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Name & Username */}
                                    <div
                                        className="pdp-creator-identity"
                                        onClick={() => creator?._id && navigate(`/user/${creator._id}`)}
                                    >
                                        <h3 className="pdp-creator-name">{creatorName}</h3>
                                        {creatorUsername && (
                                            <span className="pdp-creator-username">@{creatorUsername}</span>
                                        )}
                                    </div>

                                    {/* Bio */}
                                    {creatorBio && (
                                        <p className="pdp-creator-bio">{creatorBio}</p>
                                    )}

                                    {/* Stats */}
                                    <div className="pdp-creator-stats">
                                        <div 
                                            className="pdp-stat clickable"
                                            onClick={() => setFollowModal({ isOpen: true, type: 'followers' })}
                                        >
                                            <span className="pdp-stat-value">{formatCount(followerCount)}</span>
                                            <span className="pdp-stat-label">Followers</span>
                                        </div>
                                        <div className="pdp-stat-divider" />
                                        <div 
                                            className="pdp-stat clickable"
                                            onClick={() => setFollowModal({ isOpen: true, type: 'following' })}
                                        >
                                            <span className="pdp-stat-value">{formatCount(creatorFollowingCount)}</span>
                                            <span className="pdp-stat-label">Following</span>
                                        </div>
                                        <div className="pdp-stat-divider" />
                                        <div className="pdp-stat">
                                            <span className="pdp-stat-value">{formatCount(creatorCollections.length)}</span>
                                            <span className="pdp-stat-label">Collections</span>
                                        </div>
                                    </div>

                                    {/* Follow + Options */}
                                    {!isOwner && (
                                        <div className="pdp-creator-actions">
                                            <button
                                                className={`pdp-follow-btn${isFollowing ? ' following' : ''}`}
                                                onClick={handleFollow}
                                            >
                                                {isFollowing
                                                    ? <><UserCheck size={16} /> Following</>
                                                    : <><UserPlus size={16} /> Follow</>
                                                }
                                            </button>

                                            <div className="pdp-options-wrap" ref={optionsRef}>
                                                <button
                                                    className="pdp-options-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowOptions(prev => !prev);
                                                    }}
                                                    aria-label="More options"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                {showOptions && (
                                                    <div className="pdp-options-dropdown">
                                                        <button onClick={handleReport}>
                                                            <Flag size={14} /> Report
                                                        </button>
                                                        <button className="pdp-danger" onClick={handleBlock}>
                                                            <UserX size={14} /> Block
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* View Profile */}
                                    <button
                                        className="pdp-view-profile-btn"
                                        onClick={() => creator?._id && navigate(`/user/${creator._id}`)}
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ) : (
                                /* Creator skeleton while loading separately */
                                <div className="pdp-creator-panel pdp-creator-skeleton">
                                    <div className="pdp-shimmer-avatar"></div>
                                    <div className="pdp-shimmer-name"></div>
                                    <div className="pdp-shimmer-line"></div>
                                    <div className="pdp-shimmer-line short"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── FULL-WIDTH — More Collections from Creator ── */}
                    {creator && (
                        <div className="pdp-more-section">
                            <div className="pdp-more-header">
                                <Grid3X3 size={17} />
                                <h2 className="pdp-more-title">
                                    More from{' '}
                                    <span className="pdp-more-accent">{creatorName}</span>
                                </h2>
                            </div>

                            {creatorCollections.length > 0 ? (
                                <div className="pdp-collections-scroll">
                                    {creatorCollections.map((col) => (
                                        <div key={col._id || col.id} className="pdp-col-wrap">
                                            <CollectionCard
                                                collection={col}
                                                isOwner={false}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="pdp-no-collections">
                                    <Layers size={28} strokeWidth={1.5} />
                                    <p>No public collections yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {!isAuthenticated && <Footer />}

            {snackbar.show && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar({ ...snackbar, show: false })}
                />
            )}

            {creator && (
                <FollowListModal
                    isOpen={followModal.isOpen}
                    onClose={() => setFollowModal({ ...followModal, isOpen: false })}
                    userId={creator._id || creator.id}
                    type={followModal.type}
                    username={creator.username}
                />
            )}
        </>
    );
};

export default ProductDetailPage;
