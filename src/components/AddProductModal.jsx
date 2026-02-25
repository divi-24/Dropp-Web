import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Link as LinkIcon, Image as ImageIcon, Type, FileText, Upload, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import CollectionService from '../core/services/CollectionService';
import ProductService from '../core/services/ProductService';
import { compressImage, isWithinSizeLimit, getTotalSizeMB } from '../utils/mediaUtils';
import Snackbar from './Snackbar';
import '../styles/CreateCollectionModal.css';

const AddProductModal = ({ isOpen, onClose, collectionId, onProductAdded, productToEdit = null }) => {
    const isEditMode = !!productToEdit;
    const [name, setName] = useState('');
    const [links, setLinks] = useState(['']);
    const [description, setDescription] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const [removedMediaIds, setRemovedMediaIds] = useState([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });

    const fileInputRef = useRef(null);

    // Pre-fill for edit mode
    React.useEffect(() => {
        if (isOpen && productToEdit) {
            setName(productToEdit.name || productToEdit.title || '');
            setDescription(productToEdit.desc || productToEdit.description || '');
            setRemovedMediaIds([]);

            // Handle links
            const productLinks = productToEdit.link ? productToEdit.link.split(',') : [''];
            setLinks(productLinks.length > 0 ? productLinks : ['']);

            const existingMedia = productToEdit.media || (productToEdit.image ? [productToEdit.image] : []) || [];
            if (existingMedia.length > 0) {
                const previews = existingMedia.map(item => {
                    const url = typeof item === 'object' ? item.url : item;
                    const id = typeof item === 'object' ? (item._id || item.id) : null;
                    const type = (typeof item === 'object' ? item.resourceType : (url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image')) || 'image';
                    
                    return {
                        url: url.startsWith('http') ? url : import.meta.env.VITE_API_BASE_URL + url,
                        type: type === 'video' || url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image',
                        name: 'Existing Media',
                        isExisting: true,
                        id: id
                    };
                });
                setMediaPreviews(previews);
            }
        } else if (isOpen && !productToEdit) {
            // Reset if opening in add mode
            resetForm();
        }
    }, [isOpen, productToEdit]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFilesSelection(files);
        }
    };

    const handleFilesSelection = (files) => {
        const newFiles = [];
        const newPreviews = [];
        const MAX_TOTAL_SIZE_MB = 80;

        // Calculate current total size
        const currentTotalSizeMB = getTotalSizeMB(mediaFiles);
        let additionalSizeMB = 0;

        files.forEach(file => {
            // Validate file type
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                setSnackbar({ show: true, message: 'Please upload image or video files only', type: 'error' });
                return;
            }

            additionalSizeMB += file.size / (1024 * 1024);
        });

        if (currentTotalSizeMB + additionalSizeMB > MAX_TOTAL_SIZE_MB) {
            setSnackbar({
                show: true,
                message: `Total media size cannot exceed ${MAX_TOTAL_SIZE_MB}MB. Current: ${currentTotalSizeMB.toFixed(1)}MB`,
                type: 'error'
            });
            return;
        }

        files.forEach(file => {
            // Check if it was a valid type (already checked above but for individual preview generation)
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;

            newFiles.push(file);
            newPreviews.push({
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'image',
                name: file.name
            });
        });

        setMediaFiles(prev => [...prev, ...newFiles]);
        setMediaPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFilesSelection(files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeMedia = (index) => {
        const previewToRemove = mediaPreviews[index];
        
        if (previewToRemove.isExisting) {
            if (previewToRemove.id) {
                setRemovedMediaIds(prev => [...prev, previewToRemove.id]);
            }
        } else {
            // It's a newly added file. We need to find its index in the mediaFiles array.
            // Since mediaPreviews and mediaFiles were updated together:
            // The index in mediaFiles = index - (count of existing items before this index)
            const existingBefore = mediaPreviews.slice(0, index).filter(p => p.isExisting).length;
            const fileIndex = index - existingBefore;
            setMediaFiles(prev => prev.filter((_, i) => i !== fileIndex));
        }

        setMediaPreviews(prev => {
            if (!previewToRemove.isExisting) {
                URL.revokeObjectURL(previewToRemove.url);
            }
            return prev.filter((_, i) => i !== index);
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeAllMedia = () => {
        mediaPreviews.forEach(preview => {
            if (!preview.isExisting) {
                URL.revokeObjectURL(preview.url);
            } else if (preview.id) {
                setRemovedMediaIds(prev => [...prev, preview.id]);
            }
        });
        setMediaFiles([]);
        setMediaPreviews([]);
        setCurrentMediaIndex(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleLinkChange = (index, value) => {
        const newLinks = [...links];
        newLinks[index] = value;
        setLinks(newLinks);
    };

    const handleAddLink = () => {
        setLinks([...links, '']);
    };

    const handleRemoveLink = (index) => {
        if (links.length > 1) {
            const newLinks = links.filter((_, i) => i !== index);
            setLinks(newLinks);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            setSnackbar({ show: true, message: 'Product name is required', type: 'error' });
            return;
        }

        const validLinks = links.filter(l => l.trim() !== '');
        if (validLinks.length === 0) {
            setSnackbar({ show: true, message: 'At least one product link is required', type: 'error' });
            return;
        }

        if (mediaFiles.length === 0 && mediaPreviews.length === 0) {
            setSnackbar({ show: true, message: 'Please upload at least one image or video', type: 'error' });
            return;
        }
        if (!description.trim()) {
            setSnackbar({ show: true, message: 'Description is required', type: 'error' });
            return;
        }

        // Validate all non-empty links
        for (const link of validLinks) {
            try {
                new URL(link);
            } catch (_) {
                setSnackbar({ show: true, message: `Invalid URL: ${link}`, type: 'error' });
                return;
            }
        }

        setLoading(true);
        try {
            // 1. Compress image files (videos are kept as is)
            const processedFiles = await Promise.all(
                mediaFiles.map(async (file) => {
                    if (file.type.startsWith('image/')) {
                        return await compressImage(file);
                    }
                    return file;
                })
            );

            // 2. Final size check after compression
            if (!isWithinSizeLimit(processedFiles, 80)) {
                setSnackbar({
                    show: true,
                    message: `Total media size exceeds 80MB limit even after compression. Current: ${getTotalSizeMB(processedFiles).toFixed(1)}MB`,
                    type: 'error'
                });
                setLoading(false);
                return;
            }

            let productId;
            
            // 3. Create or Update Product Details
            if (isEditMode) {
                productId = productToEdit._id || productToEdit.id;
                
                // --- HANDLE UPDATES ---
                const promises = [];

                // A. Check if details changed
                const detailsChanged = name.trim() !== (productToEdit.name || productToEdit.title) ||
                    validLinks.join(',') !== productToEdit.link ||
                    description.trim() !== (productToEdit.desc || productToEdit.description);

                if (detailsChanged) {
                    const updateData = {
                        name: name.trim(),
                        link: validLinks.join(','),
                        desc: description.trim()
                    };
                    promises.push(ProductService.updateProduct(productId, updateData));
                }

                // B. Handle Media Deletions
                if (removedMediaIds.length > 0) {
                    removedMediaIds.forEach(mediaId => {
                        promises.push(ProductService.deleteProductMedia(productId, mediaId));
                    });
                }

                // C. Handle New Media Additions
                if (processedFiles.length > 0) {
                    const mediaFormData = new FormData();
                    processedFiles.forEach(file => {
                        mediaFormData.append('media', file);
                    });
                    promises.push(ProductService.addProductMedia(productId, mediaFormData));
                }

                if (promises.length > 0) {
                    await Promise.all(promises);
                }
            } else {
                // --- HANDLE CREATION ---
                // For NEW products, call create product API with media in the body as multipart/form-data
                const createFormData = new FormData();
                createFormData.append('name', name.trim());
                createFormData.append('link', validLinks.join(','));
                createFormData.append('desc', description.trim());
                
                // Append all media files to the creation request
                processedFiles.forEach(file => {
                    createFormData.append('media', file);
                });

                const createdProduct = await CollectionService.addProduct(collectionId, createFormData);
                productId = createdProduct.result?._id || createdProduct._id;
            }

            setSnackbar({ 
                show: true, 
                message: isEditMode ? 'Product updated successfully!' : 'Product added successfully!', 
                type: 'success' 
            });

            setTimeout(() => {
                resetForm();
                if (onProductAdded) onProductAdded();
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Failed to process product:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save product. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setLinks(['']);
        setDescription('');
        setLinks(['']);
        setDescription('');
        removeAllMedia();
        setCurrentMediaIndex(0);
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className="create-collection-modal modal-landscape"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>{isEditMode ? 'Edit Product' : 'Add Product'}</h2>
                        <button
                            className="modal-close-btn"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-form-wrapper">
                        <div className="modal-body-content landscape-layout">
                            {/* LEFT PANEL: MEDIA */}
                            <div className="form-left-panel">
                                <div className="form-group media-group">
                                    <label style={{ marginBottom: '10px' }}>
                                        <ImageIcon size={16} />
                                        Media *
                                    </label>

                                    {mediaPreviews.length > 0 ? (
                                        <div className="media-carousel-container">
                                            {/* Media Display */}
                                            <div className="carousel-media-wrapper">
                                                {mediaPreviews[currentMediaIndex].type === 'video' ? (
                                                    <video
                                                        src={mediaPreviews[currentMediaIndex].url}
                                                        className="carousel-media"
                                                        controls
                                                    />
                                                ) : (
                                                    <img
                                                        src={mediaPreviews[currentMediaIndex].url}
                                                        alt={`Preview ${currentMediaIndex + 1}`}
                                                        className="carousel-media"
                                                    />
                                                )}

                                                {/* Counter Badge */}
                                                <div className="carousel-counter">
                                                    {currentMediaIndex + 1}/{mediaPreviews.length}
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    className="carousel-remove-btn"
                                                    onClick={() => {
                                                        removeMedia(currentMediaIndex);
                                                        if (currentMediaIndex >= mediaPreviews.length - 1 && currentMediaIndex > 0) {
                                                            setCurrentMediaIndex(currentMediaIndex - 1);
                                                        }
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>

                                            {/* Navigation Controls */}
                                            {mediaPreviews.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="carousel-nav-btn prev"
                                                        onClick={() => setCurrentMediaIndex(prev => Math.max(0, prev - 1))}
                                                        disabled={currentMediaIndex === 0}
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="carousel-nav-btn next"
                                                        onClick={() => setCurrentMediaIndex(prev => Math.min(mediaPreviews.length - 1, prev + 1))}
                                                        disabled={currentMediaIndex === mediaPreviews.length - 1}
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </>
                                            )}

                                            {/* Add More Button (Floating) */}
                                            <button
                                                type="button"
                                                className="carousel-add-btn"
                                                onClick={() => fileInputRef.current.click()}
                                                disabled={loading}
                                                aria-label="Add more media"
                                                style={{
                                                    fontSize: 0, /* Ensure no residual text height */
                                                }}
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="file-upload-area"
                                            onClick={() => fileInputRef.current.click()}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <Plus size={48} className="file-upload-icon" style={{ color: 'var(--text-secondary)' }} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        accept="image/*,video/*"
                                        multiple
                                    />
                                </div>
                            </div>

                            {/* RIGHT PANEL: DETAILS */}
                            <div className="form-right-panel">
                                <div className="form-fields-scroll">
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            <Type size={16} />
                                            Name *
                                        </label>
                                        <input
                                            id="product-name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Product Name"
                                            disabled={loading}
                                            className="compact-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <LinkIcon size={16} />
                                            Links *
                                        </label>
                                        {links.map((link, index) => (
                                            <div key={index} className="link-input-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input
                                                    type="url"
                                                    value={link}
                                                    onChange={(e) => handleLinkChange(index, e.target.value)}
                                                    placeholder="Product URL"
                                                    disabled={loading}
                                                    className="compact-input"
                                                    style={{ flex: 1 }}
                                                />
                                                {links.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLink(index)}
                                                        className="remove-link-btn"
                                                        disabled={loading}
                                                        style={{
                                                            background: 'var(--bg-tertiary)',
                                                            border: '1px solid var(--border-color)',
                                                            color: 'var(--text-secondary)',
                                                            borderRadius: 'var(--radius-md)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '36px'
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={handleAddLink}
                                            className="add-link-btn"
                                            disabled={loading}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--accent-blue)',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                marginTop: '0.25rem'
                                            }}
                                        >
                                            <Plus size={14} /> Add another link
                                        </button>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="product-desc">
                                            <FileText size={16} />
                                            Description *
                                        </label>
                                        <textarea
                                            id="product-desc"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Why do you love this?"
                                            disabled={loading}
                                            rows={4}
                                            className="compact-input"
                                        />
                                    </div>
                                </div>
                                <div className="right-panel-actions">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="spinner" size={16} />
                                                Adding...
                                            </>
                                        ) : (
                                            isEditMode ? 'Update' : 'Add'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </motion.div>

                {snackbar.show && (
                    <Snackbar
                        message={snackbar.message}
                        type={snackbar.type}
                        onClose={() => setSnackbar({ ...snackbar, show: false })}
                    />
                )}
            </motion.div>
        </AnimatePresence >
    );
};

export default AddProductModal;
// Fixed mediaFile reference error
