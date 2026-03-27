import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';

/**
 * ProductRepository - Data access layer for product operations
 */
class ProductRepository {
    /**
     * Get explore products (public feed)
     * @returns {Promise<Array>}
     */
    async getExploreProducts() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCT_EXPLORE);
        return response.data;
    }

    async getProductById(id) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCT_BY_ID}/${id}`);
        return response.data;
    }

    async getProductByPId(id) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCT_BY_PID}/${id}`);
        return response.data;
    }

    /**
     * Create a new product
     * @param {string} collectionId - Collection ID
     * @param {FormData} data - Product data (multipart/form-data)
     * @returns {Promise<Object>}
     */
    async createProduct(collectionId, data) {
        // url: /product/cId/{collectionId}
        const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.ADD_PRODUCT}/${collectionId}`, data, {
            headers: {
                'Content-Type': undefined, // Let axios set boundary
            },
        });
        return response.data;
    }

    /**
     * Like/Unlike a product
     * @param {string} id - Product ID
     * @returns {Promise<Object>}
     */
    async likeProduct(id) {
        // url: /product/like/{productId}
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.LIKE_PRODUCT}/${id}`);
        return response.data;
    }

    /**
     * Delete a product
     * @param {string} id - Product ID
     * @returns {Promise<Object>}
     */
    async deleteProduct(id) {
        // url: /product/{productId}
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.DELETE_PRODUCT}/${id}`);
        return response.data;
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Promise<Object>}
     */
    async searchProducts(query) {
        // url: /product/search?q={query}
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SEARCH_PRODUCTS}?q=${query}`);
        return response.data;
    }

    /**
     * Update a product
     * @param {string} id - Product ID
     * @param {FormData|Object} data - Product data
     * @returns {Promise<Object>}
     */
    async updateProduct(id, data) {
        // url: /product/pId/{productId}
        const isFormData = data instanceof FormData;
        const config = isFormData ? {
            headers: {
                // Remove manual Content-Type to allow axios to set it with boundary
                'Content-Type': undefined,
            },
        } : {};

        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.UPDATE_PRODUCT}/${id}`, data, config);
        return response.data;
    }

    /**
     * Add media to a product
     * @param {string} id - Product ID
     * @param {FormData} data - Media data (FormData with 'media' key)
     * @returns {Promise<Object>}
     */
    async addProductMedia(id, data) {
        // url: /product/media/pId/{productId}
        const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCT_MEDIA}/${id}`, data, {
            headers: {
                // Remove manual Content-Type to allow axios to set it with boundary
                'Content-Type': undefined,
            },
        });
        return response.data;
    }

    /**
     * Delete media from a product
     * @param {string} productId - Product ID
     * @param {string} mediaId - Media ID
     * @returns {Promise<Object>}
     */
    async deleteProductMedia(productId, mediaId) {
        // url: /product/media/{mediaId}/pId/{productId}/delete
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.DELETE_PRODUCT_MEDIA}/${mediaId}/pId/${productId}/delete`);
        return response.data;
    }

    async pinProduct(id) {
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.PIN_PRODUCT}/${id}`);
        return response.data;
    }

    async featureProduct(id) {
        const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.FEATURE_PRODUCT}/${id}/feature`);
        return response.data;
    }
}

export default new ProductRepository();
