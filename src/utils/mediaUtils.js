import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file while maintaining quality.
 * @param {File} file - The image file to compress.
 * @returns {Promise<File>} - The compressed image file.
 */
export const compressImage = async (file) => {
    const options = {
        maxSizeMB: 2, // Maximum size after compression
        maxWidthOrHeight: 2560, // Max dimensions (2K)
        useWebWorker: true,
        initialQuality: 0.85, // Higher quality
    };

    try {
        const compressedBlob = await imageCompression(file, options);
        // Convert Blob back to File to preserve name and lastModified
        return new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: Date.now(),
        });
    } catch (error) {
        console.error('Image compression failed:', error);
        return file; // Return original if compression fails
    }
};

/**
 * Checks if the total size of files exceeds the limit.
 * @param {File[]} files - Array of files to check.
 * @param {number} limitMB - Size limit in MB.
 * @returns {boolean} - True if within limit, false otherwise.
 */
export const isWithinSizeLimit = (files, limitMB = 80) => {
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const limitBytes = limitMB * 1024 * 1024;
    return totalSize <= limitBytes;
};

/**
 * Calculates the total size of files in MB.
 * @param {File[]} files - Array of files.
 * @returns {number} - Total size in MB.
 */
export const getTotalSizeMB = (files) => {
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    return totalSize / (1024 * 1024);
};
