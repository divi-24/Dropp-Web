import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Share2,
    MoreHorizontal,
    Edit,
    Trash2,
    Plus,
    Heart,
    UserPlus,
    UserCheck,
    Package,
    LayoutGrid,
    Calendar,
    Flag,
    UserX,
    Check,
    ExternalLink
} from 'lucide-react';
import CollectionService from '../core/services/CollectionService';
import UserService from '../core/services/UserService';
import EditCollectionModal from '../components/EditCollectionModal';
import AddProductModal from '../components/AddProductModal';
import ProductCard from '../components/ProductCard';
import Snackbar from '../components/Snackbar';
import Footer from '../components/Footer';
import FollowListModal from '../components/FollowListModal';
import { ShimmerCollectionDetail } from '../components/Shimmer';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../core/config/apiConfig';
import '../styles/CollectionDetailPage.css';
import '../styles/ProductMasonryGrid.css';
import '../styles/Profile.css';

const CollectionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followsMe, setFollowsMe] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [creatorCollectionsCount, setCreatorCollectionsCount] = useState(0);
    const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers' });
    const [copied, setCopied] = useState(false);

    const optionsRef = useRef(null);

    // Get creator info
    const [creator, setCreator] = useState(null);

    // Determine if current user is the owner
    const currentUserId = user?.id || user?._id;
    const collectionOwnerId = collection?.createdBy?._id || collection?.createdBy?.id || creator?._id || creator?.id;
    const isOwner = isAuthenticated && currentUserId && collectionOwnerId && (currentUserId === collectionOwnerId);

    useEffect(() => {
        fetchCollection();
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

    const fetchCollection = async () => {
        try {
            setLoading(true);
            let data;
            if (isAuthenticated) {
                data = await CollectionService.getCollectionById(id);
            } else {
                data = await CollectionService.getPublicCollection(id);
            }

            const collectionData = data?.result || data;
            setCollection(collectionData);
            setLikeCount(collectionData?.likes?.length || 0);

            if (isAuthenticated && user) {
                const userId = user.id || user._id;
                const hasLiked = collectionData?.likes?.some(likeId => likeId === userId || likeId?._id === userId);
                setIsLiked(!!hasLiked);
            }

            const creatorId = collectionData?.createdBy?._id || collectionData?.createdBy?.id || collectionData?.createdBy;
            if (creatorId) {
                fetchCreatorData(creatorId);
            }

        } catch (error) {
            console.error('Failed to fetch collection:', error);
            setSnackbar({ show: true, message: 'Failed to load collection', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchCreatorData = async (creatorId) => {
        try {
            const [userData, collectionsData] = await Promise.allSettled([
                UserService.getUserById(creatorId),
                CollectionService.getUserCollections(creatorId)
            ]);

            if (userData.status === 'fulfilled' && userData.value) {
                const creatorData = userData.value;
                setCreator(creatorData);
                setFollowerCount(typeof creatorData.followers === 'number' ? creatorData.followers : (creatorData.followers?.length || 0));

                if (isAuthenticated && user) {
                    const userId = user.id || user._id;
                    if (creatorData.isFollowing !== undefined) {
                        setIsFollowing(creatorData.isFollowing);
                    } else if (Array.isArray(creatorData.followers)) {
                        setIsFollowing(creatorData.followers.some(f => (f?._id || f) === userId));
                    }
                    
                    if (Array.isArray(creatorData.following)) {
                        setFollowsMe(creatorData.following.some(f => (f?._id || f) === userId));
                    }
                }
            }

            if (collectionsData.status === 'fulfilled') {
                setCreatorCollectionsCount(collectionsData.value?.length || 0);
            }
        } catch (error) {
            console.error('Failed to fetch creator data:', error);
            if (collection?.createdBy) {
                setCreator(collection.createdBy);
            }
        }
    };

    const fetchProducts = async () => {
        if (!id) return;
        try {
            const data = await CollectionService.getProducts(id);
            const productList = data?.results || data?.products || (Array.isArray(data) ? data : []);
            setProducts(productList);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProducts();
        }
    }, [id]);

    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: collection?.title || collection?.name,
                text: collection?.desc,
                url: url,
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setSnackbar({ show: true, message: 'Link copied to clipboard!', type: 'success' });
        }
    };

    const handleEdit = () => {
        if (!isOwner) return;
        setShowMenu(false);
        setIsEditModalOpen(true);
    };

    const handleDelete = async () => {
        if (!isOwner) return;
        if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) return;

        setShowMenu(false);
        try {
            await CollectionService.deleteCollection(id);
            setSnackbar({ show: true, message: 'Collection deleted successfully', type: 'success' });
            setTimeout(() => navigate('/profile/me'), 1000);
        } catch (error) {
            console.error('Failed to delete collection:', error);
            setSnackbar({ show: true, message: 'Failed to delete collection', type: 'error' });
        }
    };

    const handleAddProducts = () => {
        if (!isOwner) return;
        setIsAddProductModalOpen(true);
    };

    const handleLike = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        const prevIsLiked = isLiked;
        const prevLikeCount = likeCount;
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        try {
            await CollectionService.likeCollection(id);
        } catch (error) {
            setIsLiked(prevIsLiked);
            setLikeCount(prevLikeCount);
            setSnackbar({ show: true, message: 'Failed to like collection', type: 'error' });
        }
    };

    const handleFollow = async () => {
        if (!isAuthenticated) { navigate('/signup'); return; }
        const prevFollowing = isFollowing;
        const prevCount = followerCount;
        setIsFollowing(!isFollowing);
        setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
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
            setFollowerCount(prevCount);
            setSnackbar({ show: true, message: 'Failed to update follow', type: 'error' });
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

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const cleanUrl = url.split('/').map(part => encodeURIComponent(part)).join('/');
        return API_CONFIG.BASE_URL + cleanUrl.replace(/%2F/g, '/');
    };

    const formatCount = (count) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count?.toString() || '0';
    };

    const handleUpdate = () => {
        fetchCollection();
    };

    const handleProductAdded = () => {
        fetchCollection();
        fetchProducts();
    };

    if (loading) {
        return (
            <div className={`collection-detail-page ${!isAuthenticated ? 'public-view' : ''}`}>
                <div className="collection-detail-container">
                    <ShimmerCollectionDetail />
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="collection-detail-error">
                <Package size={56} strokeWidth={1} />
                <h2>Collection not found</h2>
                <p>This collection may have been deleted or doesn't exist.</p>
                <button onClick={() => navigate(-1)} className="back-link">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    const collectionName = collection.title || collection.name;
    const creatorName = creator?.fullName || creator?.username || 'Unknown Creator';
    const creatorUsername = creator?.username;
    const creatorAvatar = getImageUrl(creator?.profileImageUrl);
    const creatorBio = creator?.bio;
    const creatorFollowingCount = typeof creator?.following === 'number' ? creator.following : (creator?.following?.length || 0);

    return (
        <>
            <motion.div
                className={`collection-detail-page ${!isAuthenticated ? 'public-view' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="collection-detail-container">
                    <div className="collection-page-header">
                        <button className="back-btn-round" onClick={() => navigate(-1)} aria-label="Go back">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="header-products-title">Curated Products</h2>
                    </div>

                    <div className="collection-layout">
                        {/* ── LEFT COLUMN — Products ── */}
                        <div className="collection-left">
                            <div className="collection-content-section">
                                {products && products.length > 0 ? (
                                    <div className="product-pinterest-grid">
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product._id || product.id}
                                                product={product}
                                                onDelete={(deletedId) => {
                                                    setProducts(prev => prev.filter(p => (p._id || p.id) !== deletedId));
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-products-card">
                                        <div className="empty-products-icon">
                                            <Package size={48} strokeWidth={1.5} />
                                        </div>
                                        <h4 className="empty-products-title">No products yet</h4>
                                        <p className="empty-products-text">
                                            {isOwner
                                                ? 'Start adding products to your collection to share with others.'
                                                : 'This collection doesn\'t have any products yet.'
                                            }
                                        </p>
                                        {isOwner && (
                                            <button
                                                className="add-products-btn"
                                                onClick={handleAddProducts}
                                            >
                                                <Plus size={18} />
                                                Add Products
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN — Collection Info & Creator Panel ── */}
                        <div className="collection-right">
                            {/* REFINED COLLECTION INFO CARD */}
                            <div className="collection-info-card">
                                <h1 className="collection-title-side">{collectionName}</h1>
                                {collection.desc && (
                                    <p className="collection-desc-side">{collection.desc}</p>
                                )}
                                
                                <div className="collection-stats-side">
                                    <div className="side-stat">
                                        <Heart size={14} />
                                        <span>{likeCount} likes</span>
                                    </div>
                                    <div className="side-stat">
                                        <LayoutGrid size={14} />
                                        <span>{products?.length || collection.products?.length || 0} products</span>
                                    </div>
                                    {collection.createdAt && (
                                        <div className="side-stat">
                                            <Calendar size={14} />
                                            <span>{new Date(collection.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="collection-actions-side">
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

                                    {isOwner && (
                                        <div className="pdp-options-wrap">
                                            <button 
                                                className="pdp-options-btn"
                                                onClick={() => setShowMenu(!showMenu)}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                            {showMenu && (
                                                <div className="pdp-options-dropdown" style={{ bottom: 'auto', top: 'calc(100% + 8px)' }}>
                                                    <button onClick={handleEdit}>
                                                        <Edit size={14} /> Edit
                                                    </button>
                                                    <button className="pdp-danger" onClick={handleDelete}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isOwner && (
                                    <button 
                                        className="pdp-action-btn pdp-visit-btn full-width"
                                        onClick={handleAddProducts}
                                        style={{ marginTop: '0.75rem' }}
                                    >
                                        <Plus size={16} />
                                        Add Products
                                    </button>
                                )}
                            </div>

                            {/* IDENTICAL CREATOR PANEL */}
                            {creator ? (
                                <div className="pdp-creator-panel">
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
                                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
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

                                    <div
                                        className="pdp-creator-identity"
                                        onClick={() => creator?._id && navigate(`/user/${creator._id}`)}
                                    >
                                        <h3 className="pdp-creator-name">{creatorName}</h3>
                                        <span className="pdp-creator-username">@{creatorUsername}</span>
                                    </div>

                                    {creatorBio && (
                                        <p className="pdp-creator-bio">{creatorBio}</p>
                                    )}

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
                                            <span className="pdp-stat-value">{formatCount(creator?.following?.length || creator?.following || 0)}</span>
                                            <span className="pdp-stat-label">Following</span>
                                        </div>
                                        <div className="pdp-stat-divider" />
                                        <div className="pdp-stat">
                                            <span className="pdp-stat-value">{formatCount(creatorCollectionsCount)}</span>
                                            <span className="pdp-stat-label">Collections</span>
                                        </div>
                                    </div>

                                    {!isOwner && (
                                        <div className="pdp-creator-actions">
                                            <button
                                                className={`pdp-follow-btn${isFollowing ? ' following' : ''}`}
                                                onClick={handleFollow}
                                            >
                                                {isFollowing ? (
                                                    <><UserCheck size={16} /> Following</>
                                                ) : (
                                                    <><UserPlus size={16} /> {followsMe ? 'Follow Back' : 'Follow'}</>
                                                )}
                                            </button>

                                            <div className="pdp-options-wrap" ref={optionsRef}>
                                                <button 
                                                    className="pdp-options-btn"
                                                    onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
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

                                    <button
                                        className="pdp-view-profile-btn"
                                        onClick={() => creator?._id && navigate(`/user/${creator._id}`)}
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ) : (
                                <div className="pdp-creator-panel pdp-creator-skeleton">
                                    <div className="pdp-shimmer-avatar"></div>
                                    <div className="pdp-shimmer-name"></div>
                                    <div className="pdp-shimmer-line"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isAuthenticated && (
                        <div className="public-cta-section">
                            <div className="cta-content">
                                <UserPlus size={32} />
                                <h3>Discover More Collections</h3>
                                <p>Create an account to explore curated collections from your favorite creators</p>
                                <div className="cta-buttons">
                                    <Link to="/signup" className="cta-btn primary">
                                        Create Account
                                    </Link>
                                    <Link to="/login" className="cta-btn secondary">
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isOwner && (
                    <EditCollectionModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        collection={collection}
                        onUpdate={handleUpdate}
                    />
                )}

                {isOwner && (
                    <AddProductModal
                        isOpen={isAddProductModalOpen}
                        onClose={() => setIsAddProductModalOpen(false)}
                        collectionId={id}
                        onProductAdded={handleProductAdded}
                    />
                )}

                {snackbar.show && (
                    <Snackbar
                        message={snackbar.message}
                        type={snackbar.type}
                        onClose={() => setSnackbar({ ...snackbar, show: false })}
                    />
                )}
            </motion.div>

            {!isAuthenticated && <Footer />}

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

export default CollectionDetailPage;
