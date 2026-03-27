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

    async getProductByPId(id) {
        try {
            const response = await ProductRepository.getProductByPId(id);
            return response.results || response;
        } catch (error) {
            console.error('ProductService.getProductByPId error:', error);
            throw error;
        }
    }

    /**
     * Create a new product
     * @param {string} collectionId - Collection ID
     * @param {FormData} data - Product data
     * @returns {Promise<Object>}
     */
    async createProduct(collectionId, data) {
        try {
            const response = await ProductRepository.createProduct(collectionId, data);
            return response.result || response;
        } catch (error) {
            console.error('ProductService.createProduct error:', error);
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

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Promise<Array>}
     */
    async searchProducts(query) {
        try {
            const response = await ProductRepository.searchProducts(query);
            return response.results || [];
        } catch (error) {
            console.error('ProductService.searchProducts error:', error);
            throw error;
        }
    }

    /**
     * Update a product
     * @param {string} id - Product ID
     * @param {FormData} data - Product data
     * @returns {Promise<Object>}
     */
    async updateProduct(id, data) {
        try {
            const response = await ProductRepository.updateProduct(id, data);
            return response.updatedProduct || response;
        } catch (error) {
            console.error('ProductService.updateProduct error:', error);
            throw error;
        }
    }

    /**
     * Add media to a product
     * @param {string} id - Product ID
     * @param {FormData} data - Media data
     * @returns {Promise<Object>}
     */
    async addProductMedia(id, data) {
        try {
            const response = await ProductRepository.addProductMedia(id, data);
            return response.updatedProduct || response;
        } catch (error) {
            console.error('ProductService.addProductMedia error:', error);
            throw error;
        }
    }

    /**
     * Delete a media from product
     * @param {string} productId - Product ID
     * @param {string} mediaId - Media ID
     * @returns {Promise<Object>}
     */
    async deleteProductMedia(productId, mediaId) {
        try {
            return await ProductRepository.deleteProductMedia(productId, mediaId);
        } catch (error) {
            console.error('ProductService.deleteProductMedia error:', error);
            throw error;
        }
    }

    async pinProduct(id) {
        return ProductRepository.pinProduct(id);
    }

    async featureProduct(id) {
        return ProductRepository.featureProduct(id);
    }
}

export default new ProductService();
