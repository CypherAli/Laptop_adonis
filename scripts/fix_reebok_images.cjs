const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/adonis_app')
  .then(async () => {
    console.log('Connected to MongoDB');

    // Get Product model
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // Find products with Reebok images
    const products = await Product.find({
      images: { $elemMatch: { $regex: 'assets.reebok.com' } }
    });

    console.log(`Found ${products.length} products with Reebok CDN images`);

    // Update each product
    for (const product of products) {
      const updatedImages = product.images.map(img => {
        if (img.includes('Classic_Leather')) {
          return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop';
        } else if (img.includes('Club_C_85')) {
          return 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop';
        }
        return img;
      });

      product.images = updatedImages;
      await product.save();
      console.log(`Updated product: ${product.name}`);
    }

    console.log('All products updated successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
