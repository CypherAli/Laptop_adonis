// Import shoe images
import { getRandomShoeImage } from './shoeImages';

// Tạo placeholder image dạng data URI
export const getPlaceholderImage = (width = 300, height = 200, text = 'No Image') => {
    // Trả về hình giày thật thay vì SVG
    return getRandomShoeImage();
};

// Preset placeholders - sử dụng hình giày thật
export const PLACEHOLDER_IMAGES = {
    product: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png',
    productSmall: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_Light_Shoes_Black_GY9350_01_standard.jpg',
    productLarge: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/af53d53d-561f-450a-a483-70a7ceee380f/dunk-low-retro-shoes-66RGq8.png',
    thumbnail: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers',
    cart: 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw6f1c0e4d/images/a_107/M9160_A_107X1.jpg',
    avatar: getPlaceholderImage(80, 80, 'User'),
};
