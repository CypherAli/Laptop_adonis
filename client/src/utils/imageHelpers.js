/**
 * Image Helper Functions
 * Xử lý URL ảnh từ backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333/api';
const SERVER_URL = process.env.REACT_APP_SERVER_URL || API_BASE_URL.replace('/api', '');

/**
 * Convert avatar path from backend to full URL
 * @param {string} avatarPath - Path từ backend (e.g., "/uploads/avatars/filename.jpg")
 * @returns {string} - Full URL hoặc null
 */
export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    console.log('🖼️ getAvatarUrl input:', avatarPath);
    console.log('🌐 SERVER_URL:', SERVER_URL);
    
    // Nếu đã là full URL (http/https), return luôn
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        console.log('✅ Already full URL:', avatarPath);
        return avatarPath;
    }
    
    // Nếu là relative path từ backend
    if (avatarPath.startsWith('/uploads')) {
        const fullUrl = `${SERVER_URL}${avatarPath}`;
        console.log('✅ Converted to full URL:', fullUrl);
        return fullUrl;
    }
    
    // Fallback
    console.log('⚠️ Fallback return:', avatarPath);
    return avatarPath;
};

/**
 * Convert product image path from backend to full URL
 * @param {string} imagePath - Path từ backend
 * @returns {string} - Full URL hoặc null
 */
export const getProductImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
        return `${SERVER_URL}${imagePath}`;
    }
    
    return imagePath;
};

const imageHelpers = {
    getAvatarUrl,
    getProductImageUrl
};

export default imageHelpers;
