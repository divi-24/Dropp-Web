import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader, LogOut } from 'lucide-react';
import UserService from '../core/services/UserService';
import CollectionService from '../core/services/CollectionService';
import Snackbar from './Snackbar';
import '../styles/InviteMemberModal.css';
import '../styles/CreateCollectionModal.css';

// members prop shape: [{ user: "userId", role: "viewer"|"editor", _id: "..." }]
const InviteMemberModal = ({
    isOpen,
    onClose,
    collectionId,
    members = [],
    isOwner,
    currentUserId,
    onMemberRemoved,
    onInviteSent,
    onRoleChanged,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [role, setRole] = useState('viewer');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);
    const [memberProfiles, setMemberProfiles] = useState([]);
    const [removeLoading, setRemoveLoading] = useState(null);
    const [roleLoading, setRoleLoading] = useState(null);
    const [exitLoading, setExitLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const searchTimeout = useRef(null);

    const showSnackbar = (message, type = 'success') =>
        setSnackbar({ show: true, message, type });

    useEffect(() => {
        if (isOpen) {
            members.length > 0 ? fetchMemberProfiles() : setMemberProfiles([]);
        }
    }, [isOpen, members.length]);

    const fetchMemberProfiles = async () => {
        try {
            const settled = await Promise.allSettled(
                members.map(m => UserService.getUserById(m.user))
            );
            setMemberProfiles(
                settled
                    .map((r, i) => r.status === 'fulfilled' && r.value
                        ? { ...r.value, role: members[i].role, memberId: members[i]._id }
                        : null
                    )
                    .filter(Boolean)
            );
        } catch (err) {
            console.error('Failed to fetch member profiles:', err);
        }
    };

    const alreadyInvitedIds = members.map(m => m.user);

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
                setSearchResults(
                    results.filter(u => {
                        const uid = u._id || u.id;
                        return uid !== currentUserId && !alreadyInvitedIds.includes(uid);
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

    const handleDeselect = () => {
        setSelectedUser(null);
        setSearchQuery('');
    };

    const handleInvite = async () => {
        if (!selectedUser) return;
        setInviteLoading(true);
        try {
            await CollectionService.inviteMember(collectionId, selectedUser._id || selectedUser.id, role);
            setInviteSuccess(true);
            setSelectedUser(null);
            setSearchQuery('');
            onInviteSent?.();
            setTimeout(() => setInviteSuccess(false), 3000);
        } catch (err) {
            showSnackbar('Failed to send invite', 'error');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRoleChange = async (member, newRole) => {
        if (member.role === newRole) return;
        const memberId = member._id || member.id;
        setRoleLoading(memberId);
        try {
            await CollectionService.inviteMember(collectionId, memberId, newRole);
            setMemberProfiles(prev =>
                prev.map(p => (p._id || p.id) === memberId ? { ...p, role: newRole } : p)
            );
            showSnackbar(`@${member.username} is now a${newRole === 'editor' ? 'n' : ''} ${newRole}`);
            onRoleChanged?.(memberId, newRole);
        } catch (err) {
            showSnackbar('Failed to update role', 'error');
        } finally {
            setRoleLoading(null);
        }
    };

    const handleRemove = async (member) => {
        const memberId = member._id || member.id;
        setRemoveLoading(memberId);
        try {
            await CollectionService.revokeMember(memberId, collectionId);
            setMemberProfiles(prev => prev.filter(p => (p._id || p.id) !== memberId));
            onMemberRemoved?.(memberId);
            showSnackbar(`Removed @${member.username} from the collection`);
        } catch (err) {
            showSnackbar('Failed to remove member', 'error');
        } finally {
            setRemoveLoading(null);
        }
    };

    const handleExit = async () => {
        setExitLoading(true);
        try {
            await CollectionService.revokeMember(currentUserId, collectionId);
            onMemberRemoved?.(currentUserId);
            onClose();
        } catch (err) {
            showSnackbar('Failed to exit collection', 'error');
        } finally {
            setExitLoading(false);
        }
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
                onClick={onClose}
            >
                <motion.div
                    className="invite-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>Manage Members</h2>
                        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="invite-modal-body">
                        {/* ── Invite section (owner only) ── */}
                        {isOwner && (
                            <div className="invite-section">
                                <p className="invite-section-label">Invite someone</p>

                                {!selectedUser && (
                                    <div className="invite-search-wrap">
                                        <Search size={16} className="invite-search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search by username or name…"
                                            value={searchQuery}
                                            onChange={handleSearch}
                                            className="invite-search-input"
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
                                            <button className="invite-deselect-btn" onClick={handleDeselect} aria-label="Deselect">
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

                                        <button
                                            className="btn-primary invite-send-btn"
                                            onClick={handleInvite}
                                            disabled={inviteLoading}
                                        >
                                            {inviteLoading && <Loader size={15} className="spinner" />}
                                            {inviteLoading ? 'Sending…' : 'Send Invite'}
                                        </button>
                                    </div>
                                )}

                                {inviteSuccess && (
                                    <p className="invite-success-msg">Invite sent successfully!</p>
                                )}
                            </div>
                        )}

                        {/* ── Members list ── */}
                        {memberProfiles.length > 0 ? (
                            <div className="invite-members-section">
                                <p className="invite-section-label">
                                    Members <span className="invite-members-count">{memberProfiles.length}</span>
                                </p>
                                <div className="invite-members-list">
                                    {memberProfiles.map(member => {
                                        const memberId = member._id || member.id;
                                        const isSelf = memberId === currentUserId;
                                        const isUpdatingRole = roleLoading === memberId;

                                        return (
                                            <div key={memberId} className="invite-member-item">
                                                <div className="invite-avatar">
                                                    {member.profileImageUrl ? (
                                                        <img src={getImageUrl(member.profileImageUrl)} alt={member.username} />
                                                    ) : (
                                                        <span>{member.username?.[0]?.toUpperCase() || '?'}</span>
                                                    )}
                                                </div>

                                                <div className="invite-user-meta">
                                                    <span className="invite-user-name">{member.fullName || member.username}</span>
                                                    <span className="invite-user-username">@{member.username}</span>
                                                </div>

                                                {/* Role — dropdown for owner, badge for member */}
                                                {isOwner ? (
                                                    isUpdatingRole ? (
                                                        <Loader size={14} className="spinner member-role-loading" />
                                                    ) : (
                                                        <select
                                                            className="member-role-select"
                                                            value={member.role}
                                                            onChange={e => handleRoleChange(member, e.target.value)}
                                                        >
                                                            <option value="viewer">Viewer</option>
                                                            <option value="editor">Editor</option>
                                                        </select>
                                                    )
                                                ) : (
                                                    <span className={`invite-role-badge ${member.role}`}>
                                                        {member.role}
                                                    </span>
                                                )}

                                                {isOwner ? (
                                                    <button
                                                        className="invite-remove-btn"
                                                        onClick={() => handleRemove(member)}
                                                        disabled={removeLoading === memberId}
                                                        title={`Remove @${member.username}`}
                                                    >
                                                        {removeLoading === memberId
                                                            ? <Loader size={13} className="spinner" />
                                                            : <X size={13} />
                                                        }
                                                    </button>
                                                ) : isSelf ? (
                                                    <span className="invite-you-badge">You</span>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : members.length === 0 && isOwner ? (
                            <p className="invite-empty-msg">No members yet. Invite someone to collaborate!</p>
                        ) : null}

                        {/* ── Exit button (member only) ── */}
                        {!isOwner && (
                            <div className="invite-exit-section">
                                <button
                                    className="invite-exit-btn"
                                    onClick={handleExit}
                                    disabled={exitLoading}
                                >
                                    {exitLoading ? <Loader size={15} className="spinner" /> : <LogOut size={15} />}
                                    {exitLoading ? 'Leaving…' : 'Exit Collection'}
                                </button>
                            </div>
                        )}
                    </div>

                    {snackbar.show && (
                        <Snackbar
                            message={snackbar.message}
                            type={snackbar.type}
                            onClose={() => setSnackbar(s => ({ ...s, show: false }))}
                        />
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InviteMemberModal;
