// Test script to check if messages API is working
const fetch = require('node-fetch');

async function testMessagesAPI() {
  try {
    // Test GET messages endpoint
    console.log('Testing GET /api/messages...');
    const getResponse = await fetch('http://localhost:3000/api/messages?userId=test-user-1&otherUserId=test-user-2');
    console.log('GET Response status:', getResponse.status);
    console.log('GET Response body:', await getResponse.json());

    // Test POST messages endpoint
    console.log('\nTesting POST /api/messages...');
    const postResponse = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiverId: 'test-user-2',
        content: 'Test message'
      }),
    });
    console.log('POST Response status:', postResponse.status);
    console.log('POST Response body:', await postResponse.json());

  } catch (error) {
    console.error('Error testing messages API:', error.message);
  }
}

testMessagesAPI();