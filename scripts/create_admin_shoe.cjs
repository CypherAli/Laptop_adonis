const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGO_URI = 'mongodb+srv://trinhviethoangawm:Th250904!@cluster0.bl8xpdl.mongodb.net/shoe_shop?retryWrites=true&w=majority'

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    const usersCollection = db.collection('users')

    // Check if admin@shoe.com exists
    const existingUser = await usersCollection.findOne({ email: 'admin@shoe.com' })
    if (existingUser) {
      console.log('⚠️  User admin@shoe.com already exists')
      
      // Update password
      const hashedPassword = await bcrypt.hash('123456', 10)
      await usersCollection.updateOne(
        { email: 'admin@shoe.com' },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      )
      console.log('✅ Updated password to 123456')
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('123456', 10)
      
      const newAdmin = {
        username: 'admin',
        email: 'admin@shoe.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await usersCollection.insertOne(newAdmin)
      console.log('✅ Created new admin account: admin@shoe.com')
    }

    console.log('\n📋 Login credentials:')
    console.log('   Email: admin@shoe.com')
    console.log('   Password: 123456')
    console.log('   Role: admin')

    await mongoose.connection.close()
    console.log('\n✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAdmin()
