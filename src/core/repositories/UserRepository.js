import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';
import { UserProfile } from '../models/UserModels';

/**
 * UserRepository - Handles all user-related API calls
 */
class UserRepository {
    /**
     * Get user profile
     * @returns {Promise<UserProfile>}
     */
    async getUserProfile() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.PROFILE);
            return UserProfile.fromJSON(response.data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {FormData} formData - Profile update data
     * @returns {Promise<UserProfile>}
     */
    async updateProfile(formData) {
        try {
            const response = await apiClient.patch(API_CONFIG.ENDPOINTS.PROFILE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return UserProfile.fromJSON(response.data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user password
     * @param {Object} data - Password update data { oldPassword, newPassword }
     * @returns {Promise<any>}
     */
    async updatePassword(data) {
        try {
            const response = await apiClient.patch(API_CONFIG.ENDPOINTS.UPDATE_PASSWORD, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify email
     * @returns {Promise<any>}
     */
    async verifyEmail() {
        console.log("UserRepository.verifyEmail called. Endpoint:", API_CONFIG.ENDPOINTS.VERIFY_EMAIL);
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.VERIFY_EMAIL);
            console.log("UserRepository.verifyEmail response:", response);
            return response.data;
        } catch (error) {
            console.error("UserRepository.verifyEmail error:", error);
            throw error;
        }
    }

    /**
     * Delete user account
     * @returns {Promise<any>}
     */
    async deleteAccount() {
        try {
            const response = await apiClient.delete(API_CONFIG.ENDPOINTS.DELETE_ACCOUNT);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search users by query
     * @param {string} query - Search query
     * @returns {Promise<Array>}
     */
    async searchUsers(query) {
        try {
            const response = await apiClient.get(`/user/search/${encodeURIComponent(query)}`);
            return response.data?.results || [];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user profile by username
     * @param {string} username - Username to fetch
     * @returns {Promise<Object>}
     */
    async getUserByUsername(username) {
        try {
            const response = await apiClient.get(`/user/profile/${encodeURIComponent(username)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user profile by userId
     * @param {string} userId - User ID to fetch
     * @returns {Promise<Object>}
     */
    async getUserById(userId) {
        try {
            const response = await apiClient.get(`/user/profile/${encodeURIComponent(userId)}`);
            return response.data?.results || response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Follow/Unfollow a user
     * @param {string} userId - Target user ID
     * @returns {Promise<Object>}
     */
    async followUser(userId) {
        try {
            const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.FOLLOW_USER}/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all users (creators)
     * @returns {Promise<Array>}
     */
    async getAllUsers() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS);
            return response.data?.results || [];
        } catch (error) {
            throw error;
        }
    }
}

export default new UserRepository();
