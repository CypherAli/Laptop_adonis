/**
 * Xóa tất cả carts để reload lại data mới
 * Run: node scripts/clear_carts.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

const cartSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  items: Array,
})

const Cart = mongoose.model('Cart', cartSchema)

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB Connected')

    const result = await Cart.deleteMany({})
    console.log(`\n🗑️  Deleted ${result.deletedCount} carts`)
    console.log('✅ Bây giờ về trang Home và thêm sản phẩm mới vào cart!\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

run()
