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
}

export default new ProductRepository();
