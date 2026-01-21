const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/adonis_app')
  .then(async () => {
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const products = await Product.find({ name: { $regex: 'Reebok', $options: 'i' } }).select('name images');
    console.log('Reebok products found:', products.length);
    products.forEach(p => {
      console.log(`\n${p.name}:`);
      p.images.forEach(img => console.log(`  - ${img}`));
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
