const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function fixUsers() {
  try {
    await mongoose.connect(
      'mongodb+srv://trinhviethoangawm:Th250904!@cluster0.bl8xpdl.mongodb.net/shoe_shop?retryWrites=true&w=majority'
    )
    console.log('✅ Connected to MongoDB')

    // Delete all users
    const deleteResult = await mongoose.connection.db.collection('users').deleteMany({})
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} users`)

    // Hash password
    const hash = await bcrypt.hash('123456', 10)
    console.log('🔐 Password hashed')

    // Create new users
    const users = [
      {
        username: 'admin1',
        email: 'admin1@shoestore.vn',
        password: hash,
        role: 'admin',
        isApproved: true,
        isActive: true,
        phone: '0901234561',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'user1',
        email: 'user1@gmail.com',
        password: hash,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0912345671',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'user2',
        email: 'user2@gmail.com',
        password: hash,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0912345672',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'nike',
        email: 'nike@shoestore.vn',
        password: hash,
        role: 'partner',
        shopName: 'Nike Official Store',
        shopDescription: 'Nike chính hãng',
        isApproved: true,
        isActive: true,
        phone: '0902345671',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const result = await mongoose.connection.db.collection('users').insertMany(users)
    console.log(`✅ Inserted ${result.insertedCount} users`)

    // Verify
    const count = await mongoose.connection.db.collection('users').countDocuments()
    console.log(`📊 Total users in DB: ${count}`)

    // Show one user
    const testUser = await mongoose.connection.db.collection('users').findOne({ username: 'user1' })
    console.log('\n🔍 Test user1:')
    console.log('   username:', testUser.username)
    console.log('   email:', testUser.email)
    console.log('   role:', testUser.role)
    console.log('   hasPassword:', !!testUser.password)
    console.log('   isActive:', testUser.isActive)

    console.log('\n✅ All done! You can now login with:')
    console.log('   - user1@gmail.com / 123456')
    console.log('   - user2@gmail.com / 123456')
    console.log('   - nike@shoestore.vn / 123456')
    console.log('   - admin1@shoestore.vn / 123456')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixUsers()
