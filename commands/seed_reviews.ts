import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { User } from '#models/user'
import { Product } from '#models/product'
import { Order } from '#models/order'
import { Review } from '#models/review'

export default class SeedReviews extends BaseCommand {
  static commandName = 'seed:reviews'
  static description = 'Seed reviews for testing'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('🌱 Starting to seed reviews...')

    try {
      // 1. Lấy hoặc tạo test users
      const users = await User.find({ role: 'client' }).limit(3)
      if (users.length === 0) {
        this.logger.error('❌ No client users found. Please create users first.')
        return
      }

      // 2. Lấy products
      const products = await Product.find({ isActive: true }).limit(5)
      if (products.length === 0) {
        this.logger.error('❌ No products found. Please create products first.')
        return
      }

      this.logger.info(`✅ Found ${users.length} users and ${products.length} products`)

      // 3. Tạo orders với status = delivered
      const ordersCreated = []
      for (let i = 0; i < Math.min(users.length, 3); i++) {
        const user = users[i]
        const product = products[i % products.length]

        // Check nếu đã có order delivered cho user này và product này
        const existingOrder = await Order.findOne({
          'user': user._id,
          'items.product': product._id,
          'status': 'delivered',
        })

        if (!existingOrder) {
          const order = new Order({
            orderNumber: `ORD-TEST-${Date.now()}-${i}`,
            user: user._id,
            items: [
              {
                product: product._id,
                variantSku: product.variants?.[0]?.sku || 'default-sku',
                quantity: 1,
                price: product.basePrice || 100000,
                status: 'delivered',
              },
            ],
            subtotal: product.basePrice || 100000,
            shippingFee: 30000,
            tax: 0,
            discount: 0,
            totalAmount: (product.basePrice || 100000) + 30000,
            status: 'delivered',
            statusHistory: [
              {
                status: 'delivered',
                note: 'Order delivered successfully',
                timestamp: new Date(),
              },
            ],
            paymentMethod: 'cod',
            paymentStatus: 'paid',
            shippingAddress: {
              fullName: user.username,
              phone: user.phone || '0123456789',
              address: {
                street: '123 Test Street',
                ward: 'Test Ward',
                district: 'Test District',
                city: 'Ho Chi Minh',
                zipCode: '70000',
              },
            },
            actualDelivery: new Date(),
          })

          await order.save()
          ordersCreated.push({ order, user, product })
          this.logger.info(`✅ Created order ${order.orderNumber} for ${user.username}`)
        } else {
          ordersCreated.push({ order: existingOrder, user, product })
          this.logger.info(
            `ℹ️  Order already exists for ${user.username} and product ${product.name}`
          )
        }
      }

      // 4. Tạo reviews
      const reviewsData = [
        {
          rating: 5,
          title: 'Sản phẩm tuyệt vời!',
          comment:
            'Giày rất đẹp và chất lượng. Đi rất thoải mái, không bị đau chân. Giao hàng nhanh, đóng gói cẩn thận. Rất hài lòng với sản phẩm này!',
          pros: ['Chất lượng tốt', 'Đi thoải mái', 'Giao hàng nhanh'],
          cons: [],
        },
        {
          rating: 4,
          title: 'Đẹp nhưng hơi chật',
          comment:
            'Thiết kế đẹp, màu sắc đúng như hình. Tuy nhiên size hơi nhỏ so với mô tả. Nên đặt size lớn hơn 1 size. Chất liệu da tốt.',
          pros: ['Thiết kế đẹp', 'Chất liệu tốt'],
          cons: ['Size nhỏ hơn thực tế'],
        },
        {
          rating: 5,
          title: 'Rất đáng mua!',
          comment:
            'Giày đẹp, form chuẩn, chất lượng tốt. Đế giày êm, đi cả ngày không mỏi chân. Giá cả hợp lý. Sẽ ủng hộ shop tiếp!',
          pros: ['Form chuẩn', 'Đế êm', 'Giá tốt'],
          cons: [],
        },
      ]

      let reviewCount = 0
      for (const [i, { order, user, product }] of ordersCreated.entries()) {
        const reviewData = reviewsData[i % reviewsData.length]

        // Check nếu đã có review
        const existingReview = await Review.findOne({
          product: product._id,
          user: user._id,
        })

        if (!existingReview) {
          const review = new Review({
            product: product._id,
            user: user._id,
            order: order._id,
            rating: reviewData.rating,
            title: reviewData.title,
            comment: reviewData.comment,
            pros: reviewData.pros,
            cons: reviewData.cons,
            isVerifiedPurchase: true,
            isApproved: true,
            helpfulCount: Math.floor(Math.random() * 10),
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random trong 7 ngày qua
          })

          await review.save()
          reviewCount++
          this.logger.info(
            `✅ Created review for product "${product.name}" by ${user.username} (${reviewData.rating} stars)`
          )

          // Cập nhật product rating
          const allReviews = await Review.find({ product: product._id, isApproved: true })
          if (allReviews.length > 0) {
            const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
            const avgRating = totalRating / allReviews.length
            await Product.findByIdAndUpdate(product._id, {
              rating: Math.round(avgRating * 10) / 10,
              reviewCount: allReviews.length,
            })
            this.logger.info(
              `   Updated product rating: ${avgRating.toFixed(1)} (${allReviews.length} reviews)`
            )
          }
        } else {
          this.logger.info(
            `ℹ️  Review already exists for ${user.username} and product ${product.name}`
          )
        }
      }

      // 5. Tạo thêm một số reviews với pending status để test moderation
      if (ordersCreated.length > 0 && products.length > 3) {
        const { user } = ordersCreated[0]
        const product = products[3]

        // Tạo order cho product mới
        const newOrder = new Order({
          orderNumber: `ORD-TEST-PENDING-${Date.now()}`,
          user: user._id,
          items: [
            {
              product: product._id,
              variantSku: product.variants?.[0]?.sku || 'default-sku',
              quantity: 1,
              price: product.basePrice || 100000,
              status: 'delivered',
            },
          ],
          subtotal: product.basePrice || 100000,
          shippingFee: 30000,
          tax: 0,
          discount: 0,
          totalAmount: (product.basePrice || 100000) + 30000,
          status: 'delivered',
          statusHistory: [
            {
              status: 'delivered',
              note: 'Order delivered successfully',
              timestamp: new Date(),
            },
          ],
          paymentMethod: 'cod',
          paymentStatus: 'paid',
          shippingAddress: {
            fullName: user.username,
            phone: user.phone || '0123456789',
            address: {
              street: '123 Test Street',
              ward: 'Test Ward',
              district: 'Test District',
              city: 'Ho Chi Minh',
              zipCode: '70000',
            },
          },
          actualDelivery: new Date(),
        })
        await newOrder.save()

        const pendingReview = new Review({
          product: product._id,
          user: user._id,
          order: newOrder._id,
          rating: 3,
          title: 'Review đang chờ duyệt',
          comment: 'Đây là review pending để test chức năng moderation của admin.',
          pros: ['Test feature'],
          cons: [],
          isVerifiedPurchase: true,
          isApproved: false, // Pending approval
          helpfulCount: 0,
        })
        await pendingReview.save()
        reviewCount++
        this.logger.info(`✅ Created pending review for moderation test`)
      }

      this.logger.info(`\n🎉 Successfully seeded ${reviewCount} reviews!`)
      this.logger.info(`\n📊 Summary:`)
      this.logger.info(`   - Orders created/verified: ${ordersCreated.length}`)
      this.logger.info(`   - Reviews created: ${reviewCount}`)
      this.logger.info(`\n✨ You can now:`)
      this.logger.info(`   1. View reviews in Admin Dashboard → Reviews tab`)
      this.logger.info(`   2. View reviews on product detail pages`)
      this.logger.info(`   3. Test moderation by approving/rejecting pending reviews`)
    } catch (error) {
      this.logger.error(`❌ Error seeding reviews: ${error.message}`)
      console.error(error)
    }
  }
}
