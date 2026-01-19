/**
 * Centralized constants file - Shoe Shop
 * Giúp dễ maintain và update data
 */

// Brand list - Shoe brands
export const BRANDS = [
    'All', 
    'Nike', 
    'Adidas', 
    'Puma', 
    'Converse', 
    'Vans', 
    'New Balance', 
    'Reebok',
    'Skechers', 
    'Under Armour'
];

// Size options for shoes
export const SIZE_OPTIONS = [
    'All', 
    '35', 
    '36', 
    '37', 
    '38', 
    '39', 
    '40',
    '41',
    '42',
    '43',
    '44',
    '45'
];

// Color options
export const COLOR_OPTIONS = [
    'All',
    'Black',
    'White',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Pink',
    'Grey',
    'Brown',
    'Navy',
    'Orange'
];

// Material options
export const MATERIAL_OPTIONS = [
    'All',
    'Leather',
    'Canvas',
    'Mesh',
    'Synthetic',
    'Suede',
    'Rubber'
];

// Shoe Type options
export const SHOE_TYPE_OPTIONS = [
    'All',
    'Running',
    'Casual',
    'Formal',
    'Sports',
    'Sneakers',
    'Sandals',
    'Boots'
];

// Sort options
export const SORT_OPTIONS = [
    { value: '', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá: Thấp → Cao' },
    { value: 'price_desc', label: 'Giá: Cao → Thấp' },
    { value: 'popularity', label: 'Phổ biến nhất' }
];

// Product categories - Shoes
export const CATEGORIES = [
    { name: 'Running', icon: '🏃', label: 'Running Shoes' },
    { name: 'Casual', icon: '👟', label: 'Casual Shoes' },
    { name: 'Sports', icon: '⚽', label: 'Sports Shoes' },
    { name: 'Formal', icon: '👞', label: 'Formal Shoes' },
    { name: 'Sneakers', icon: '👟', label: 'Sneakers' }
];

// API Endpoints
export const API_ENDPOINTS = {
    PRODUCTS: '/products',
    BRANDS: '/products/brands',
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    ORDERS: '/orders',
    MY_ORDERS: '/orders/my-orders'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    CART: 'cart',
    WISHLIST: 'wishlist',
    USER: 'user'
};

// Default filter values
export const DEFAULT_FILTERS = {
    search: '',
    maxPrice: '',
    minPrice: '',
    brand: 'All',
    size: 'All',
    color: 'All',
    material: 'All',
    shoeType: 'All',
    inStock: true,
    sortBy: ''
};

// Pagination
export const ITEMS_PER_PAGE = 12;
export const BEST_SELLERS_LIMIT = 5;

// Toast duration
export const TOAST_DURATION = 3000;

// Validation
export const PASSWORD_MIN_LENGTH = 6;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
