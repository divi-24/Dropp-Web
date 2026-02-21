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
     * @param {FormData} data - Product data (FormData for files)
     * @returns {Promise<Object>}
     */
    async updateProduct(id, data) {
        // url: /product/pId/{productId}
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.UPDATE_PRODUCT}/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}

export default new ProductRepository();
