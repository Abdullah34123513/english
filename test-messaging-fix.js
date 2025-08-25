// Test script to verify messaging fixes
const fetch = require('node-fetch');

async function testMessagingFixes() {
  console.log('=== TESTING MESSAGING FIXES ===\n');

  // Test 1: Check GET endpoint with invalid otherUserId
  console.log('1. Testing GET with invalid otherUserId...');
  try {
    const response = await fetch('http://localhost:3000/api/messages?userId=cmeris1eq0000nd3bbp8coulw&otherUserId=undefined');
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Test 2: Check GET endpoint with missing parameters
  console.log('\n2. Testing GET with missing parameters...');
  try {
    const response = await fetch('http://localhost:3000/api/messages?userId=cmeris1eq0000nd3bbp8coulw');
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Test 3: Check POST endpoint without authentication (should fail)
  console.log('\n3. Testing POST without authentication...');
  try {
    const response = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiverId: 'cmeris1eq0000nd3bbp8coulw',
        content: 'Test message'
      }),
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Test 4: Check POST endpoint with missing fields
  console.log('\n4. Testing POST with missing fields...');
  try {
    const response = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test-token' // Mock session
      },
      body: JSON.stringify({
        receiverId: 'cmeris1eq0000nd3bbp8coulw'
        // Missing content
      }),
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n=== END TESTS ===');
}

testMessagingFixes();