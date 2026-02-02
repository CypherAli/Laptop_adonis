import { BaseCommand } from '@adonisjs/core/ace'
import { User } from '#models/user'

export default class SetAdminLevels extends BaseCommand {
  static commandName = 'set:admin:levels'
  static description = 'Set admin levels for existing admin users'

  async run() {
    this.logger.info('Setting admin levels for existing admin users...')

    try {
      // Find all admin users without adminLevel
      const admins = await User.find({ role: 'admin', adminLevel: { $exists: false } })

      if (admins.length === 0) {
        this.logger.success('No admin users need updating')
        return
      }

      this.logger.info(`Found ${admins.length} admin users without adminLevel`)

      // Update each admin
      for (const admin of admins) {
        // Set first admin as super_admin, others as regular admin
        if (!admin.adminLevel) {
          // You can customize this logic based on your needs
          // For now, setting the first one as super_admin
          admin.adminLevel = admins.indexOf(admin) === 0 ? 'super_admin' : 'admin'
          await admin.save()
          this.logger.info(`Set ${admin.username} (${admin.email}) as ${admin.adminLevel}`)
        }
      }

      this.logger.success('✅ Admin levels set successfully!')
    } catch (error) {
      this.logger.error('Failed to set admin levels')
      this.logger.error(error.message)
    }
  }
}
