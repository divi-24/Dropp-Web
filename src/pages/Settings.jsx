import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Bell, Settings as SettingsIcon, User, Lock, Moon, Sun, Monitor,
    Globe, HelpCircle, AlertCircle, BadgeCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import UpdatePasswordModal from '../components/UpdatePasswordModal';
import { AnimatePresence } from 'framer-motion';
import UserService from '../core/services/UserService';
import Snackbar from '../components/Snackbar';
import '../styles/Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const { themePreference, setThemePreference, theme: resolvedTheme } = useTheme();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteUsername, setDeleteUsername] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    const showSnackbar = useCallback((message, type = 'success') => {
        setSnackbar({ isVisible: true, message, type });
    }, []);

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isVisible: false }));
    };

    const fetchProfile = useCallback(async () => {
        try {
            const profile = await UserService.getUserProfile();
            setUserProfile(profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
            showSnackbar('Failed to load profile settings', 'error');
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Refetch when user returns to this tab (e.g. after clicking verify link in email)
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                fetchProfile();
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [fetchProfile]);

    const handleVerifyEmail = async () => {
        console.log("Verify Email Button Clicked");
        try {
            console.log("Calling UserService.verifyEmail...");
            await UserService.verifyEmail();
            console.log("Verification email sent successfully");
            showSnackbar('Verification link has been sent to your email', 'success');
            await fetchProfile();
        } catch (error) {
            console.error('Error sending verification email:', error);
            showSnackbar('Failed to send verification email. Please try again.', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteUsername !== userProfile?.username) {
            showSnackbar('Username does not match', 'error');
            return;
        }

        try {
            await UserService.deleteAccount();
            showSnackbar('Account deleted successfully', 'success');
            // Clear local storage and redirect to landing
            localStorage.clear();
            window.location.href = '/landing';
        } catch (error) {
            console.error('Error deleting account:', error);
            showSnackbar(error.message || 'Failed to delete account', 'error');
        }
    };

    return (
        <motion.div
            className="settings-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="settings-container">
                <h1 className="settings-title">Settings</h1>

                {/* Account Settings */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <User size={20} />
                        Account
                    </h2>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Profile Information</h3>
                            <p>Update your personal details and profile picture</p>
                        </div>
                        <button className="settings-btn">Edit</button>
                    </div>

                    <div className="settings-item settings-item-email">
                        <div className="settings-item-content">
                            <div className="email-title-row">
                                <h3>Email Address</h3>
                                {!loading && userProfile?.emailVerified && (
                                    <span className="email-verified-badge" title="Your email is verified">
                                        <span className="email-verified-badge-icon" aria-hidden>
                                            <BadgeCheck size={15} strokeWidth={2.25} />
                                        </span>
                                        <span className="email-verified-badge-text">Verified</span>
                                    </span>
                                )}
                            </div>
                            <p className="settings-email-value">{loading ? 'Loading...' : (userProfile?.email || 'user@example.com')}</p>
                            {!loading && userProfile && !userProfile.emailVerified && (
                                <p className="verification-status unverified">
                                    <AlertCircle size={14} /> Not verified yet — check your inbox after clicking Verify
                                </p>
                            )}
                            {!loading && userProfile?.emailVerified && (
                                <p className="verification-status verified">
                                    <BadgeCheck size={14} strokeWidth={2.5} className="verified-tick" />
                                    This address is confirmed. You&apos;ll receive important account emails here.
                                </p>
                            )}
                        </div>
                        <div className="settings-actions">
                            {!loading && userProfile && !userProfile.emailVerified && (
                                <button className="settings-btn verify-btn" onClick={handleVerifyEmail}>
                                    Verify Email
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Username</h3>
                            <p>{loading ? 'Loading...' : (userProfile?.username ? `@${userProfile.username}` : '@username')}</p>
                        </div>
                        <button className="settings-btn">Change</button>
                    </div>

                    <div className="settings-item settings-item-appearance">
                        <div className="settings-item-content settings-appearance-block">
                            <h3>Appearance</h3>
                            <p>
                                {themePreference === 'system'
                                    ? `Match device — using ${resolvedTheme === 'dark' ? 'dark' : 'light'} mode now`
                                    : 'Choose a fixed look for Dropp'}
                            </p>
                            <div className="settings-appearance-modes" role="group" aria-label="Color theme">
                                <button
                                    type="button"
                                    className={`settings-appearance-btn ${themePreference === 'light' ? 'active' : ''}`}
                                    onClick={() => setThemePreference('light')}
                                >
                                    <Sun size={18} strokeWidth={2} />
                                    <span>Light</span>
                                </button>
                                <button
                                    type="button"
                                    className={`settings-appearance-btn ${themePreference === 'dark' ? 'active' : ''}`}
                                    onClick={() => setThemePreference('dark')}
                                >
                                    <Moon size={18} strokeWidth={2} />
                                    <span>Dark</span>
                                </button>
                                <button
                                    type="button"
                                    className={`settings-appearance-btn ${themePreference === 'system' ? 'active' : ''}`}
                                    onClick={() => setThemePreference('system')}
                                >
                                    <Monitor size={18} strokeWidth={2} />
                                    <span>System</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Privacy & Security */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Lock size={20} />
                        Privacy & Security
                    </h2>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Password</h3>
                            <p>Change your password</p>
                        </div>
                        <button className="settings-btn" onClick={() => setIsPasswordModalOpen(true)}>Update</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Two-Factor Authentication</h3>
                            <p>Add an extra layer of security</p>
                        </div>
                        <button className="settings-btn">Enable</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Privacy Settings</h3>
                            <p>Control who can see your profile and collections</p>
                        </div>
                        <button className="settings-btn">Manage</button>
                    </div>
                </section>

                {/* Notifications */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Bell size={20} />
                        Notifications
                    </h2>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Email Notifications</h3>
                            <p>Receive updates via email</p>
                        </div>
                        <label className="settings-toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Push Notifications</h3>
                            <p>Get notified about new followers and likes</p>
                        </div>
                        <label className="settings-toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Collection Updates</h3>
                            <p>Notifications when people you follow add collections</p>
                        </div>
                        <label className="settings-toggle">
                            <input type="checkbox" />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </section>

                {/* Preferences */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <SettingsIcon size={20} />
                        Preferences
                    </h2>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Analytics</h3>
                            <p>View collection and product performance</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/analytics')}>Open</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Language</h3>
                            <p>English (US)</p>
                        </div>
                        <button className="settings-btn">Change</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Time Zone</h3>
                            <p>Automatic</p>
                        </div>
                        <button className="settings-btn">Change</button>
                    </div>
                </section>

                {/* Support */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <HelpCircle size={20} />
                        Support
                    </h2>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Help Center</h3>
                            <p>Get answers to your questions</p>
                        </div>
                        <button className="settings-btn">Visit</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Contact Support</h3>
                            <p>Reach out to our team</p>
                        </div>
                        <button className="settings-btn">Contact</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Terms of Service</h3>
                            <p>Read our terms and policies</p>
                        </div>
                        <button className="settings-btn">View</button>
                    </div>
                </section>

                {/* About & Links */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Globe size={20} />
                        About & Links
                    </h2>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>About Dropp</h3>
                            <p>Learn more about our platform</p>
                        </div>
                        <button className="settings-btn">View</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Blog</h3>
                            <p>Read our latest updates and stories</p>
                        </div>
                        <button className="settings-btn">Visit</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Careers</h3>
                            <p>Join our growing team</p>
                        </div>
                        <button className="settings-btn">Explore</button>
                    </div>

                    <div className="settings-links-row">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="settings-social-link">
                            Twitter
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="settings-social-link">
                            TikTok
                        </a>
                    </div>

                    <div className="settings-links-row">
                        <a href="#" className="settings-legal-link">Privacy Policy</a>
                        <a href="#" className="settings-legal-link">Terms of Service</a>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="settings-section danger-section">
                    <h2 className="section-title">Danger Zone</h2>

                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Delete Account</h3>
                            <p>Permanently delete your account and all data</p>
                        </div>
                        <button className="settings-btn btn-danger" onClick={() => setIsDeleteModalOpen(true)}>Delete</button>
                    </div>
                </section>
            </div>


            <AnimatePresence>
                {isPasswordModalOpen && (
                    <UpdatePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
                )}
                {isDeleteModalOpen && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content danger-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h2>Delete Account</h2>
                            <p className="warning-text">
                                <AlertCircle size={20} />
                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </p>
                            <p>Please type <strong>{userProfile?.username}</strong> to confirm.</p>
                            <input
                                type="text"
                                value={deleteUsername}
                                onChange={(e) => setDeleteUsername(e.target.value)}
                                placeholder="Type your username"
                                className="settings-input"
                            />
                            <div className="modal-actions">
                                <button className="settings-btn" onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteUsername('');
                                }}>Cancel</button>
                                <button
                                    className="settings-btn btn-danger"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteUsername !== userProfile?.username}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Snackbar
                isVisible={snackbar.isVisible}
                message={snackbar.message}
                type={snackbar.type}
                onClose={closeSnackbar}
            />
        </motion.div >
    );
};
export default Settings;
