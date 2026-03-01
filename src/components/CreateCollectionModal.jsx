import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Lock, Globe, Search, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CollectionService from '../core/services/CollectionService';
import UserService from '../core/services/UserService';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Snackbar from './Snackbar';
import '../styles/CreateCollectionModal.css';
import '../styles/InviteMemberModal.css';

const CreateCollectionModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('create'); // 'create' | 'invite'
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [createdCollectionId, setCreatedCollectionId] = useState(null);

    // Invite state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [role, setRole] = useState('viewer');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [invitedUsers, setInvitedUsers] = useState([]);

    const searchTimeout = useRef(null);
    const navigate = useNavigate();
    const { addCollection, fetchCollections } = useData();
    const { user } = useAuth();
    const currentUserId = user?.id || user?._id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setSnackbar({ show: true, message: 'Collection title is required', type: 'error' });
            return;
        }
        if (!desc.trim()) {
            setSnackbar({ show: true, message: 'Collection description is required', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await CollectionService.createCollection(title, desc, isPrivate);
            const newCollection = response?.result || response?.collection || response?.data || response;
            const collectionId = newCollection?._id || newCollection?.id || response?._id || response?.id;

            if (newCollection && typeof newCollection === 'object') addCollection(newCollection);
            fetchCollections();

            if (isPrivate && collectionId) {
                setCreatedCollectionId(collectionId);
                setStep('invite');
            } else {
                onClose();
                navigate(`/c/${collectionId}`);
            }
        } catch (error) {
            console.error('Failed to create collection:', error);
            setSnackbar({
                show: true,
                message: error.response?.data?.message || error.message || 'Failed to create collection.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setSelectedUser(null);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!query.trim()) { setSearchResults([]); return; }

        searchTimeout.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = await UserService.searchUsers(query);
                const invitedIds = invitedUsers.map(u => u._id || u.id);
                setSearchResults(
                    results.filter(u => {
                        const uid = u._id || u.id;
                        return uid !== currentUserId && !invitedIds.includes(uid);
                    })
                );
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleInvite = async () => {
        if (!selectedUser || !createdCollectionId) return;
        setInviteLoading(true);
        try {
            await CollectionService.inviteMember(createdCollectionId, selectedUser._id || selectedUser.id, role);
            setInvitedUsers(prev => [...prev, { ...selectedUser, inviteRole: role }]);
            setSelectedUser(null);
            setRole('viewer');
        } catch (err) {
            setSnackbar({ show: true, message: 'Failed to send invite', type: 'error' });
        } finally {
            setInviteLoading(false);
        }
    };

    const handleDone = () => {
        onClose();
        navigate(`/c/${createdCollectionId}`);
    };

    const handleClose = () => {
        if (loading) return;
        if (step === 'invite') {
            handleDone();
            return;
        }
        setTitle('');
        setDesc('');
        setIsPrivate(false);
        setStep('create');
        setCreatedCollectionId(null);
        setInvitedUsers([]);
        onClose();
    };

    const getImageUrl = (url) => {
        if (!url || url.startsWith('http')) return url;
        return url;
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
                    onClick={e => e.stopPropagation()}
                >
                    {/* ── Step 1: Create ── */}
                    {step === 'create' && (
                        <>
                            <div className="modal-header">
                                <h2>Create Collection</h2>
                                <button className="modal-close-btn" onClick={handleClose} disabled={loading} aria-label="Close">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="collection-name">Collection Name *</label>
                                    <input
                                        id="collection-name"
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Enter collection name"
                                        disabled={loading}
                                        maxLength={100}
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="collection-desc">Description *</label>
                                    <textarea
                                        id="collection-desc"
                                        value={desc}
                                        onChange={e => setDesc(e.target.value)}
                                        placeholder="Enter collection description"
                                        disabled={loading}
                                        rows={4}
                                        maxLength={500}
                                    />
                                </div>

                                <div className="privacy-toggle-row">
                                    <div className="privacy-toggle-info">
                                        {isPrivate ? <Lock size={15} /> : <Globe size={15} />}
                                        <div>
                                            <span className="privacy-toggle-title">{isPrivate ? 'Private' : 'Public'}</span>
                                            <span className="privacy-toggle-desc">
                                                {isPrivate ? 'Only you (and invited members) can see this' : 'Anyone on Dropp can see this'}
                                            </span>
                                        </div>
                                    </div>
                                    <label className="toggle-switch" aria-label="Toggle privacy">
                                        <input
                                            type="checkbox"
                                            checked={isPrivate}
                                            onChange={e => setIsPrivate(e.target.checked)}
                                            disabled={loading}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={handleClose} disabled={loading}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? (
                                            <><Loader className="spinner" size={18} /> Creating…</>
                                        ) : isPrivate ? (
                                            <>Create & Invite <ArrowRight size={16} /></>
                                        ) : (
                                            'Create Collection'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ── Step 2: Invite (private collections only) ── */}
                    {step === 'invite' && (
                        <>
                            <div className="modal-header">
                                <div className="ccm-invite-header-text">
                                    <h2>Invite Members</h2>
                                    <p className="ccm-invite-subtitle">"{title}" was created. Add people to collaborate.</p>
                                </div>
                                <button className="modal-close-btn" onClick={handleClose} aria-label="Close">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-form ccm-invite-body">
                                {/* Search */}
                                {!selectedUser && (
                                    <div className="invite-search-wrap">
                                        <Search size={16} className="invite-search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search by username or name…"
                                            value={searchQuery}
                                            onChange={handleSearch}
                                            className="invite-search-input"
                                            autoFocus
                                        />
                                        {searchLoading && <Loader size={15} className="spinner invite-search-spinner" />}
                                    </div>
                                )}

                                {searchResults.length > 0 && !selectedUser && (
                                    <div className="invite-search-results">
                                        {searchResults.map(user => (
                                            <button
                                                key={user._id || user.id}
                                                className="invite-user-result"
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                <div className="invite-avatar">
                                                    {user.profileImageUrl ? (
                                                        <img src={getImageUrl(user.profileImageUrl)} alt={user.username} />
                                                    ) : (
                                                        <span>{user.username?.[0]?.toUpperCase() || '?'}</span>
                                                    )}
                                                </div>
                                                <div className="invite-user-meta">
                                                    <span className="invite-user-name">{user.fullName || user.username}</span>
                                                    <span className="invite-user-username">@{user.username}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {selectedUser && (
                                    <div className="invite-selected-wrap">
                                        <div className="invite-selected-user">
                                            <div className="invite-avatar">
                                                {selectedUser.profileImageUrl ? (
                                                    <img src={getImageUrl(selectedUser.profileImageUrl)} alt={selectedUser.username} />
                                                ) : (
                                                    <span>{selectedUser.username?.[0]?.toUpperCase() || '?'}</span>
                                                )}
                                            </div>
                                            <div className="invite-user-meta">
                                                <span className="invite-user-name">{selectedUser.fullName || selectedUser.username}</span>
                                                <span className="invite-user-username">@{selectedUser.username}</span>
                                            </div>
                                            <button className="invite-deselect-btn" onClick={() => { setSelectedUser(null); setSearchQuery(''); }} aria-label="Deselect">
                                                <X size={14} />
                                            </button>
                                        </div>

                                        <div className="invite-role-row">
                                            <label className="invite-role-select-label">Role</label>
                                            <select
                                                className="invite-role-select"
                                                value={role}
                                                onChange={e => setRole(e.target.value)}
                                            >
                                                <option value="viewer">Viewer — can view only</option>
                                                <option value="editor">Editor — can view &amp; edit</option>
                                            </select>
                                        </div>

                                        <button className="btn-primary invite-send-btn" onClick={handleInvite} disabled={inviteLoading}>
                                            {inviteLoading && <Loader size={15} className="spinner" />}
                                            {inviteLoading ? 'Sending…' : 'Send Invite'}
                                        </button>
                                    </div>
                                )}

                                {/* Invited users so far */}
                                {invitedUsers.length > 0 && (
                                    <div className="ccm-invited-list">
                                        <p className="invite-section-label">Invited ({invitedUsers.length})</p>
                                        {invitedUsers.map(u => (
                                            <div key={u._id || u.id} className="ccm-invited-item">
                                                <div className="invite-avatar">
                                                    {u.profileImageUrl ? (
                                                        <img src={getImageUrl(u.profileImageUrl)} alt={u.username} />
                                                    ) : (
                                                        <span>{u.username?.[0]?.toUpperCase() || '?'}</span>
                                                    )}
                                                </div>
                                                <div className="invite-user-meta">
                                                    <span className="invite-user-name">{u.fullName || u.username}</span>
                                                    <span className="invite-user-username">@{u.username}</span>
                                                </div>
                                                <span className={`invite-role-badge ${u.inviteRole}`}>
                                                    {u.inviteRole}
                                                </span>
                                                <Check size={14} className="ccm-invited-check" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="modal-actions ccm-invite-actions">
                                    <button type="button" className="btn-secondary" onClick={handleDone}>
                                        {invitedUsers.length > 0 ? 'Done' : 'Skip for now'}
                                    </button>
                                    <button type="button" className="btn-primary" onClick={handleDone}>
                                        Go to Collection <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {snackbar.show && (
                        <Snackbar
                            message={snackbar.message}
                            type={snackbar.type}
                            onClose={() => setSnackbar({ ...snackbar, show: false })}
                        />
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreateCollectionModal;
