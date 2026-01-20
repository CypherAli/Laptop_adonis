/**
 * Seed multiple accounts with password 123456
 * Usage: node ace seed_accounts
 */

import { BaseCommand } from '@adonisjs/core/ace'
import { User } from '#models/user'
import bcrypt from 'bcryptjs'

export default class SeedAccounts extends BaseCommand {
  static commandName = 'seed_accounts'
  static description = 'Seed multiple admin, user, and partner accounts'

  async run() {
    this.logger.info('🌱 Starting to seed accounts...')

    const hashedPassword = await bcrypt.hash('123456', 10)

    const accounts = [
      // Admin accounts
      {
        username: 'admin1',
        email: 'admin1@shoestore.vn',
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
        isActive: true,
        phone: '0901234561',
      },
      {
        username: 'admin2',
        email: 'admin2@shoestore.vn',
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
        isActive: true,
        phone: '0901234562',
      },
      {
        username: 'superadmin',
        email: 'superadmin@shoestore.vn',
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
        isActive: true,
        phone: '0901234560',
      },

      // Partner accounts (Shoe sellers)
      {
        username: 'nikeshop',
        email: 'nike@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Nike Official Store',
        shopDescription: 'Cửa hàng chính thức Nike tại Việt Nam',
        isApproved: true,
        isActive: true,
        phone: '0902345671',
      },
      {
        username: 'adidasshop',
        email: 'adidas@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Adidas Official Store',
        shopDescription: 'Cửa hàng chính thức Adidas tại Việt Nam',
        isApproved: true,
        isActive: true,
        phone: '0902345672',
      },
      {
        username: 'vansshop',
        email: 'vans@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Vans Authentic Store',
        shopDescription: 'Giày Vans chính hãng - Phong cách đường phố',
        isApproved: true,
        isActive: true,
        phone: '0902345673',
      },
      {
        username: 'converseshop',
        email: 'converse@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Converse Store Vietnam',
        shopDescription: 'Converse - Classic never dies',
        isApproved: true,
        isActive: true,
        phone: '0902345674',
      },
      {
        username: 'pumasho',
        email: 'puma@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Puma Official Store',
        shopDescription: 'Puma - Forever Faster',
        isApproved: true,
        isActive: true,
        phone: '0902345675',
      },
      {
        username: 'newbalanceshop',
        email: 'newbalance@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'New Balance Vietnam',
        shopDescription: 'New Balance - Made for champions',
        isApproved: true,
        isActive: true,
        phone: '0902345676',
      },

      // Regular user accounts
      {
        username: 'user1',
        email: 'user1@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0903456781',
      },
      {
        username: 'user2',
        email: 'user2@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0903456782',
      },
      {
        username: 'user3',
        email: 'user3@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0903456783',
      },
      {
        username: 'nguyenvana',
        email: 'nguyenvana@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567891',
      },
      {
        username: 'tranthib',
        email: 'tranthib@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567892',
      },
      {
        username: 'levanc',
        email: 'levanc@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567893',
      },
      {
        username: 'phamthid',
        email: 'phamthid@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567894',
      },
      {
        username: 'hoangvane',
        email: 'hoangvane@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567895',
      },
    ]

    try {
      for (const accountData of accounts) {
        // Check if user already exists
        const existing = await User.findOne({ email: accountData.email })

        if (existing) {
          this.logger.warning(`⚠️  Account ${accountData.email} already exists, skipping...`)
          continue
        }

        const user = await User.create(accountData)
        this.logger.success(
          `✅ Created ${user.role}: ${user.username} (${user.email}) - Shop: ${user.shopName || 'N/A'}`
        )
      }

      this.logger.info('\n=== ACCOUNT SUMMARY ===')
      const adminCount = await User.countDocuments({ role: 'admin' })
      const partnerCount = await User.countDocuments({ role: 'partner' })
      const clientCount = await User.countDocuments({ role: 'client' })

      this.logger.info(`👑 Admins: ${adminCount}`)
      this.logger.info(`🏪 Partners: ${partnerCount}`)
      this.logger.info(`👥 Clients: ${clientCount}`)
      this.logger.info(`\n🔑 All passwords: 123456`)
      this.logger.success('\n✅ Accounts seeded successfully!')
    } catch (error) {
      this.logger.error(`❌ Error seeding accounts: ${error.message}`)
      throw error
    }
  }
}
