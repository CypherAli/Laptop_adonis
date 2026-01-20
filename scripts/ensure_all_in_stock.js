/**
 * Đảm bảo TẤT CẢ sản phẩm đều CÒN HÀNG
 * Run: node scripts/ensure_all_in_stock.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  variants: [{
    variantName: String,
    sku: String,
    stock: Number,
    isAvailable: Boolean,
  }],
})

const Product = mongoose.model('Product', productSchema)

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB Connected')

    // Update ALL products to have stock
    const result = await Product.updateMany(
      {},
      {
        $set: {
          'variants.$[].stock': 25,  // Set mỗi variant có 25 sản phẩm
          'variants.$[].isAvailable': true,
        }
      }
    )

    console.log(`\n✅ Updated ${result.modifiedCount} products`)
    console.log('🎉 TẤT CẢ sản phẩm giờ đều CÒN HÀNG (stock: 25)\n')

    // Verify
    const products = await Product.find({})
    let totalVariants = 0
    let inStockVariants = 0

    products.forEach(p => {
      p.variants.forEach(v => {
        totalVariants++
        if (v.stock > 0) inStockVariants++
      })
    })

    console.log('📊 Thống kê:')
    console.log(`   - Tổng sản phẩm: ${products.length}`)
    console.log(`   - Tổng variants: ${totalVariants}`)
    console.log(`   - Còn hàng: ${inStockVariants}/${totalVariants}`)
    console.log(`   - Hết hàng: ${totalVariants - inStockVariants}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

run()
