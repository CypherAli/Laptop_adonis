import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { User } from '#models/user'

export default class ResetPasswords extends BaseCommand {
  static commandName = 'reset:passwords'
  static description = 'Reset all user passwords to 123456'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      this.logger.info('Resetting all passwords to: 123456')

      const bcryptModule = await import('bcryptjs')
      const bcrypt = bcryptModule.default
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash('123456', salt)

      // Direct update bypassing validation
      const result = await User.updateMany({}, { $set: { password: hashedPassword } })

      console.log('')
      this.logger.success(`✅ Reset ${result.modifiedCount} passwords successfully!`)
      console.log('')
      console.log('All users now have password: 123456')
      console.log('')
      console.log('Login examples:')
      console.log('- admin@laptop.com / 123456')
      console.log('- client@laptop.com / 123456')
      console.log('- partner1@laptop.com / 123456')
      console.log('- trinhviethoangawm@gmail.com / 123456')
    } catch (error) {
      this.logger.error('Failed to reset passwords:', error)
      this.exitCode = 1
    }
  }
}
