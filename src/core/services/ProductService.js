import ProductRepository from '../repositories/ProductRepository';

/**
 * ProductService - Business logic layer for product operations
 */
class ProductService {
    /**
     * Get explore products (public feed)
     * @returns {Promise<Array>}
     */
    async getExploreProducts() {
        try {
            const response = await ProductRepository.getExploreProducts();
            return response.result || [];
        } catch (error) {
            console.error('ProductService.getExploreProducts error:', error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const response = await ProductRepository.getProductById(id);
            return response.result || response;
        } catch (error) {
            console.error('ProductService.getProductById error:', error);
            throw error;
        }
    }

    /**
     * Like/Unlike a product
     * @param {string} id - Product ID
     * @returns {Promise<Object>}
     */
    async likeProduct(id) {
        try {
            return await ProductRepository.likeProduct(id);
        } catch (error) {
            console.error('ProductService.likeProduct error:', error);
            throw error;
        }
    }

    /**
     * Delete a product
     * @param {string} id - Product ID
     * @returns {Promise<Object>}
     */
    async deleteProduct(id) {
        try {
            return await ProductRepository.deleteProduct(id);
        } catch (error) {
            console.error('ProductService.deleteProduct error:', error);
            throw error;
        }
    }
}

export default new ProductService();
