/**
 * Direct MongoDB seed script
 * Run: node scripts/seed_accounts_direct.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://trinhviethoangawm:Th250904!@cluster0.bl8xpdl.mongodb.net/shoe_shop?retryWrites=true&w=majority';

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  shopName: String,
  shopDescription: String,
  isApproved: Boolean,
  isActive: Boolean,
  phone: String,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: Array,
  paymentMethods: Array,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function seedAccounts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const accounts = [
      // Admin accounts
      {
        username: 'admin1',
        email: 'admin1@shoestore.vn',
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
        isActive: true,
        phone: '0901234561',
      },
      {
        username: 'admin2',
        email: 'admin2@shoestore.vn',
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
        isActive: true,
        phone: '0901234562',
      },
      {
        username: 'superadmin',
        email: 'superadmin@shoestore.vn',
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
        isActive: true,
        phone: '0901234560',
      },

      // Partner accounts
      {
        username: 'nikeshop',
        email: 'nike@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Nike Official Store',
        shopDescription: 'Cửa hàng chính thức Nike tại Việt Nam',
        isApproved: true,
        isActive: true,
        phone: '0902345671',
      },
      {
        username: 'adidasshop',
        email: 'adidas@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Adidas Official Store',
        shopDescription: 'Cửa hàng chính thức Adidas tại Việt Nam',
        isApproved: true,
        isActive: true,
        phone: '0902345672',
      },
      {
        username: 'vansshop',
        email: 'vans@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Vans Authentic Store',
        shopDescription: 'Giày Vans chính hãng - Phong cách đường phố',
        isApproved: true,
        isActive: true,
        phone: '0902345673',
      },
      {
        username: 'converseshop',
        email: 'converse@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Converse Store Vietnam',
        shopDescription: 'Converse - Classic never dies',
        isApproved: true,
        isActive: true,
        phone: '0902345674',
      },
      {
        username: 'pumashop',
        email: 'puma@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'Puma Official Store',
        shopDescription: 'Puma - Forever Faster',
        isApproved: true,
        isActive: true,
        phone: '0902345675',
      },
      {
        username: 'newbalanceshop',
        email: 'newbalance@shoestore.vn',
        password: hashedPassword,
        role: 'partner',
        shopName: 'New Balance Vietnam',
        shopDescription: 'New Balance - Made for champions',
        isApproved: true,
        isActive: true,
        phone: '0902345676',
      },

      // Regular users
      {
        username: 'user1',
        email: 'user1@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0903456781',
      },
      {
        username: 'user2',
        email: 'user2@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0903456782',
      },
      {
        username: 'user3',
        email: 'user3@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0903456783',
      },
      {
        username: 'nguyenvana',
        email: 'nguyenvana@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567891',
      },
      {
        username: 'tranthib',
        email: 'tranthib@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567892',
      },
      {
        username: 'levanc',
        email: 'levanc@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567893',
      },
      {
        username: 'phamthid',
        email: 'phamthid@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567894',
      },
      {
        username: 'hoangvane',
        email: 'hoangvane@gmail.com',
        password: hashedPassword,
        role: 'client',
        isApproved: true,
        isActive: true,
        phone: '0904567895',
      },
    ];

    console.log('\n🌱 Starting to seed accounts...\n');

    for (const accountData of accounts) {
      // Check if user already exists
      const existing = await User.findOne({ email: accountData.email });

      if (existing) {
        console.log(`⚠️  Account ${accountData.email} already exists, skipping...`);
        continue;
      }

      const user = await User.create(accountData);
      console.log(`✅ Created ${user.role}: ${user.username} (${user.email})${user.shopName ? ' - Shop: ' + user.shopName : ''}`);
    }

    console.log('\n=== ACCOUNT SUMMARY ===');
    const adminCount = await User.countDocuments({ role: 'admin' });
    const partnerCount = await User.countDocuments({ role: 'partner' });
    const clientCount = await User.countDocuments({ role: 'client' });

    console.log(`👑 Admins: ${adminCount}`);
    console.log(`🏪 Partners: ${partnerCount}`);
    console.log(`👥 Clients: ${clientCount}`);
    console.log(`\n🔑 All passwords: 123456`);
    console.log('\n✅ Accounts seeded successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedAccounts();
