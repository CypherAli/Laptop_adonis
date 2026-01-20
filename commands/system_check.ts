/**
 * System Health Check Script
 * Kiểm tra tất cả các thành phần của hệ thống
 */

import mongoose from 'mongoose'
import env from '#start/env'
import { Product } from '#models/product'
import { User } from '#models/user'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class SystemCheck extends BaseCommand {
  static commandName = 'system:check'
  static description = 'Run comprehensive system health check'

  static options: CommandOptions = {
    startApp: false,
  }

  async run() {
    this.logger.info('🔍 Starting System Health Check...\n')

    const results = {
      passed: 0,
      failed: 0,
      warnings: 0,
    }

    // 1. MongoDB Connection
    try {
      this.logger.info('1️⃣  Checking MongoDB connection...')
      await mongoose.connect(env.get('MONGODB_URI'))
      this.logger.success('   ✓ MongoDB connected successfully')
      this.logger.info(`   Database: ${mongoose.connection.name}`)
      results.passed++
    } catch (error) {
      this.logger.error('   ✗ MongoDB connection failed:', error.message)
      results.failed++
      return this.printSummary(results)
    }

    // 2. Check Products
    try {
      this.logger.info('\n2️⃣  Checking Products...')
      const productCount = await Product.countDocuments()
      const activeProducts = await Product.countDocuments({ isActive: true })
      const featuredProducts = await Product.countDocuments({ isFeatured: true })

      if (productCount === 0) {
        this.logger.warning('   ⚠ No products found in database')
        this.logger.info('   Run: node ace seed:products')
        results.warnings++
      } else {
        this.logger.success(`   ✓ Total products: ${productCount}`)
        this.logger.info(`   Active products: ${activeProducts}`)
        this.logger.info(`   Featured products: ${featuredProducts}`)

        // Check brands
        const brands = await Product.distinct('brand')
        this.logger.info(`   Brands: ${brands.join(', ')}`)

        results.passed++
      }
    } catch (error) {
      this.logger.error('   ✗ Product check failed:', error.message)
      results.failed++
    }

    // 3. Check Users
    try {
      this.logger.info('\n3️⃣  Checking Users...')
      const userCount = await User.countDocuments()
      const adminCount = await User.countDocuments({ role: 'admin' })
      const partnerCount = await User.countDocuments({ role: 'partner' })
      const clientCount = await User.countDocuments({ role: 'client' })
      const approvedPartners = await User.countDocuments({
        role: 'partner',
        isApproved: true,
      })

      if (adminCount === 0) {
        this.logger.warning('   ⚠ No admin user found')
        this.logger.info('   Run: node ace seed:products (creates admin)')
        results.warnings++
      } else {
        this.logger.success(`   ✓ Admin users: ${adminCount}`)
        results.passed++
      }

      this.logger.info(`   Total users: ${userCount}`)
      this.logger.info(`   Partners: ${partnerCount} (Approved: ${approvedPartners})`)
      this.logger.info(`   Clients: ${clientCount}`)
    } catch (error) {
      this.logger.error('   ✗ User check failed:', error.message)
      results.failed++
    }

    // 4. Check Environment Variables
    try {
      this.logger.info('\n4️⃣  Checking Environment Variables...')
      const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT']
      let allPresent = true

      for (const varName of requiredVars) {
        const value = env.get(varName as any)
        if (!value) {
          this.logger.error(`   ✗ Missing: ${varName}`)
          allPresent = false
        }
      }

      if (allPresent) {
        this.logger.success('   ✓ All required environment variables present')
        results.passed++
      } else {
        results.failed++
      }

      // Check JWT Secret strength
      const jwtSecret = env.get('JWT_SECRET')
      if (jwtSecret && jwtSecret.length < 32) {
        this.logger.warning('   ⚠ JWT_SECRET should be at least 32 characters')
        results.warnings++
      }
    } catch (error) {
      this.logger.error('   ✗ Environment check failed:', error.message)
      results.failed++
    }

    // 5. Check Database Indexes
    try {
      this.logger.info('\n5️⃣  Checking Database Indexes...')
      const productIndexes = await Product.collection.getIndexes()
      const userIndexes = await User.collection.getIndexes()

      this.logger.success(`   ✓ Product indexes: ${Object.keys(productIndexes).length}`)
      this.logger.success(`   ✓ User indexes: ${Object.keys(userIndexes).length}`)
      results.passed++
    } catch (error) {
      this.logger.error('   ✗ Index check failed:', error.message)
      results.failed++
    }

    // 6. Sample Queries Performance
    try {
      this.logger.info('\n6️⃣  Testing Query Performance...')

      const start1 = Date.now()
      await Product.find({ isActive: true }).limit(10)
      const time1 = Date.now() - start1

      const start2 = Date.now()
      await Product.find({ brand: 'Nike' })
      const time2 = Date.now() - start2

      this.logger.success(`   ✓ Active products query: ${time1}ms`)
      this.logger.success(`   ✓ Brand filter query: ${time2}ms`)

      if (time1 > 100 || time2 > 100) {
        this.logger.warning('   ⚠ Queries are slow, consider adding indexes')
        results.warnings++
      } else {
        results.passed++
      }
    } catch (error) {
      this.logger.error('   ✗ Performance test failed:', error.message)
      results.failed++
    }

    // Print Summary
    await mongoose.disconnect()
    this.printSummary(results)
  }

  private printSummary(results: { passed: number; failed: number; warnings: number }) {
    this.logger.info('\n' + '='.repeat(50))
    this.logger.info('📊 HEALTH CHECK SUMMARY')
    this.logger.info('='.repeat(50))

    this.logger.success(`✓ Passed:   ${results.passed}`)
    this.logger.error(`✗ Failed:   ${results.failed}`)
    this.logger.warning(`⚠ Warnings: ${results.warnings}`)

    this.logger.info('='.repeat(50))

    if (results.failed === 0 && results.warnings === 0) {
      this.logger.success('\n🎉 All systems operational!')
    } else if (results.failed === 0) {
      this.logger.warning('\n⚠️  System operational with warnings')
    } else {
      this.logger.error('\n❌ System has critical issues')
      this.exitCode = 1
    }
  }
}
