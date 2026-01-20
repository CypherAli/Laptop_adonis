/**
 * Fix tất cả giá sản phẩm - Đảm bảo không có giá 0
 * Run: node scripts/fix_all_prices.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  basePrice: Number,
  variants: [{
    variantName: String,
    sku: String,
    price: Number,
    originalPrice: Number,
    stock: Number,
    isAvailable: Boolean,
  }],
})

const Product = mongoose.model('Product', productSchema)

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB Connected')

    const products = await Product.find({})
    let fixedCount = 0
    let variantsFixed = 0

    for (const product of products) {
      let productUpdated = false
      
      for (const variant of product.variants) {
        // Fix giá = 0 hoặc undefined
        if (!variant.price || variant.price === 0) {
          variant.price = product.basePrice || 2000000
          variantsFixed++
          productUpdated = true
        }

        // Fix originalPrice
        if (!variant.originalPrice || variant.originalPrice === 0) {
          variant.originalPrice = variant.price * 1.2
          productUpdated = true
        }

        // Đảm bảo stock > 0
        if (!variant.stock || variant.stock === 0) {
          variant.stock = 25
          productUpdated = true
        }

        // Đảm bảo isAvailable = true
        if (!variant.isAvailable) {
          variant.isAvailable = true
          productUpdated = true
        }
      }

      if (productUpdated) {
        await product.save()
        fixedCount++
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} products`)
    console.log(`✅ Fixed ${variantsFixed} variants with price = 0`)
    console.log(`✅ TẤT CẢ sản phẩm giờ có giá > 0!\n`)

    // Verify
    const allProducts = await Product.find({})
    let zeroPrice = 0
    allProducts.forEach(p => {
      p.variants.forEach(v => {
        if (!v.price || v.price === 0) zeroPrice++
      })
    })

    console.log(`📊 Verification:`)
    console.log(`   - Variants với giá 0: ${zeroPrice}`)
    console.log(`   - ${zeroPrice === 0 ? '✅ HOÀN HẢO!' : '❌ VẪN CÒN LỖI'}\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

run()
