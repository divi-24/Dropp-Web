import React, { useState, useEffect } from 'react';
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
    ExternalLink,
    LayoutGrid,
    Calendar
} from 'lucide-react';
import CollectionService from '../core/services/CollectionService';
import UserService from '../core/services/UserService';
import EditCollectionModal from '../components/EditCollectionModal';
import AddProductModal from '../components/AddProductModal';
import ProductCard from '../components/ProductCard';
import Snackbar from '../components/Snackbar';
import Footer from '../components/Footer';
import { ShimmerCollectionDetail } from '../components/Shimmer';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../core/config/apiConfig';
import '../styles/CollectionDetailPage.css';
import '../styles/ProductMasonryGrid.css';

const CollectionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followsMe, setFollowsMe] = useState(false);

    // Get creator info from collection
    const creator = collection?.createdBy;

    // Determine if current user is the owner - STRICT check
    const currentUserId = user?.id || user?._id;
    const collectionOwnerId = collection?.createdBy?._id || collection?.createdBy?.id;
    const isOwner = isAuthenticated && currentUserId && collectionOwnerId && (currentUserId === collectionOwnerId);

    useEffect(() => {
        fetchCollection();
    }, [id, isAuthenticated]);

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

            // Check if current user has liked
            if (isAuthenticated && user) {
                const userId = user.id || user._id;
                const hasLiked = collectionData?.likes?.some(likeId => likeId === userId || likeId?._id === userId);
                setIsLiked(!!hasLiked);

                // Check follow state from creator data
                const creatorData = collectionData?.createdBy;
                if (creatorData) {
                    const followers = creatorData.followers || [];
                    setIsFollowing(followers.some(f => (f?._id || f) === userId));

                    const theirFollowing = creatorData.following || [];
                    setFollowsMe(theirFollowing.some(f => (f?._id || f) === userId));
                }
            }
        } catch (error) {
            console.error('Failed to fetch collection:', error);
            setSnackbar({ show: true, message: 'Failed to load collection', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        if (!id) return;
        try {
            const data = await CollectionService.getProducts(id);
            // Handle valid response structures: data.results (paginated object), data (array), or productList inside data
            const productList = data?.results || data?.products || (Array.isArray(data) ? data : []);
            console.log('Fetched products:', productList); // Debugging
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
        const url = `${window.location.origin}/c/${id}`;
        if (navigator.share) {
            navigator.share({
                title: collection?.title || collection?.name,
                text: collection?.desc,
                url: url,
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(url);
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

        if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
            return;
        }

        setShowMenu(false);
        try {
            await CollectionService.deleteCollection(id);
            setSnackbar({ show: true, message: 'Collection deleted successfully', type: 'success' });
            setTimeout(() => {
                navigate('/profile/me');
            }, 1000);
        } catch (error) {
            console.error('Failed to delete collection:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete collection';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        }
    };

    const handleAddProducts = () => {
        if (!isOwner) return;
        setIsAddProductModalOpen(true);
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/signup');
            return;
        }

        // Optimistic update
        const previousIsLiked = isLiked;
        const previousLikeCount = likeCount;

        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            console.log('Calling likeCollection API for id:', id);
            await CollectionService.likeCollection(id);
            console.log('likeCollection API success');
        } catch (error) {
            console.error('Failed to like collection:', error);
            console.log('Reverting optimistic update due to error');
            // Revert on error
            setIsLiked(previousIsLiked);
            setLikeCount(previousLikeCount);
            setSnackbar({ show: true, message: 'Failed to like collection', type: 'error' });
        }
    };

    const handleFollow = async () => {
        if (!isAuthenticated) {
            navigate('/signup');
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

    const handleCreatorClick = () => {
        if (creator?._id) {
            navigate(`/user/${creator._id}`);
        }
    };

    const handleUpdate = () => {
        fetchCollection();
    };

    const handleProductAdded = () => {
        fetchCollection();
        fetchProducts();
    };

    const getImageUrl = (url) => {
        if (!url) return API_CONFIG.BASE_URL + '/images/default.webp';
        if (url.startsWith('http')) return url;

        // Ensure proper encoding of filename
        const cleanUrl = url.split('/').map(part => encodeURIComponent(part)).join('/');

        return API_CONFIG.BASE_URL + cleanUrl.replace(/%2F/g, '/');
    };

    const formatCount = (count) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count?.toString() || '0';
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
                <h2>Collection not found</h2>
                <p>This collection may have been deleted or doesn't exist.</p>
                {isAuthenticated ? (
                    <button onClick={() => navigate(-1)} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                ) : (
                    <Link to="/landing" className="back-link">
                        <ArrowLeft size={16} />
                        Go to Home
                    </Link>
                )}
            </div>
        );
    }

    const collectionName = collection.title || collection.name;
    const displayImage = getImageUrl(collection.displayImageUrl || '/placeholder.jpg');
    const creatorImage = getImageUrl(creator?.profileImageUrl);

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
                    <button
                        onClick={() => navigate(-1)}
                        className="back-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>

                    {/* Creator Info Card - Always show with correct styling */}
                    {creator && (
                        <div className="creator-card-section">
                            <div className="creator-card-left" onClick={handleCreatorClick}>
                                <img
                                    src={creatorImage}
                                    alt={creator.fullName || creator.username}
                                    className="creator-card-avatar"
                                    onError={(e) => { e.target.src = API_CONFIG.BASE_URL + '/images/default.webp'; }}
                                />
                                <div className="creator-card-info">
                                    <h3 className="creator-card-name">{creator.fullName || creator.username}</h3>
                                    <span className="creator-card-username">@{creator.username}</span>
                                    {creator.bio && (
                                        <span className="creator-card-bio">{creator.bio}</span>
                                    )}
                                    <span className="creator-card-followers">{formatCount(creator.followers?.length || creator.followers || 0)} followers</span>
                                </div>
                            </div>
                            {!isOwner && (
                                <button
                                    className={`creator-follow-btn ${isFollowing ? 'following' : ''}`}
                                    onClick={handleFollow}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserCheck size={16} />
                                            Following
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={16} />
                                            {followsMe ? 'Follow Back' : 'Follow'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Collection Header */}
                    <div className="collection-header">
                        <div className="collection-info">
                            <h1 className="collection-title">{collectionName}</h1>
                            {collection.desc && (
                                <p className="collection-description">{collection.desc}</p>
                            )}
                            <div className="collection-stats-row">
                                <span className="collection-stat-badge">
                                    <Heart size={14} /> {likeCount} likes
                                </span>
                                <span className="collection-stat-badge">
                                    <LayoutGrid size={14} /> {products?.length || collection.products?.length || 0} products
                                </span>
                                {collection.createdAt && (
                                    <span className="collection-stat-badge">
                                        <Calendar size={14} /> {new Date(collection.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="collection-actions">
                            {/* Like button */}
                            <button
                                className={`action-btn-label ${isLiked ? 'liked' : ''}`}
                                onClick={handleLike}
                            >
                                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                                <span>{isLiked ? 'Liked' : 'Like'}</span>
                            </button>

                            {/* Share button */}
                            <button
                                className="action-btn-label"
                                onClick={handleShare}
                            >
                                <Share2 size={18} />
                                <span>Share</span>
                            </button>

                            {/* Owner-only controls */}
                            {isOwner && (
                                <>
                                    <button
                                        className="action-btn-label primary"
                                        onClick={handleAddProducts}
                                    >
                                        <Plus size={18} />
                                        <span>Add</span>
                                    </button>

                                    <div className="menu-container">
                                        <button
                                            className="action-btn-label"
                                            onClick={() => setShowMenu(!showMenu)}
                                        >
                                            <MoreHorizontal size={18} />
                                            <span>More</span>
                                        </button>

                                        {showMenu && (
                                            <div className="dropdown-menu">
                                                <button onClick={handleEdit} className="menu-item">
                                                    <Edit size={16} />
                                                    Edit Collection
                                                </button>
                                                <button onClick={handleDelete} className="menu-item delete-item">
                                                    <Trash2 size={16} />
                                                    Delete Collection
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="collection-content">
                        <h3 className="section-title">Products</h3>

                        {/* Product Grid */}
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

                    {/* CTA Section for unauthenticated users */}
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

                {/* Edit Modal - Only render for owners */}
                {isOwner && (
                    <EditCollectionModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        collection={collection}
                        onUpdate={handleUpdate}
                    />
                )}

                {/* Add Product Modal */}
                {isOwner && (
                    <AddProductModal
                        isOpen={isAddProductModalOpen}
                        onClose={() => setIsAddProductModalOpen(false)}
                        collectionId={id}
                        onProductAdded={handleProductAdded}
                    />
                )}

                {/* Snackbar */}
                {snackbar.show && (
                    <Snackbar
                        message={snackbar.message}
                        type={snackbar.type}
                        onClose={() => setSnackbar({ ...snackbar, show: false })}
                    />
                )}
            </motion.div>

            {/* Footer for public view */}
            {!isAuthenticated && <Footer />}
        </>
    );
};

export default CollectionDetailPage;
