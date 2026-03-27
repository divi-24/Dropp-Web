import CollectionRepository from '../repositories/CollectionRepository';

/**
 * CollectionService - Business logic layer for collection operations
 */
class CollectionService {
    /**
     * Get all collections for the authenticated user
     * @returns {Promise<Array>}
     */
    async getCollections() {
        try {
            const response = await CollectionRepository.getCollections();
            return response.result || [];
        } catch (error) {
            console.error('CollectionService.getCollections error:', error);
            throw error;
        }
    }

    /**
     * Get explore collections (public feed)
     * @returns {Promise<Array>}
     */
    async getExploreCollections() {
        try {
            const response = await CollectionRepository.getExploreCollections();
            return response.result || [];
        } catch (error) {
            console.error('CollectionService.getExploreCollections error:', error);
            throw error;
        }
    }

    /**
     * Get a specific collection by ID
     * @param {string} id - Collection ID
     * @returns {Promise<Object>}
     */
    async getCollectionById(id) {
        try {
            return await CollectionRepository.getCollectionById(id);
        } catch (error) {
            console.error('CollectionService.getCollectionById error:', error);
            throw error;
        }
    }

    /**
     * Get a public collection by ID (no auth required)
     * @param {string} id - Collection ID
     * @returns {Promise<Object>}
     */
    async getPublicCollection(id) {
        try {
            return await CollectionRepository.getPublicCollection(id);
        } catch (error) {
            console.error('CollectionService.getPublicCollection error:', error);
            throw error;
        }
    }

    /**
     * Create a new collection
     * @param {string} title - Collection name
     * @param {string} desc - Collection description
     * @returns {Promise<Object>}
     */
    async createCollection(title, desc, isPrivate = false) {
        try {
            if (!title || !title.trim()) {
                throw new Error('Collection title is required');
            }

            const response = await CollectionRepository.createCollection({
                title: title.trim(),
                desc: desc?.trim() || '',
                isPrivate
            });

            return response;
        } catch (error) {
            console.error('CollectionService.createCollection error:', error);
            throw error;
        }
    }

    async getMyCollections() {
        try {
            const response = await CollectionRepository.getMyCollections();
            return {
                result: response.result || [],
                sharedCollections: response.sharedCollections || []
            };
        } catch (error) {
            console.error('CollectionService.getMyCollections error:', error);
            throw error;
        }
    }

    async updateCollectionVisibility(id, isPrivate) {
        try {
            return await CollectionRepository.updateCollectionVisibility(id, isPrivate);
        } catch (error) {
            console.error('CollectionService.updateCollectionVisibility error:', error);
            throw error;
        }
    }

    /**
     * Update an existing collection
     * @param {string} id - Collection ID
     * @param {string} title - Updated collection name
     * @param {string} desc - Updated collection description
     * @returns {Promise<Object>}
     */
    async updateCollection(id, title, desc) {
        try {
            if (!title || !title.trim()) {
                throw new Error('Collection title is required');
            }

            const response = await CollectionRepository.updateCollection(id, {
                title: title.trim(),
                desc: desc?.trim() || ''
            });

            return response;
        } catch (error) {
            console.error('CollectionService.updateCollection error:', error);
            throw error;
        }
    }


    /**
     * Like/Unlike a collection
     * @param {string} id - Collection ID
     * @returns {Promise<Object>}
     */
    async likeCollection(id) {
        try {
            return await CollectionRepository.likeCollection(id);
        } catch (error) {
            console.error('CollectionService.likeCollection error:', error);
            throw error;
        }
    }

    /**
     * Delete a collection
     * @param {string} id - Collection ID
     * @returns {Promise<Object>}
     */
    async deleteCollection(id) {
        try {
            return await CollectionRepository.deleteCollection(id);
        } catch (error) {
            console.error('CollectionService.deleteCollection error:', error);
            throw error;
        }
    }

    /**
     * Get collections by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    async getUserCollections(userId) {
        try {
            const response = await CollectionRepository.getUserCollections(userId);
            return response.result || [];
        } catch (error) {
            console.error('CollectionService.getUserCollections error:', error);
            throw error;
        }
    }

    /**
     * Search collections by query
     * @param {string} query - Search query
     * @returns {Promise<Array>}
     */
    async searchCollections(query) {
        try {
            return await CollectionRepository.searchCollections(query);
        } catch (error) {
            console.error('CollectionService.searchCollections error:', error);
            throw error;
        }
    }

    /**
     * Add a product to a collection
     * @param {string} collectionId - Collection ID
     * @param {Object} productData - Product data
     * @returns {Promise<Object>}
     */
    async addProduct(collectionId, productData) {
        try {
            if (!collectionId) throw new Error('Collection ID is required');

            // Check validation based on data type
            if (productData instanceof FormData) {
                if (!productData.get('name')) throw new Error('Product name is required');
                if (!productData.get('link')) throw new Error('Product link is required');
            } else {
                if (!productData.name) throw new Error('Product name is required');
                if (!productData.link) throw new Error('Product link is required');
            }

            return await CollectionRepository.addProduct(collectionId, productData);
        } catch (error) {
            console.error('CollectionService.addProduct error:', error);
            throw error;
        }
    }

    /**
     * Get products in a collection
     * @param {string} collectionId - Collection ID
     * @returns {Promise<Array>}
     */
    async getProducts(collectionId) {
        try {
            if (!collectionId) throw new Error('Collection ID is required');
            return await CollectionRepository.getProducts(collectionId);
        } catch (error) {
            console.error('CollectionService.getProducts error:', error);
            throw error;
        }
    }

    async inviteMember(collectionId, userId, role) {
        try {
            return await CollectionRepository.inviteMember(collectionId, userId, role);
        } catch (error) {
            console.error('CollectionService.inviteMember error:', error);
            throw error;
        }
    }

    async revokeMember(userId, collectionId) {
        try {
            return await CollectionRepository.revokeMember(userId, collectionId);
        } catch (error) {
            console.error('CollectionService.revokeMember error:', error);
            throw error;
        }
    }

    async pinCollection(id) {
        return CollectionRepository.pinCollection(id);
    }
}

export default new CollectionService();
