/**
 * Quick API Test Script
 * Test các endpoints chính
 */

const testAPI = async () => {
  console.log('🧪 Testing API Endpoints...\n');

  const baseURL = 'http://localhost:3333/api';
  const tests = [];

  // Test 1: Health check
  try {
    const response = await fetch(`${baseURL}/test`);
    const data = await response.json();
    console.log('✅ Test endpoint:', data.message);
    tests.push({ name: 'Health Check', status: 'PASS' });
  } catch (error) {
    console.log('❌ Test endpoint failed:', error.message);
    tests.push({ name: 'Health Check', status: 'FAIL', error: error.message });
  }

  // Test 2: Get products
  try {
    const response = await fetch(`${baseURL}/products?limit=3`);
    const data = await response.json();
    console.log(`\n✅ Products endpoint: ${data.products.length} products`);
    console.log('   Sample:', data.products[0]?.name);
    tests.push({ name: 'Get Products', status: 'PASS', count: data.products.length });
  } catch (error) {
    console.log('\n❌ Products endpoint failed:', error.message);
    tests.push({ name: 'Get Products', status: 'FAIL', error: error.message });
  }

  // Test 3: Get featured products
  try {
    const response = await fetch(`${baseURL}/products/featured`);
    const data = await response.json();
    console.log(`\n✅ Featured products: ${data.products.length} items`);
    tests.push({ name: 'Featured Products', status: 'PASS', count: data.products.length });
  } catch (error) {
    console.log('\n❌ Featured products failed:', error.message);
    tests.push({ name: 'Featured Products', status: 'FAIL', error: error.message });
  }

  // Test 4: Test protected route (should fail without token)
  try {
    const response = await fetch(`${baseURL}/auth/me`);
    if (response.status === 401) {
      console.log('\n✅ Auth protection working (401 Unauthorized)');
      tests.push({ name: 'Auth Protection', status: 'PASS' });
    } else {
      console.log('\n⚠️  Auth protection may not be working correctly');
      tests.push({ name: 'Auth Protection', status: 'WARNING' });
    }
  } catch (error) {
    console.log('\n❌ Auth test failed:', error.message);
    tests.push({ name: 'Auth Protection', status: 'FAIL', error: error.message });
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const warnings = tests.filter(t => t.status === 'WARNING').length;

  tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${test.name}: ${test.status}`);
    if (test.count !== undefined) console.log(`   Count: ${test.count}`);
    if (test.error) console.log(`   Error: ${test.error}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 All API tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check server logs.');
  }
};

// Run tests
testAPI().catch(console.error);
