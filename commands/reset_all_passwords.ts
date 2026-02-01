import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { User } from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class ResetAllPasswords extends BaseCommand {
  static commandName = 'reset:passwords'
  static description = 'Reset tất cả mật khẩu user thành 123456 và bỏ khóa tài khoản'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('🔄 Đang reset mật khẩu tất cả users...')

    try {
      const newPassword = '123456'
      const hashedPassword = await hash.make(newPassword)

      // Update tất cả users
      const result = await User.updateMany(
        {},
        {
          password: hashedPassword,
          isActive: true, // Bỏ khóa tất cả tài khoản
          loginAttempts: 0, // Reset số lần đăng nhập sai
          lockUntil: null, // Bỏ khóa thời gian
        }
      )

      this.logger.success(`✅ Đã reset mật khẩu cho ${result.modifiedCount} users`)
      this.logger.info(`📝 Mật khẩu mới: ${newPassword}`)
      this.logger.info(`🔓 Đã bỏ khóa tất cả tài khoản`)

      // Hiển thị danh sách users
      const users = await User.find({}).select('username email role isActive').lean()

      this.logger.info('\n📋 Danh sách tài khoản:')
      users.forEach((user: any) => {
        const status = user.isActive ? '✅ Active' : '❌ Locked'
        this.logger.info(`  - ${user.email} (${user.username}) - ${user.role} - ${status}`)
      })
    } catch (error) {
      this.logger.error('❌ Lỗi khi reset mật khẩu:', error)
      this.exitCode = 1
    }
  }
}
