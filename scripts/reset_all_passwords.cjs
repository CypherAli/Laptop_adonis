const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGO_URI = 'mongodb+srv://trinhviethoangawm:Th250904!@cluster0.bl8xpdl.mongodb.net/shoe_shop?retryWrites=true&w=majority'
const NEW_PASSWORD = '123456'

async function resetAllPasswords() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10)
    console.log('🔒 Password hashed:', hashedPassword)
    console.log('🔑 New password for ALL accounts: ' + NEW_PASSWORD)
    console.log('\n' + '='.repeat(60))

    // Get all collections
    const collections = await db.listCollections().toArray()
    console.log(`\n📦 Found ${collections.length} collections in database`)
    
    let totalUpdated = 0
    const updatedRecords = []

    // Check each collection for password field
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      const collection = db.collection(collectionName)
      
      // Check if collection has documents with password field
      const sampleDoc = await collection.findOne({ password: { $exists: true } })
      
      if (sampleDoc) {
        console.log(`\n🔍 Processing collection: ${collectionName}`)
        
        // Count documents with password
        const count = await collection.countDocuments({ password: { $exists: true } })
        console.log(`   📊 Found ${count} documents with password field`)
        
        // Get all documents before update
        const beforeDocs = await collection
          .find({ password: { $exists: true } })
          .toArray()
        
        // Update all passwords in this collection
        const result = await collection.updateMany(
          { password: { $exists: true } },
          { 
            $set: { 
              password: hashedPassword,
              updatedAt: new Date()
            } 
          }
        )
        
        console.log(`   ✅ Updated ${result.modifiedCount} documents`)
        totalUpdated += result.modifiedCount
        
        // Store updated records info
        beforeDocs.forEach(doc => {
          updatedRecords.push({
            collection: collectionName,
            identifier: doc.email || doc.username || doc.name || doc._id.toString(),
            role: doc.role || 'N/A'
          })
        })
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log(`\n✅ COMPLETED: Updated ${totalUpdated} passwords across all collections`)
    console.log(`🔑 All passwords are now: ${NEW_PASSWORD}`)
    
    if (updatedRecords.length > 0) {
      console.log('\n📋 All updated accounts:')
      updatedRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. [${record.collection}] ${record.identifier} (${record.role})`)
      })
    }

    await mongoose.connection.close()
    console.log('\n✅ Database connection closed')
    console.log('='.repeat(60))
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

resetAllPasswords()
