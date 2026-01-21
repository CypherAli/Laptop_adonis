const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/adonis_app')
  .then(async () => {
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    // Find all products with reebok images
    const productsWithReebokImages = await Product.find({
      $or: [
        { images: { $regex: 'assets.reebok.com', $options: 'i' } },
        { 'images.0': { $regex: 'assets.reebok.com', $options: 'i' } }
      ]
    }).select('name images');

    console.log(`Found ${productsWithReebokImages.length} products with Reebok CDN URLs`);
    
    if (productsWithReebokImages.length > 0) {
      for (const product of productsWithReebokImages) {
        console.log(`\nProduct: ${product.name}`);
        const updatedImages = product.images.map(img => {
          if (typeof img === 'string' && img.includes('assets.reebok.com')) {
            if (img.includes('Classic_Leather')) {
              console.log(`  Replacing: ${img.substring(0, 60)}...`);
              return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop';
            } else if (img.includes('Club_C_85')) {
              console.log(`  Replacing: ${img.substring(0, 60)}...`);
              return 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop';
            }
          }
          return img;
        });
        
        product.images = updatedImages;
        await product.save();
        console.log(`  ✓ Updated`);
      }
      
      console.log('\n✅ All products updated!');
    } else {
      // Check all products to see what images they have
      const allProducts = await Product.find({}).select('name images').limit(5);
      console.log('\nSample products in database:');
      allProducts.forEach(p => {
        console.log(`\n${p.name}:`);
        if (p.images && p.images.length > 0) {
          p.images.slice(0, 2).forEach(img => console.log(`  ${img.substring(0, 80)}...`));
        }
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
