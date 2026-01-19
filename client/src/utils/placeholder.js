// Tạo placeholder image dạng data URI
export const getPlaceholderImage = (width = 300, height = 200, text = 'No Image') => {
    // Tạo SVG placeholder
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#e0e0e0"/>
            <text 
                x="50%" 
                y="50%" 
                font-family="Arial, sans-serif" 
                font-size="20" 
                fill="#999" 
                text-anchor="middle" 
                dominant-baseline="middle"
            >${text}</text>
        </svg>
    `;
    
    // Encode SVG to base64
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Preset placeholders
export const PLACEHOLDER_IMAGES = {
    product: getPlaceholderImage(300, 200, 'Shoe'),
    productSmall: getPlaceholderImage(200, 150, 'Shoe'),
    productLarge: getPlaceholderImage(600, 400, 'Shoe'),
    thumbnail: getPlaceholderImage(100, 100, 'Shoe'),
    cart: getPlaceholderImage(120, 120, 'Shoe'),
    avatar: getPlaceholderImage(80, 80, 'User'),
};
