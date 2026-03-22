import React, { useState, useEffect } from 'react';
import { Grid, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import { useData } from '../contexts/DataContext';
import CollectionService from '../core/services/CollectionService';
import CollectionCard from './CollectionCard';
import EditCollectionModal from './EditCollectionModal';
import Snackbar from './Snackbar';
import '../styles/Profile.css';

const ProfileTabs = ({ collections, sharedCollections = [], activeTab: initialTab = 'collections', onRefresh, isOwner = true, onUpdateCollection }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [sharePopupId, setSharePopupId] = useState(null);
    const [copied, setCopied] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();
    const { removeCollection, updateCollection } = useData();

    const tabs = [
        { id: 'collections', label: 'Collections', icon: Grid },
        ...(isOwner ? [{ id: 'shared', label: 'Shared', icon: Users }] : [])
    ];

    // Close popups when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuId(null);
            setSharePopupId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleCollectionClick = (collectionId, e) => {
        if (
            e.target.closest('.board-actions')
            || e.target.closest('.share-popup')
            || e.target.closest('.board-card-footer-actions')
        ) return;
        navigate(`/c/${collectionId}`);
    };

    const handleShareClick = (e, collectionId) => {
        e.stopPropagation();
        setOpenMenuId(null);
        setSharePopupId(sharePopupId === collectionId ? null : collectionId);
        setCopied(false);
    };

    const handleCopyLink = (e, collection) => {
        e.stopPropagation();
        const collectionId = collection._id || collection.id;
        // Include base path and hash for HashRouter
        const basePath = import.meta.env.BASE_URL || '/';
        const url = `${window.location.origin}${basePath}#/c/${collectionId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => {
            setSharePopupId(null);
            setCopied(false);
        }, 1500);
    };

    const handleMenuToggle = (e, collectionId) => {
        e.stopPropagation();
        setSharePopupId(null);
        setOpenMenuId(openMenuId === collectionId ? null : collectionId);
    };

    const handleEdit = (e, collection) => {
        e.stopPropagation();
        setOpenMenuId(null);
        setEditingCollection(collection);
    };

    const handleDeleteClick = (e, collection) => {
        e.stopPropagation();
        setOpenMenuId(null);
        setSnackbar({
            show: true,
            message: `Delete "${collection.title}"?`,
            type: 'warning',
            action: {
                label: 'Delete',
                onClick: () => confirmDelete(collection)
            }
        });
    };

    const confirmDelete = async (collection) => {
        try {
            const collectionId = collection._id || collection.id;
            await CollectionService.deleteCollection(collectionId);
            removeCollection(collectionId);
            setSnackbar({ show: true, message: 'Collection deleted', type: 'success' });
        } catch (error) {
            console.error('Failed to delete:', error);
            setSnackbar({ show: true, message: 'Failed to delete collection', type: 'error' });
        }
    };

    const handleEditUpdate = (updatedCollection) => {
        const collectionId = editingCollection._id || editingCollection.id;

        // Use parent's update handler for instant local state update
        if (onUpdateCollection) {
            onUpdateCollection(collectionId, updatedCollection);
        } else {
            // Fallback to global context
            updateCollection(collectionId, updatedCollection);
        }

        setEditingCollection(null);
        if (onRefresh) onRefresh();
    };

    // Generate placeholder images for Pinterest-style grid
    const getGridImages = (collection) => {
        const mainImage = collection.displayImageUrl
            ? (collection.displayImageUrl.startsWith('http')
                ? collection.displayImageUrl
                : API_CONFIG.BASE_URL + collection.displayImageUrl)
            : PLACEHOLDER_IMAGE;

        return [mainImage, mainImage, mainImage];
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'collections':
                return (
                    <div className="pinterest-grid">
                        {collections && collections.length > 0 ? (
                            collections.map((collection) => (
                                <CollectionCard
                                    key={collection._id || collection.id}
                                    collection={collection}
                                    isOwner={isOwner}
                                    onUpdateCollection={isOwner ? onUpdateCollection : undefined}
                                    onEdit={isOwner ? (c) => {
                                        setEditingCollection(c);
                                    } : undefined}
                                    onDelete={isOwner ? (c) => {
                                        setSnackbar({
                                            show: true,
                                            message: `Delete "${c.title}"?`,
                                            type: 'warning',
                                            action: {
                                                label: 'Delete',
                                                onClick: () => confirmDelete(c)
                                            }
                                        });
                                    } : undefined}
                                />
                            ))
                        ) : (
                            <div className="profile-empty-state">
                                <Grid size={48} />
                                <p>No collections yet</p>
                                <span style={{ display: 'block', marginTop: '0.5rem' }}>Create your first collection to get started</span>
                            </div>
                        )}
                    </div>
                );

            case 'shared':
                return (
                    <div className="pinterest-grid">
                        {sharedCollections && sharedCollections.length > 0 ? (
                            sharedCollections.map((collection) => (
                                <CollectionCard
                                    key={collection._id || collection.id}
                                    collection={collection}
                                    isOwner={false}
                                />
                            ))
                        ) : (
                            <div className="profile-empty-state">
                                <Users size={48} />
                                <p>No shared collections</p>
                                <span style={{ display: 'block', marginTop: '0.5rem' }}>Collections shared with you will appear here</span>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="profile-tabs-container">
                <div className="profile-tabs">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`profile-tab ${activeTab === id ? 'active' : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                <div className="profile-tab-content">
                    {renderContent()}
                </div>
            </div>

            {editingCollection && (
                <EditCollectionModal
                    isOpen={!!editingCollection}
                    onClose={() => setEditingCollection(null)}
                    collection={editingCollection}
                    onUpdate={handleEditUpdate}
                />
            )}

            <Snackbar
                isVisible={snackbar.show}
                message={snackbar.message}
                type={snackbar.type}
                action={snackbar.action}
                onClose={() => setSnackbar({ ...snackbar, show: false })}
            />
        </>
    );
};

export default ProfileTabs;
