import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import FloatingActionButton from '../components/FloatingActionButton';
import UserService from '../core/services/UserService';
import '../styles/Profile.css';
import { API_CONFIG } from '../core/config/apiConfig';
import CollectionService from '../core/services/CollectionService';
import { ShimmerProfileHeader, ShimmerCollectionGrid } from '../components/Shimmer';

import EditProfileModal from '../components/EditProfileModal';
import { AnimatePresence } from 'framer-motion';
import Snackbar from '../components/Snackbar';

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [isOwnProfile, setIsOwnProfile] = useState(username === 'me' || !username);

    // Local state for collections to use the specific endpoint
    const [profileCollections, setProfileCollections] = useState([]);
    const [sharedCollections, setSharedCollections] = useState([]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);

                let profileData;
                const currentUser = await UserService.getUserProfile().catch(() => null);

                // Determine which user to fetch
                if (username === 'me' || !username) {
                    // Fetch own profile
                    profileData = currentUser;
                    setIsOwnProfile(true);
                } else {
                    // Fetch specific user by username
                    const result = await UserService.getUserByUsername(username);
                    // Handle different response structures
                    profileData = result.result || result.user || result;

                    // If the fetched profile is the current user's profile, redirect to /profile/me
                    if (currentUser && profileData && (currentUser._id === profileData._id || currentUser.id === profileData.id)) {
                        navigate('/profile/me', { replace: true });
                        return;
                    }
                    setIsOwnProfile(false);
                }

                if (!profileData) {
                    throw new Error("Profile data is empty");
                }

                setUser(profileData);

                // Fetch collections — own profile gets all (public + private), others only public
                if (profileData._id || profileData.id) {
                    const isOwn = username === 'me' || !username ||
                        (currentUser && (currentUser._id === profileData._id || currentUser.id === profileData.id));
                    if (isOwn) {
                        const { result, sharedCollections } = await CollectionService.getMyCollections();
                        setProfileCollections(result);
                        setSharedCollections(sharedCollections);
                    } else {
                        const collectionsData = await CollectionService.getUserCollections(profileData._id || profileData.id);
                        setProfileCollections(collectionsData);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile data:", err);
                const errorMessage = err.response?.data?.message || err.message || "Failed to load profile data.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [username, navigate]);

    const handleFollow = () => {
        console.log('Follow/Unfollow user');
    };

    const handleMessage = () => {
        console.log('Open messages');
    };

    const handleShareProfile = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setSnackbar({ show: true, message: 'Profile link copied!', type: 'success' });
    };

    const handleUpdateProfile = async (updatedUser) => {
        console.log("Profile updated, refreshing data...");
        try {
            const profileData = await UserService.getUserProfile();
            setUser(profileData);
        } catch (err) {
            console.error("Failed to refresh profile:", err);
            if (updatedUser) setUser(updatedUser);
        }
    };

    // Refresh collections helper
    const refreshCollections = async () => {
        if (!user) return;
        try {
            if (isOwnProfile) {
                const { result, sharedCollections } = await CollectionService.getMyCollections();
                setProfileCollections(result);
                setSharedCollections(sharedCollections);
            } else {
                const collectionsData = await CollectionService.getUserCollections(user._id || user.id);
                setProfileCollections(collectionsData);
            }
        } catch (err) {
            console.error("Failed to refresh collections:", err);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <ShimmerProfileHeader />
                    <div style={{ padding: '0 2rem' }}>
                        <ShimmerCollectionGrid count={6} />
                    </div>
                </div>
            </div>
        );
    }
    if (error) return <div className="profile-error">{error}</div>;
    if (!user) return <div className="profile-not-found">User not found</div>;

    const adaptedUser = {
        ...user,
        avatar: user.profileImageUrl ? (user.profileImageUrl.startsWith('http') ? user.profileImageUrl : user.profileImageUrl) : null,
        stats: {
            followers: user.followers || 0,
            following: user.following || 0,
            collections: profileCollections.length
        }
    };

    // Instant update helper
    const handleCollectionUpdate = (id, updatedData) => {
        setProfileCollections(prev => prev.map(c =>
            (c._id === id || c.id === id) ? { ...c, ...updatedData } : c
        ));
    };

    return (
        <motion.div
            className="profile-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="profile-container">
                <ProfileHeader
                    user={adaptedUser}
                    isOwnProfile={isOwnProfile}
                    onFollow={handleFollow}
                    onMessage={handleMessage}
                    onEditProfile={() => setIsEditModalOpen(true)}
                    onShareProfile={handleShareProfile}
                />

                <ProfileTabs
                    collections={profileCollections}
                    sharedCollections={sharedCollections}
                    activeTab="collections"
                    onRefresh={refreshCollections}
                    isOwner={isOwnProfile}
                    onUpdateCollection={handleCollectionUpdate}
                />

                <AnimatePresence>
                    {isEditModalOpen && (
                        <EditProfileModal
                            user={user}
                            onClose={() => setIsEditModalOpen(false)}
                            onUpdate={handleUpdateProfile}
                        />
                    )}
                </AnimatePresence>
            </div>

            <FloatingActionButton />

            <Snackbar
                isVisible={snackbar.show}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar({ ...snackbar, show: false })}
            />
        </motion.div>
    );
};

export default Profile;