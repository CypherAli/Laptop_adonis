/**
 * Script to add variant data (size, color, gender) to existing products
 */

const mongoose = require('mongoose');
require('dotenv').config();

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

const SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
const COLORS = ['Đen', 'Trắng', 'Xanh Navy', 'Đỏ', 'Xám', 'Nâu', 'Xanh Dương', 'Hồng', 'Vàng'];
const GENDERS = ['Nam', 'Nữ', 'Unisex'];
const MATERIALS = ['Da thật', 'Da tổng hợp', 'Vải Canvas', 'Mesh thoáng khí', 'Da Suede'];
const SHOE_TYPES = ['Sneaker', 'Running', 'Casual', 'Formal', 'Sports', 'Basketball'];

async function addVariantsToProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products`);

        let updated = 0;

        for (const product of products) {
            // Generate variants for each product
            const variants = [];
            
            // Determine gender based on product name
            let productGenders = [];
            const nameLower = product.name.toLowerCase();
            
            if (nameLower.includes('nam') || nameLower.includes('men')) {
                productGenders = ['Nam'];
            } else if (nameLower.includes('nữ') || nameLower.includes('women')) {
                productGenders = ['Nữ'];
            } else {
                // Unisex products can have all genders
                productGenders = ['Nam', 'Nữ', 'Unisex'];
            }

            // For each gender, create variants with 7 colors and multiple sizes
            for (const gender of productGenders) {
                // Select 7 random colors
                const selectedColors = [...COLORS].sort(() => 0.5 - Math.random()).slice(0, 7);
                
                // For each color, create 3-5 size variants
                for (const color of selectedColors) {
                    const numSizes = Math.floor(Math.random() * 3) + 3; // 3-5 sizes per color
                    const selectedSizes = [...SIZES].sort(() => 0.5 - Math.random()).slice(0, numSizes);
                    
                    for (const size of selectedSizes) {
                        const basePrice = product.price || product.basePrice || 1000000;
                        const priceVariation = Math.floor(Math.random() * 200000) - 100000; // ±100k
                        const variantPrice = basePrice + priceVariation;

                        variants.push({
                            variantName: `${gender} - Size ${size} - ${color}`,
                            sku: `${product._id.toString().slice(-6)}-${gender.charAt(0)}-${size}-${color.slice(0, 3).toUpperCase()}`,
                            price: variantPrice,
                            originalPrice: variantPrice + Math.floor(Math.random() * 300000), // Add discount
                            stock: Math.floor(Math.random() * 15) + 3, // 3-17 items
                            specifications: {
                                size: size,
                                color: color,
                                material: MATERIALS[Math.floor(Math.random() * MATERIALS.length)],
                                shoeType: SHOE_TYPES[Math.floor(Math.random() * SHOE_TYPES.length)],
                                gender: gender
                            },
                            isAvailable: true
                        });
                    }
                }
            }

            // Update product with variants
            await Product.findByIdAndUpdate(product._id, {
                variants: variants,
                basePrice: product.price || product.basePrice || 1000000
            });

            updated++;
            const gendersList = productGenders.join(', ');
            console.log(`✅ Updated: ${product.name} - ${gendersList} (${variants.length} variants)`);
        }

        console.log(`\n🎉 Successfully updated ${updated} products with variants!`);
        console.log(`📊 Each gender has 7 colors with multiple sizes (34-44)`);
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addVariantsToProducts();
