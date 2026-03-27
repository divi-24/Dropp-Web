import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader } from 'lucide-react';
import CollectionService from '../core/services/CollectionService';
import Snackbar from './Snackbar';
import '../styles/CreateCollectionModal.css';

const EditCollectionModal = ({ isOpen, onClose, collection, onUpdate }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (collection) {
            setName(collection.title || '');
            setDesc(collection.desc || '');
        }
    }, [collection]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setSnackbar({ show: true, message: 'Collection name is required', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await CollectionService.updateCollection(collection._id, name, desc);
            setSnackbar({ show: true, message: 'Collection updated successfully!', type: 'success' });

            // Notify parent component to refresh data instantly
            // Pass the updated partial data so parent can optimistically update
            onUpdate({ ...collection, title: name, desc: desc });

            setTimeout(() => {
                onClose();
            }, 500);
        } catch (error) {
            console.error('Failed to update collection:', error);
            setSnackbar({
                show: true,
                message: error.message || 'Failed to update collection. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
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
                    className="create-collection-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>Edit Collection</h2>
                        <button
                            className="modal-close-btn"
                            onClick={handleClose}
                            disabled={loading}
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label htmlFor="edit-collection-name">Collection Name *</label>
                            <input
                                id="edit-collection-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter collection name"
                                disabled={loading}
                                maxLength={100}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-collection-desc">Description</label>
                            <textarea
                                id="edit-collection-desc"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Enter collection description (optional)"
                                disabled={loading}
                                rows={4}
                                maxLength={500}
                            />
                        </div>

                        <div className="modal-actions">
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
                                        <Loader className="spinner" size={18} />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
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
        </AnimatePresence>
    );
};

export default EditCollectionModal;
