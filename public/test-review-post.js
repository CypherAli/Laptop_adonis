console.log('Testing Review POST API...')

// Get token from localStorage
const token = localStorage.getItem('token')
console.log('Token found:', !!token)

if (!token) {
  console.error('❌ No token found! Please login first.')
  alert('Please login first!')
} else {
  // Test data
  const testReview = {
    productId: '6971a43994c37ec8373612dd',
    orderId: '6978614e1c7913a2ab9f86f5',
    rating: 5,
    title: 'Test Review from Console',
    comment: 'This is a test review created directly from browser console.',
  }

  console.log('Sending POST to http://localhost:3333/api/reviews')
  console.log('Data:', testReview)

  fetch('http://localhost:3333/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(testReview),
  })
    .then((response) => {
      console.log('Response status:', response.status)
      return response.json()
    })
    .then((data) => {
      console.log('✅ Success!', data)
      alert('✅ Review created successfully! Check console for details.')
    })
    .catch((error) => {
      console.error('❌ Error:', error)
      alert('❌ Error creating review. Check console for details.')
    })
}
