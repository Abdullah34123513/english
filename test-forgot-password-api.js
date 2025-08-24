require('dotenv').config()

async function testForgotPasswordAPI() {
  console.log('=== Testing Forgot Password API ===')
  
  const testEmail = 'admin@englishplatform.com' // Use the existing admin user
  
  try {
    const response = await fetch('http://localhost:3000/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    })
    
    const data = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
    if (response.ok) {
      console.log('✅ Forgot password API call successful')
      console.log('Message:', data.message)
    } else {
      console.log('❌ Forgot password API call failed')
      console.log('Error:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error testing forgot password API:', error)
    console.log('Make sure the development server is running on http://localhost:3000')
  }
}

testForgotPasswordAPI()