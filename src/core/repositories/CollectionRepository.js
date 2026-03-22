import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';

/**
 * CollectionRepository - Data access layer for collection operations
 */
class CollectionRepository {
    /**
     * Get all collections for the authenticated user
     * @returns {Promise<Array>}
     */
    async getCollections() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.MY_COLLECTIONS);
        return response.data;
    }

    /**
     * Get explore collections (public feed)
     * @returns {Promise<Array>}
     */
    async getExploreCollections() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.EXPLORE);
        return response.data;
    }

    /**
     * Get a specific collection by ID
     * @param {string} id - Collection ID
     * @returns {Promise<Object>}
     */
    async getCollectionById(id) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.COLLECTION_BY_ID}/${id}`);
        return response.data;
    }

    /**
     * Get a public collection by ID (no auth required)
     * @param {string} id - Collection ID
     * @returns {Promise<Object>}
     */
    async getPublicCollection(id) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.COLLECTION_BY_ID}/${id}`, {
            headers: { Authorization: undefined }
        });
        return response.data;
    }

    /**
     * Create a new collection
     * @param {Object} data - Collection data {name, desc}
     * @returns {Promise<Object>}
     */
    async createCollection(data) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.COLLECTIONS, {
            title: data.title,
            desc: data.desc,
            isCollectionPrivate: Boolean(data.isPrivate)
        });
        return response.data;
    }

    async getMyCollections() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.MY_COLLECTIONS);
        return response.data;
    }

    async updateCollectionVisibility(id, isPrivate) {
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.UPDATE_COLLECTION_VISIBILITY}/${id}`, { isPrivate });
        return response.data;
    }

    /**
     * Update an existing collection
     * @param {string} id - Collection ID
     * @param {Object} data - Updated collection data {name, desc}
     * @returns {Promise<Object>}
     */
    async updateCollection(id, data) {
        // Use PATCH /c/{id} as requested
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.COLLECTIONS}/${id}`, {
            title: data.title,
            desc: data.desc
        });
        return response.data;
    }

    /**
     * Like/Unlike a collection
     * @param {string} id - Collection ID
     * @returns {Promise<Object>}
     */
    async likeCollection(id) {
        const url = `${API_CONFIG.ENDPOINTS.COLLECTIONS}/like/${id}`;
        console.log('Repository: Sending POST request to:', url);
        const response = await apiClient.get(url);
        return response.data;
    }

    /**
     * Delete a collection
     * @param {string} id - Collection ID
     * @returns {Promise<Object>}
     */
    async deleteCollection(id) {
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.COLLECTIONS}/${id}`);
        return response.data;
    }

    async pinCollection(id) {
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.PIN_COLLECTION}/${id}`);
        return response.data;
    }

    /**
     * Get collections by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>}
     */
    async getUserCollections(userId) {
        const response = await apiClient.get(`/c/getCollectionByUserId/${userId}`);
        return response.data;
    }

    /**
     * Search collections by query
     * @param {string} query - Search query
     * @returns {Promise<Object>}
     */
    async searchCollections(query) {
        const response = await apiClient.get(`/c/search/${encodeURIComponent(query)}`);
        // Ensure result is an array
        const results = response.data?.results;
        return Array.isArray(results) ? results : [];
    }

    /**
     * Add a product to a collection
     * @param {string} collectionId - Collection ID
     * @param {Object} productData - Product data {name, link, imageUrl, description}
     * @returns {Promise<Object>}
     */
    async addProduct(collectionId, productData) {
        // Check if productData is FormData
        const isFormData = productData instanceof FormData;

        const config = isFormData ? {
            headers: {
                'Content-Type': undefined,
            }
        } : {};

        const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.ADD_PRODUCT}/${collectionId}`, productData, config);
        return response.data;
    }

    /**
     * Get products in a collection
     * @param {string} collectionId - Collection ID
     * @returns {Promise<Object>}
     */
    async getProducts(collectionId) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ADD_PRODUCT}/${collectionId}`);
        return response.data;
    }

    async inviteMember(collectionId, userId, role) {
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.INVITE_MEMBER}/${collectionId}`, { id: userId, role });
        return response.data;
    }

    async revokeMember(userId, collectionId) {
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.REVOKE_MEMBER}/${collectionId}`, { data: { memberId: userId } });
        return response.data;
    }
}

export default new CollectionRepository();
