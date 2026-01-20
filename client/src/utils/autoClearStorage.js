// Auto clear localStorage on app load to fix NaN prices
const AUTO_CLEAR_KEY = 'auto_cleared_v1';

if (!localStorage.getItem(AUTO_CLEAR_KEY)) {
  console.log('🔄 Auto clearing old cart data...');
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('cart') || key.includes('Cart')) {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem(AUTO_CLEAR_KEY, 'true');
  console.log('✅ Old cart data cleared!');
}
