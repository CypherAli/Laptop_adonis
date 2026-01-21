const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function resetPasswords() {
  try {
    // Connect to MongoDB Atlas
    const uri = 'mongodb+srv://trinhviethoangawm:Th250904!@cluster0.bl8xpdl.mongodb.net/shoe_shop?retryWrites=true&w=majority'
    
    console.log('🔌 Connecting to MongoDB Atlas...')
    await mongoose.connect(uri)
    console.log('✅ Connected!')

    // Define User schema
    const UserSchema = new mongoose.Schema({}, { strict: false })
    const User = mongoose.model('User', UserSchema)

    // Hash password
    console.log('\n🔐 Hashing password "123456"...')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('123456', salt)
    console.log('✅ Hash created:', hashedPassword.substring(0, 30) + '...')

    // Verify hash works
    const testMatch = await bcrypt.compare('123456', hashedPassword)
    console.log('🧪 Test match:', testMatch ? '✅ PASS' : '❌ FAIL')

    // Update all users
    console.log('\n📝 Updating all users...')
    const result = await User.updateMany(
      {},
      { $set: { password: hashedPassword } }
    )

    console.log(`✅ Updated ${result.modifiedCount} users!`)

    // Get sample user to verify
    const sampleUser = await User.findOne({ email: 'admin@shoe.com' })
    if (sampleUser) {
      console.log('\n🔍 Verifying admin@shoe.com...')
      const match = await bcrypt.compare('123456', sampleUser.password)
      console.log('Password match:', match ? '✅ SUCCESS' : '❌ FAILED')
      console.log('Hash in DB:', sampleUser.password.substring(0, 30) + '...')
    }

    console.log('\n✅ ALL DONE! You can now login with password: 123456')
    console.log('Examples:')
    console.log('  - admin@shoe.com / 123456')
    console.log('  - nike@shoestore.vn / 123456')
    console.log('  - user1@gmail.com / 123456')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

resetPasswords()
