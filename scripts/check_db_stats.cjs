const mongoose = require('mongoose');

// Use the actual MongoDB URI from your .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trinhviethoangawm:Th250904!@cluster0.bl8xpdl.mongodb.net/shoe_shop?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB\n');
    console.log('Database:', mongoose.connection.name);

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Review = mongoose.model('Review', new mongoose.Schema({}, { strict: false }));

    const [productCount, orderCount, userCount, reviewCount] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
    ]);

    console.log('📊 Database Statistics:');
    console.log('  Products:', productCount);
    console.log('  Orders:', orderCount);
    console.log('  Users:', userCount);
    console.log('  Reviews:', reviewCount);

    // Sample data
    if (productCount > 0) {
      const sampleProduct = await Product.findOne().select('name basePrice variants');
      console.log('\n📦 Sample Product:', {
        name: sampleProduct.name,
        basePrice: sampleProduct.basePrice,
        variantsCount: sampleProduct.variants?.length || 0
      });
    }

    if (orderCount > 0) {
      const sampleOrder = await Order.findOne().select('totalAmount status paymentStatus');
      console.log('\n📦 Sample Order:', {
        totalAmount: sampleOrder.totalAmount,
        status: sampleOrder.status,
        paymentStatus: sampleOrder.paymentStatus
      });
    }

    if (userCount > 0) {
      const users = await User.find().select('username role');
      console.log('\n👥 Users by Role:');
      const roleCount = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});
      console.log(roleCount);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
