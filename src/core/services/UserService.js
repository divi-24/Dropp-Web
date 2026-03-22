import UserRepository from '../repositories/UserRepository';

/**
 * UserService - Business logic layer for user operations
 */
class UserService {
    /**
     * Get user profile
     * @returns {Promise<UserProfile>}
     */
    async getUserProfile() {
        try {
            return await UserRepository.getUserProfile();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {FormData} formData
     * @returns {Promise<UserProfile>}
     */
    async updateProfile(formData) {
        try {
            return await UserRepository.updateProfile(formData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user password
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<any>}
     */
    async updatePassword(oldPassword, newPassword) {
        try {
            return await UserRepository.updatePassword({ oldPassword, newPassword });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify email
     * @returns {Promise<any>}
     */
    async verifyEmail() {
        console.log("UserService.verifyEmail called");
        try {
            return await UserRepository.verifyEmail();
        } catch (error) {
            console.error("UserService.verifyEmail error:", error);
            throw error;
        }
    }

    /**
     * Delete user account
     * @returns {Promise<any>}
     */
    async deleteAccount() {
        try {
            return await UserRepository.deleteAccount();
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
            return await UserRepository.searchUsers(query);
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
            return await UserRepository.getUserByUsername(username);
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
            return await UserRepository.getUserById(userId);
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
            return await UserRepository.followUser(userId);
        } catch (error) {
            console.error('UserService.followUser error:', error);
            throw error;
        }
    }

    /**
     * Get followers of a user
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getFollowers(userId) {
        try {
            return await UserRepository.getFollowers(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get users that a user is following
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getFollowing(userId) {
        try {
            return await UserRepository.getFollowing(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user notifications
     * @returns {Promise<Array>}
     */
    async getNotifications() {
        try {
            return await UserRepository.getNotifications();
        } catch (error) {
            throw error;
        }
    }

    async markNotificationRead(id) {
        try {
            return await UserRepository.markNotificationRead(id);
        } catch (error) {
            throw error;
        }
    }

    async markAllNotificationsRead() {
        try {
            return await UserRepository.markAllNotificationsRead();
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
            return await UserRepository.getAllUsers();
        } catch (error) {
            throw error;
        }
    }

    async verifyEmailToken(token) {
        return UserRepository.verifyEmailToken(token);
    }

    async getAnalytics() {
        return UserRepository.getAnalytics();
    }

    async requestResetPassword(email) {
        return UserRepository.requestResetPassword(email);
    }

    async resetPassword(id, token, password) {
        return UserRepository.resetPassword(id, token, password);
    }
}

export default new UserService();
