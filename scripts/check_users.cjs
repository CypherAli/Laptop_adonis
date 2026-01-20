/**
 * Check users in database
 * Run: node scripts/check_users.cjs
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://trinhviethoangawm:Th250904!@cluster0.bl8xpdl.mongodb.net/shoe_shop?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  shopName: String,
  isApproved: Boolean,
  isActive: Boolean,
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const allUsers = await User.find({}).select('username email role shopName');
    
    console.log(`📊 Total users: ${allUsers.length}\n`);

    // Group by role
    const admins = allUsers.filter(u => u.role === 'admin');
    const partners = allUsers.filter(u => u.role === 'partner');
    const clients = allUsers.filter(u => u.role === 'client');

    console.log('=== ADMINS ===');
    admins.forEach(u => console.log(`  👑 ${u.username} (${u.email})`));

    console.log('\n=== PARTNERS ===');
    partners.forEach(u => console.log(`  🏪 ${u.username} (${u.email}) - ${u.shopName || 'No shop name'}`));

    console.log('\n=== CLIENTS ===');
    clients.forEach(u => console.log(`  👥 ${u.username} (${u.email})`));

    console.log(`\n📈 Summary: ${admins.length} admins, ${partners.length} partners, ${clients.length} clients`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkUsers();
