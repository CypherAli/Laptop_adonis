const mongoose = require('mongoose')

async function fixProductsOwner() {
  try {
    await mongoose.connect(
      'mongodb+srv://trinhviethoangawm:Th250904!@cluster0.bl8xpdl.mongodb.net/shoe_shop?retryWrites=true&w=majority'
    )
    console.log('✅ Connected to MongoDB')

    // Find nike user
    const nike = await mongoose.connection.db.collection('users').findOne({ username: 'nike' })
    
    if (!nike) {
      console.log('❌ Nike user not found!')
      process.exit(1)
    }

    console.log('✅ Nike user found:', nike._id)

    // Update all products to be owned by nike
    const result = await mongoose.connection.db
      .collection('products')
      .updateMany({}, { $set: { createdBy: nike._id } })

    console.log(`✅ Updated ${result.modifiedCount} products to be owned by Nike`)

    // Verify
    const productsWithOwner = await mongoose.connection.db
      .collection('products')
      .countDocuments({ createdBy: { $ne: null } })

    console.log(`✅ All ${productsWithOwner} products now have an owner`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixProductsOwner()
