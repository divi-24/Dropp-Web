import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, MapPin, Loader2 } from 'lucide-react';
import UserService from '../core/services/UserService';
import { API_CONFIG } from '../core/config/apiConfig';
import '../styles/EditProfileModal.css';

const PRONOUNS = [
    "he/him",
    "she/her",
    "they/them",
    "he/they",
    "she/they",
    "other"
];

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        bio: '',
        link: '',
        location: '',
        pronoun: '',
        dob: '',
        profileImageUrl: ''
    });

    const [profileImageFile, setProfileImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [canUpdateUsername, setCanUpdateUsername] = useState(true);
    const [usernameDaysLeft, setUsernameDaysLeft] = useState(0);
    const [customPronoun, setCustomPronoun] = useState('');
    const [isCustomPronoun, setIsCustomPronoun] = useState(false);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);
    const locationTimerRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                username: user.username || '',
                bio: user.bio || '',
                link: user.link || '',
                location: user.location || '',
                pronoun: user.pronoun || '',
                dob: user.dob ? user.dob.split('T')[0] : '', // Format for date input
                profileImageUrl: user.profileImageUrl || ''
            });

            if (user.profileImageUrl) {
                if (user.profileImageUrl.startsWith('http') || user.profileImageUrl.startsWith('data:')) {
                    setPreviewImage(user.profileImageUrl);
                } else {
                    setPreviewImage(API_CONFIG.BASE_URL + user.profileImageUrl);
                }
            } else {
                setPreviewImage(null);
            }

            // Check if pronoun is custom
            if (user.pronoun && !PRONOUNS.includes(user.pronoun) && user.pronoun !== 'other') {
                setIsCustomPronoun(true);
                setCustomPronoun(user.pronoun);
                setFormData(prev => ({ ...prev, pronoun: 'other' }));
            }

            // Check username update eligibility
            checkUsernameUpdateEligibility(user);
        }
    }, [user]);

    const checkUsernameUpdateEligibility = (userData) => {
        if (!userData.usernameLastUpdated) {
            setCanUpdateUsername(true);
            return;
        }

        const lastUpdate = new Date(userData.usernameLastUpdated);
        const now = new Date();
        const diffTime = Math.abs(now - lastUpdate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            setCanUpdateUsername(false);
            setUsernameDaysLeft(30 - diffDays);
        } else {
            setCanUpdateUsername(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'location') {
            handleLocationSearch(value);
        }
    };

    const handlePronounChange = (e) => {
        const value = e.target.value;
        if (value === 'other') {
            setIsCustomPronoun(true);
            setFormData(prev => ({ ...prev, pronoun: 'other' }));
        } else {
            setIsCustomPronoun(false);
            setFormData(prev => ({ ...prev, pronoun: value }));
        }
    };

    const handleCustomPronounChange = (e) => {
        setCustomPronoun(e.target.value);
    };

    const handleLocationSearch = (query) => {
        if (locationTimerRef.current) {
            clearTimeout(locationTimerRef.current);
        }

        if (!query || query.length < 3) {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            return;
        }

        locationTimerRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setLocationSuggestions(data);
                setShowLocationSuggestions(true);
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        }, 500); // Debounce 500ms
    };

    const selectLocation = (locationName) => {
        setFormData(prev => ({ ...prev, location: locationName }));
        setShowLocationSuggestions(false);
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Append basic fields
            data.append('fullName', formData.fullName);
            data.append('bio', formData.bio);
            data.append('location', formData.location);
            data.append('link', formData.link);
            data.append('dob', formData.dob);

            // Handle Username
            if (formData.username !== user.username) {
                if (canUpdateUsername) {
                    data.append('username', formData.username);
                } else {
                    // Start notification or handle error (optional, UI shouldn't allow it anyway)
                }
            } else {
                data.append('username', user.username);
            }

            // Handle Pronouns
            if (isCustomPronoun) {
                data.append('pronoun', customPronoun);
            } else {
                data.append('pronoun', formData.pronoun);
            }

            // Handle Image
            if (profileImageFile) {
                data.append('image', profileImageFile);
            }

            const updatedUser = await UserService.updateProfile(data);
            onUpdate(updatedUser);
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            if (error.response && error.response.data && error.response.data.message) {
                if (error.response.data.message.toLowerCase().includes('username')) {
                    setError("Username already exists. Please choose another one.");
                } else {
                    setError(error.response.data.message);
                }
            } else {
                setError("Failed to update profile. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>Edit Profile</h2>
                        <button type="button" className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {error && (
                            <div className="form-error-message" style={{ color: 'red', marginBottom: '16px', padding: '10px', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: '8px' }}>
                                {error}
                            </div>
                        )}
                        <div className="profile-image-upload">
                            <div className="image-preview-container">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile Preview" className="image-preview" />
                                ) : (
                                    <div className="no-image-placeholder"></div>
                                )}
                            </div>
                            <span className="change-photo-btn" onClick={handleImageClick}>
                                Change Profile Photo
                            </span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="change-photo-input"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-input"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                className="form-input"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={!canUpdateUsername && formData.username === user.username}
                            />
                            {!canUpdateUsername && (
                                <p className="input-warning-text">
                                    You can change your username again in {usernameDaysLeft} days.
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Pronouns</label>
                            <select
                                name="pronoun"
                                className="form-select"
                                value={formData.pronoun === 'other' || isCustomPronoun ? 'other' : formData.pronoun}
                                onChange={handlePronounChange}
                            >
                                <option value="">Select pronouns</option>
                                {PRONOUNS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            {(formData.pronoun === 'other' || isCustomPronoun) && (
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ marginTop: '8px' }}
                                    placeholder="Enter your pronouns"
                                    value={customPronoun}
                                    onChange={handleCustomPronounChange}
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                className="form-textarea"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Write something about yourself..."
                            />
                        </div>

                        <div className="form-group location-input-container">
                            <label>Location</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#666' }} />
                                <input
                                    type="text"
                                    name="location"
                                    className="form-input"
                                    style={{ paddingLeft: '36px' }}
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Add your location"
                                    autoComplete="off"
                                />
                            </div>
                            {showLocationSuggestions && locationSuggestions.length > 0 && (
                                <div className="location-suggestions">
                                    {locationSuggestions.map((place, index) => (
                                        <div
                                            key={index}
                                            className="location-suggestion"
                                            onClick={() => selectLocation(place.display_name)}
                                        >
                                            {place.display_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Link</label>
                            <input
                                type="text"
                                name="link"
                                className="form-input"
                                value={formData.link}
                                onChange={handleInputChange}
                                placeholder="Website or link"
                            />
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                className="form-input"
                                value={formData.dob}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px', display: 'inline' }} />
                                    Saving...
                                </>
                            ) : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
