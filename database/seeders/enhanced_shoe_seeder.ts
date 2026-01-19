import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { Product } from '#models/product'
import { User } from '#models/user'

export default class extends BaseSeeder {
  async run() {
    console.log('🚀 Starting Enhanced Shoe Products Seeder...')

    const seller = await User.findOne({ role: { $in: ['admin', 'partner'] } })
    if (!seller) {
      console.log('❌ No admin or partner user found.')
      return
    }

    // Price logic: Nữ (đắt nhất) > Nam (rẻ hơn 10-15%) > Unisex (rẻ nhất, giảm 20%)
    const calculatePrice = (basePrice: number, gender: string) => {
      if (gender === 'Nam') return Math.round(basePrice * 0.85) // Giảm 15%
      if (gender === 'Unisex') return Math.round(basePrice * 0.80) // Giảm 20%
      return basePrice // Nữ = giá gốc (đắt nhất)
    }

    // Color pricing: màu hiếm/hot = đắt hơn, màu cơ bản = giá gốc
    const getColorMultiplier = (color: string) => {
      const c = color.toLowerCase()
      // Màu hiếm/hot (+15-25%)
      if (c.includes('pink') || c.includes('purple') || c.includes('solar yellow')) return 1.25
      // Màu đẹp (+10%)  
      if (c.includes('red') || c.includes('yellow') || c.includes('orange')) return 1.10
      // Màu phổ biến (giá gốc)
      if (c.includes('black') || c.includes('white') || c.includes('navy')) return 1.0
      // Màu trung bình (+5%)
      return 1.05
    }

    const shoeProducts = [
      {
        name: 'Nike Air Max 270 Premium',
        description: 'Giày thể thao Nike Air Max 270 với công nghệ đệm khí Max Air. Nhiều màu sắc đa dạng, giá thay đổi theo gender và màu hiếm.',
        brand: 'Nike',
        category: 'Running',
        gender: 'Unisex',
        basePrice: 3500000,
        variants: [
          // Black - Nam (39-42)
          { variantName: 'Size 39 - Black - Nam', sku: 'NK270-BK-M-39', price: calculatePrice(3500000 * getColorMultiplier('Black'), 'Nam'), originalPrice: 4200000, stock: 15, 
            specifications: { size: '39', color: 'Black', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 40 - Black - Nam', sku: 'NK270-BK-M-40', price: calculatePrice(3500000 * getColorMultiplier('Black'), 'Nam'), originalPrice: 4200000, stock: 20,
            specifications: { size: '40', color: 'Black', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 41 - Black - Nam', sku: 'NK270-BK-M-41', price: calculatePrice(3500000 * getColorMultiplier('Black'), 'Nam'), originalPrice: 4200000, stock: 18,
            specifications: { size: '41', color: 'Black', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 42 - Black - Nam', sku: 'NK270-BK-M-42', price: calculatePrice(3500000 * getColorMultiplier('Black'), 'Nam'), originalPrice: 4200000, stock: 14,
            specifications: { size: '42', color: 'Black', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          
          // Black - Nữ (34-37)
          { variantName: 'Size 34 - Black - Nữ', sku: 'NK270-BK-F-34', price: Math.round(3500000 * getColorMultiplier('Black')), originalPrice: 4200000, stock: 8,
            specifications: { size: '34', color: 'Black', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 35 - Black - Nữ', sku: 'NK270-BK-F-35', price: Math.round(3500000 * getColorMultiplier('Black')), originalPrice: 4200000, stock: 10,
            specifications: { size: '35', color: 'Black', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 36 - Black - Nữ', sku: 'NK270-BK-F-36', price: Math.round(3500000 * getColorMultiplier('Black')), originalPrice: 4200000, stock: 12,
            specifications: { size: '36', color: 'Black', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Black - Nữ', sku: 'NK270-BK-F-37', price: Math.round(3500000 * getColorMultiplier('Black')), originalPrice: 4200000, stock: 15,
            specifications: { size: '37', color: 'Black', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          
          // White - Unisex (37-40)
          { variantName: 'Size 37 - White - Unisex', sku: 'NK270-WH-U-37', price: calculatePrice(3400000 * getColorMultiplier('White'), 'Unisex'), originalPrice: 4000000, stock: 18,
            specifications: { size: '37', color: 'White', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 38 - White - Unisex', sku: 'NK270-WH-U-38', price: calculatePrice(3400000 * getColorMultiplier('White'), 'Unisex'), originalPrice: 4000000, stock: 20,
            specifications: { size: '38', color: 'White', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 39 - White - Unisex', sku: 'NK270-WH-U-39', price: calculatePrice(3400000 * getColorMultiplier('White'), 'Unisex'), originalPrice: 4000000, stock: 25,
            specifications: { size: '39', color: 'White', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 40 - White - Unisex', sku: 'NK270-WH-U-40', price: calculatePrice(3400000 * getColorMultiplier('White'), 'Unisex'), originalPrice: 4000000, stock: 22,
            specifications: { size: '40', color: 'White', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          
          // Red - Nữ (34-37)
          { variantName: 'Size 34 - Red - Nữ', sku: 'NK270-RD-F-34', price: Math.round(3800000 * getColorMultiplier('Red')), originalPrice: 4500000, stock: 5,
            specifications: { size: '34', color: 'Red', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 35 - Red - Nữ', sku: 'NK270-RD-F-35', price: Math.round(3800000 * getColorMultiplier('Red')), originalPrice: 4500000, stock: 7,
            specifications: { size: '35', color: 'Red', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 36 - Red - Nữ', sku: 'NK270-RD-F-36', price: Math.round(3800000 * getColorMultiplier('Red')), originalPrice: 4500000, stock: 8,
            specifications: { size: '36', color: 'Red', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Red - Nữ', sku: 'NK270-RD-F-37', price: Math.round(3800000 * getColorMultiplier('Red')), originalPrice: 4500000, stock: 10,
            specifications: { size: '37', color: 'Red', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          
          // Blue - Nam (40-43)
          { variantName: 'Size 40 - Blue - Nam', sku: 'NK270-BL-M-40', price: calculatePrice(3600000 * getColorMultiplier('Blue'), 'Nam'), originalPrice: 4300000, stock: 12,
            specifications: { size: '40', color: 'Blue', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 41 - Blue - Nam', sku: 'NK270-BL-M-41', price: calculatePrice(3600000 * getColorMultiplier('Blue'), 'Nam'), originalPrice: 4300000, stock: 15,
            specifications: { size: '41', color: 'Blue', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 42 - Blue - Nam', sku: 'NK270-BL-M-42', price: calculatePrice(3600000 * getColorMultiplier('Blue'), 'Nam'), originalPrice: 4300000, stock: 13,
            specifications: { size: '42', color: 'Blue', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 43 - Blue - Nam', sku: 'NK270-BL-M-43', price: calculatePrice(3600000 * getColorMultiplier('Blue'), 'Nam'), originalPrice: 4300000, stock: 10,
            specifications: { size: '43', color: 'Blue', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          
          // Navy - Nam (40-43)
          { variantName: 'Size 40 - Navy - Nam', sku: 'NK270-NV-M-40', price: calculatePrice(3600000 * getColorMultiplier('Navy'), 'Nam'), originalPrice: 4300000, stock: 12,
            specifications: { size: '40', color: 'Navy', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 41 - Navy - Nam', sku: 'NK270-NV-M-41', price: calculatePrice(3600000 * getColorMultiplier('Navy'), 'Nam'), originalPrice: 4300000, stock: 15,
            specifications: { size: '41', color: 'Navy', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 42 - Navy - Nam', sku: 'NK270-NV-M-42', price: calculatePrice(3600000 * getColorMultiplier('Navy'), 'Nam'), originalPrice: 4300000, stock: 11,
            specifications: { size: '42', color: 'Navy', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 43 - Navy - Nam', sku: 'NK270-NV-M-43', price: calculatePrice(3600000 * getColorMultiplier('Navy'), 'Nam'), originalPrice: 4300000, stock: 9,
            specifications: { size: '43', color: 'Navy', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          
          // Pink - Nữ (34-37)
          { variantName: 'Size 34 - Pink - Nữ', sku: 'NK270-PK-F-34', price: Math.round(3900000 * getColorMultiplier('Pink')), originalPrice: 4600000, stock: 4,
            specifications: { size: '34', color: 'Pink', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 35 - Pink - Nữ', sku: 'NK270-PK-F-35', price: Math.round(3900000 * getColorMultiplier('Pink')), originalPrice: 4600000, stock: 5,
            specifications: { size: '35', color: 'Pink', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 36 - Pink - Nữ', sku: 'NK270-PK-F-36', price: Math.round(3900000 * getColorMultiplier('Pink')), originalPrice: 4600000, stock: 6,
            specifications: { size: '36', color: 'Pink', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Pink - Nữ', sku: 'NK270-PK-F-37', price: Math.round(3900000 * getColorMultiplier('Pink')), originalPrice: 4600000, stock: 8,
            specifications: { size: '37', color: 'Pink', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          
          // Purple - Nữ (34-37)
          { variantName: 'Size 34 - Purple - Nữ', sku: 'NK270-PR-F-34', price: Math.round(3900000 * getColorMultiplier('Purple')), originalPrice: 4700000, stock: 3,
            specifications: { size: '34', color: 'Purple', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 35 - Purple - Nữ', sku: 'NK270-PR-F-35', price: Math.round(3900000 * getColorMultiplier('Purple')), originalPrice: 4700000, stock: 5,
            specifications: { size: '35', color: 'Purple', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 36 - Purple - Nữ', sku: 'NK270-PR-F-36', price: Math.round(3900000 * getColorMultiplier('Purple')), originalPrice: 4700000, stock: 5,
            specifications: { size: '36', color: 'Purple', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Purple - Nữ', sku: 'NK270-PR-F-37', price: Math.round(3900000 * getColorMultiplier('Purple')), originalPrice: 4700000, stock: 7,
            specifications: { size: '37', color: 'Purple', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          
          // Yellow - Unisex (37-40)
          { variantName: 'Size 37 - Yellow - Unisex', sku: 'NK270-YL-U-37', price: calculatePrice(3500000 * getColorMultiplier('Yellow'), 'Unisex'), originalPrice: 4100000, stock: 8,
            specifications: { size: '37', color: 'Yellow', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 38 - Yellow - Unisex', sku: 'NK270-YL-U-38', price: calculatePrice(3500000 * getColorMultiplier('Yellow'), 'Unisex'), originalPrice: 4100000, stock: 10,
            specifications: { size: '38', color: 'Yellow', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 39 - Yellow - Unisex', sku: 'NK270-YL-U-39', price: calculatePrice(3500000 * getColorMultiplier('Yellow'), 'Unisex'), originalPrice: 4100000, stock: 12,
            specifications: { size: '39', color: 'Yellow', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 40 - Yellow - Unisex', sku: 'NK270-YL-U-40', price: calculatePrice(3500000 * getColorMultiplier('Yellow'), 'Unisex'), originalPrice: 4100000, stock: 9,
            specifications: { size: '40', color: 'Yellow', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          
          // Green - Nam (40-43)
          { variantName: 'Size 40 - Green - Nam', sku: 'NK270-GR-M-40', price: calculatePrice(3600000 * getColorMultiplier('Green'), 'Nam'), originalPrice: 4200000, stock: 8,
            specifications: { size: '40', color: 'Green', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 41 - Green - Nam', sku: 'NK270-GR-M-41', price: calculatePrice(3600000 * getColorMultiplier('Green'), 'Nam'), originalPrice: 4200000, stock: 10,
            specifications: { size: '41', color: 'Green', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 42 - Green - Nam', sku: 'NK270-GR-M-42', price: calculatePrice(3600000 * getColorMultiplier('Green'), 'Nam'), originalPrice: 4200000, stock: 9,
            specifications: { size: '42', color: 'Green', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 43 - Green - Nam', sku: 'NK270-GR-M-43', price: calculatePrice(3600000 * getColorMultiplier('Green'), 'Nam'), originalPrice: 4200000, stock: 7,
            specifications: { size: '43', color: 'Green', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          
          // Orange - Nữ (34-37)
          { variantName: 'Size 34 - Orange - Nữ', sku: 'NK270-OR-F-34', price: Math.round(3800000 * getColorMultiplier('Orange')), originalPrice: 4500000, stock: 4,
            specifications: { size: '34', color: 'Orange', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 35 - Orange - Nữ', sku: 'NK270-OR-F-35', price: Math.round(3800000 * getColorMultiplier('Orange')), originalPrice: 4500000, stock: 5,
            specifications: { size: '35', color: 'Orange', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 36 - Orange - Nữ', sku: 'NK270-OR-F-36', price: Math.round(3800000 * getColorMultiplier('Orange')), originalPrice: 4500000, stock: 6,
            specifications: { size: '36', color: 'Orange', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Orange - Nữ', sku: 'NK270-OR-F-37', price: Math.round(3800000 * getColorMultiplier('Orange')), originalPrice: 4500000, stock: 8,
            specifications: { size: '37', color: 'Orange', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          
          // Gray - Unisex (37-40)
          { variantName: 'Size 37 - Gray - Unisex', sku: 'NK270-GY-U-37', price: calculatePrice(3300000 * getColorMultiplier('Gray'), 'Unisex'), originalPrice: 3900000, stock: 16,
            specifications: { size: '37', color: 'Gray', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 38 - Gray - Unisex', sku: 'NK270-GY-U-38', price: calculatePrice(3300000 * getColorMultiplier('Gray'), 'Unisex'), originalPrice: 3900000, stock: 18,
            specifications: { size: '38', color: 'Gray', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 39 - Gray - Unisex', sku: 'NK270-GY-U-39', price: calculatePrice(3300000 * getColorMultiplier('Gray'), 'Unisex'), originalPrice: 3900000, stock: 20,
            specifications: { size: '39', color: 'Gray', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 40 - Gray - Unisex', sku: 'NK270-GY-U-40', price: calculatePrice(3300000 * getColorMultiplier('Gray'), 'Unisex'), originalPrice: 3900000, stock: 17,
            specifications: { size: '40', color: 'Gray', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          
          // Silver - Nam (40-43)
          { variantName: 'Size 40 - Silver - Nam', sku: 'NK270-SV-M-40', price: calculatePrice(3700000 * getColorMultiplier('Silver'), 'Nam'), originalPrice: 4300000, stock: 10,
            specifications: { size: '40', color: 'Silver', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 41 - Silver - Nam', sku: 'NK270-SV-M-41', price: calculatePrice(3700000 * getColorMultiplier('Silver'), 'Nam'), originalPrice: 4300000, stock: 12,
            specifications: { size: '41', color: 'Silver', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 42 - Silver - Nam', sku: 'NK270-SV-M-42', price: calculatePrice(3700000 * getColorMultiplier('Silver'), 'Nam'), originalPrice: 4300000, stock: 9,
            specifications: { size: '42', color: 'Silver', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 43 - Silver - Nam', sku: 'NK270-SV-M-43', price: calculatePrice(3700000 * getColorMultiplier('Silver'), 'Nam'), originalPrice: 4300000, stock: 8,
            specifications: { size: '43', color: 'Silver', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          
          // Turquoise - Nữ (34-37)
          { variantName: 'Size 34 - Turquoise - Nữ', sku: 'NK270-TQ-F-34', price: Math.round(3850000 * getColorMultiplier('Turquoise')), originalPrice: 4550000, stock: 5,
            specifications: { size: '34', color: 'Turquoise', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 35 - Turquoise - Nữ', sku: 'NK270-TQ-F-35', price: Math.round(3850000 * getColorMultiplier('Turquoise')), originalPrice: 4550000, stock: 6,
            specifications: { size: '35', color: 'Turquoise', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 36 - Turquoise - Nữ', sku: 'NK270-TQ-F-36', price: Math.round(3850000 * getColorMultiplier('Turquoise')), originalPrice: 4550000, stock: 7,
            specifications: { size: '36', color: 'Turquoise', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Turquoise - Nữ', sku: 'NK270-TQ-F-37', price: Math.round(3850000 * getColorMultiplier('Turquoise')), originalPrice: 4550000, stock: 8,
            specifications: { size: '37', color: 'Turquoise', material: 'Mesh/Leather', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
        ],
        images: [
          'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png',
          'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/d6cc0273-2759-4c36-b8d8-87ce5e5bfa00/blazer-mid-77-vintage-shoes-nw30B2.png',
          'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/af53d53d-561f-450a-a483-70a7ceee380f/dunk-low-retro-shoes-66RGq8.png',
        ],
        createdBy: seller._id,
        features: ['Đệm khí Max Air 270', 'Upper mesh thoáng khí', 'Giá khác nhau theo gender'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Adidas Ultraboost 22',
        description: 'Giày chạy bộ cao cấp với công nghệ Boost. Giá giày nữ cao hơn nam và unisex.',
        brand: 'Adidas',
        category: 'Running',
        gender: 'Unisex',
        basePrice: 4500000,
        variants: [
          // Core Black - Nam (màu cơ bản)
          { variantName: 'Size 40 - Core Black - Nam', sku: 'ADS-UB22-CB-M-40', price: calculatePrice(4500000 * getColorMultiplier('Core Black'), 'Nam'), originalPrice: 5200000, stock: 12,
            specifications: { size: '40', color: 'Core Black', material: 'Primeknit', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 41 - Core Black - Nam', sku: 'ADS-UB22-CB-M-41', price: calculatePrice(4500000 * getColorMultiplier('Core Black'), 'Nam'), originalPrice: 5200000, stock: 15,
            specifications: { size: '41', color: 'Core Black', material: 'Primeknit', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 42 - Core Black - Nam', sku: 'ADS-UB22-CB-M-42', price: calculatePrice(4500000 * getColorMultiplier('Core Black'), 'Nam'), originalPrice: 5200000, stock: 10,
            specifications: { size: '42', color: 'Core Black', material: 'Primeknit', shoeType: 'Running', gender: 'Nam' }, isAvailable: true },
          
          // Core Black - Nữ
          { variantName: 'Size 36 - Core Black - Nữ', sku: 'ADS-UB22-CB-F-36', price: Math.round(4500000 * getColorMultiplier('Core Black')), originalPrice: 5200000, stock: 10,
            specifications: { size: '36', color: 'Core Black', material: 'Primeknit', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Core Black - Nữ', sku: 'ADS-UB22-CB-F-37', price: Math.round(4500000 * getColorMultiplier('Core Black')), originalPrice: 5200000, stock: 12,
            specifications: { size: '37', color: 'Core Black', material: 'Primeknit', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          
          // Solar Yellow - Nữ (màu hiếm +25%)
          { variantName: 'Size 36 - Solar Yellow - Nữ', sku: 'ADS-UB22-SY-F-36', price: Math.round(4800000 * getColorMultiplier('Solar Yellow')), originalPrice: 5500000, stock: 6,
            specifications: { size: '36', color: 'Solar Yellow', material: 'Primeknit', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Solar Yellow - Nữ', sku: 'ADS-UB22-SY-F-37', price: Math.round(4800000 * getColorMultiplier('Solar Yellow')), originalPrice: 5500000, stock: 8,
            specifications: { size: '37', color: 'Solar Yellow', material: 'Primeknit', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          
          // Cloud White - Unisex (màu cơ bản)
          { variantName: 'Size 38 - Cloud White - Unisex', sku: 'ADS-UB22-CW-U-38', price: calculatePrice(4400000 * getColorMultiplier('Cloud White'), 'Unisex'), originalPrice: 5100000, stock: 15,
            specifications: { size: '38', color: 'Cloud White', material: 'Primeknit', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 39 - Cloud White - Unisex', sku: 'ADS-UB22-CW-U-39', price: calculatePrice(4400000 * getColorMultiplier('Cloud White'), 'Unisex'), originalPrice: 5100000, stock: 18,
            specifications: { size: '39', color: 'Cloud White', material: 'Primeknit', shoeType: 'Running', gender: 'Unisex' }, isAvailable: true },
          
          // Purple - Nữ (màu hiếm +25%)
          { variantName: 'Size 36 - Purple - Nữ', sku: 'ADS-UB22-PR-F-36', price: Math.round(4700000 * getColorMultiplier('Purple')), originalPrice: 5400000, stock: 7,
            specifications: { size: '36', color: 'Purple', material: 'Primeknit', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Purple - Nữ', sku: 'ADS-UB22-PR-F-37', price: Math.round(4700000 * getColorMultiplier('Purple')), originalPrice: 5400000, stock: 9,
            specifications: { size: '37', color: 'Purple', material: 'Primeknit', shoeType: 'Running', gender: 'Nữ' }, isAvailable: true },
        ],
        images: [
          'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_Light_Shoes_Black_GY9350_01_standard.jpg',
          'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/e8fefe9df46f4ac29f88aff8009e9d9b_9366/NMD_S1_Shoes_Black_GZ7925_01_standard.jpg',
        ],
        createdBy: seller._id,
        features: ['Công nghệ Boost', 'Upper Primeknit', 'Giá nữ cao hơn nam 15%'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Converse Chuck Taylor All Star',
        description: 'Giày sneaker kinh điển với thiết kế vượt thời gian. Đa dạng màu sắc, giá phụ thuộc gender.',
        brand: 'Converse',
        category: 'Casual',
        gender: 'Unisex',
        basePrice: 1800000,
        variants: [
          // Classic Black - Nam (màu cơ bản)
          { variantName: 'Size 39 - Black - Nam', sku: 'CNV-CT-BK-M-39', price: calculatePrice(1800000 * getColorMultiplier('Black'), 'Nam'), originalPrice: 2200000, stock: 20,
            specifications: { size: '39', color: 'Black', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 40 - Black - Nam', sku: 'CNV-CT-BK-M-40', price: calculatePrice(1800000 * getColorMultiplier('Black'), 'Nam'), originalPrice: 2200000, stock: 25,
            specifications: { size: '40', color: 'Black', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nam' }, isAvailable: true },
          
          // Classic Black - Nữ
          { variantName: 'Size 36 - Black - Nữ', sku: 'CNV-CT-BK-F-36', price: Math.round(1800000 * getColorMultiplier('Black')), originalPrice: 2200000, stock: 15,
            specifications: { size: '36', color: 'Black', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Black - Nữ', sku: 'CNV-CT-BK-F-37', price: Math.round(1800000 * getColorMultiplier('Black')), originalPrice: 2200000, stock: 18,
            specifications: { size: '37', color: 'Black', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nữ' }, isAvailable: true },
          
          // White - Unisex (màu cơ bản)
          { variantName: 'Size 38 - White - Unisex', sku: 'CNV-CT-WH-U-38', price: calculatePrice(1750000 * getColorMultiplier('White'), 'Unisex'), originalPrice: 2100000, stock: 22,
            specifications: { size: '38', color: 'White', material: 'Canvas', shoeType: 'Sneakers', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 39 - White - Unisex', sku: 'CNV-CT-WH-U-39', price: calculatePrice(1750000 * getColorMultiplier('White'), 'Unisex'), originalPrice: 2100000, stock: 25,
            specifications: { size: '39', color: 'White', material: 'Canvas', shoeType: 'Sneakers', gender: 'Unisex' }, isAvailable: true },
          
          // Red - Nữ (màu hot +10%)
          { variantName: 'Size 36 - Red - Nữ', sku: 'CNV-CT-RD-F-36', price: Math.round(1900000 * getColorMultiplier('Red')), originalPrice: 2300000, stock: 10,
            specifications: { size: '36', color: 'Red', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Red - Nữ', sku: 'CNV-CT-RD-F-37', price: Math.round(1900000 * getColorMultiplier('Red')), originalPrice: 2300000, stock: 12,
            specifications: { size: '37', color: 'Red', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nữ' }, isAvailable: true },
          
          // Navy - Nam (màu cơ bản)
          { variantName: 'Size 40 - Navy - Nam', sku: 'CNV-CT-NV-M-40', price: calculatePrice(1850000 * getColorMultiplier('Navy'), 'Nam'), originalPrice: 2200000, stock: 15,
            specifications: { size: '40', color: 'Navy', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nam' }, isAvailable: true },
          { variantName: 'Size 41 - Navy - Nam', sku: 'CNV-CT-NV-M-41', price: calculatePrice(1850000 * getColorMultiplier('Navy'), 'Nam'), originalPrice: 2200000, stock: 18,
            specifications: { size: '41', color: 'Navy', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nam' }, isAvailable: true },
          
          // Pink - Nữ (màu hiếm +25%)
          { variantName: 'Size 36 - Pink - Nữ', sku: 'CNV-CT-PK-F-36', price: Math.round(1950000 * getColorMultiplier('Pink')), originalPrice: 2400000, stock: 8,
            specifications: { size: '36', color: 'Pink', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nữ' }, isAvailable: true },
          { variantName: 'Size 37 - Pink - Nữ', sku: 'CNV-CT-PK-F-37', price: Math.round(1950000 * getColorMultiplier('Pink')), originalPrice: 2400000, stock: 10,
            specifications: { size: '37', color: 'Pink', material: 'Canvas', shoeType: 'Sneakers', gender: 'Nữ' }, isAvailable: true },
          
          // Yellow - Unisex (màu hot +10%)
          { variantName: 'Size 38 - Yellow - Unisex', sku: 'CNV-CT-YL-U-38', price: calculatePrice(1800000 * getColorMultiplier('Yellow'), 'Unisex'), originalPrice: 2200000, stock: 12,
            specifications: { size: '38', color: 'Yellow', material: 'Canvas', shoeType: 'Sneakers', gender: 'Unisex' }, isAvailable: true },
          { variantName: 'Size 39 - Yellow - Unisex', sku: 'CNV-CT-YL-U-39', price: calculatePrice(1800000 * getColorMultiplier('Yellow'), 'Unisex'), originalPrice: 2200000, stock: 14,
            specifications: { size: '39', color: 'Yellow', material: 'Canvas', shoeType: 'Sneakers', gender: 'Unisex' }, isAvailable: true },
        ],
        images: [
          'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw6f1c0e4d/images/a_107/M9160_A_107X1.jpg',
          'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwa1ec70e7/images/a_107/162050C_A_107X1.jpg',
        ],
        createdBy: seller._id,
        features: ['Thiết kế cổ điển', 'Canvas thoáng khí', 'Giá nữ đắt hơn nam'],
        isActive: true,
      },
    ]

    // Insert products
    for (const productData of shoeProducts) {
      await Product.create(productData)
      console.log(`✅ Created: ${productData.name}`)
    }

    console.log('🎉 Seeding completed!')
  }
}
