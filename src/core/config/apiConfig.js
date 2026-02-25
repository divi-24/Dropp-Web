// API Configuration
export const API_CONFIG = {
    // Using Vite proxy in dev, direct URL in prod
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    ENDPOINTS: {
        LOGIN: '/user/login',
        SIGNUP: '/user/signup',
        PROFILE: '/user/profile/',
        VERIFY_EMAIL: '/user/verify-email',
        UPDATE_PASSWORD: '/user/update-password',
        DELETE_ACCOUNT: '/user/delete',
        COLLECTIONS: '/c',
        COLLECTION_BY_ID: '/c/getCollectionById',
        EXPLORE: '/c/explore/collections',
        USERS: '/user/',
        FOLLOW_USER: '/user/follow',
        FOLLOWERS: '/user/followers',
        FOLLOWING: '/user/following',
        ADD_PRODUCT: '/product/cId',
        PRODUCT_EXPLORE: '/product/explore',
        PRODUCT_BY_ID: '/product',
        LIKE_PRODUCT: '/product/like',
        DELETE_PRODUCT: '/product',
        SEARCH_PRODUCTS: '/product/search', // GET /product/search?q={query}
        UPDATE_PRODUCT: '/product/pId', // PATCH /product/pId/{productId}
        PRODUCT_BY_PID: '/product/pId', // GET /product/pId/{productId}
        PRODUCT_MEDIA: '/product/media/pId', // POST /product/media/pId/{productId}
        DELETE_PRODUCT_MEDIA: '/product/media', // DELETE /product/media/{mediaId}/pId/{productId}/delete
    },
    TIMEOUT: 10000,
};

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'dropp_auth_token',
    USER_DATA: 'dropp_user_data',
};
