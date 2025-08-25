// Test script to check if messages API is working
const fetch = require('node-fetch');

async function testMessaging() {
  try {
    console.log('Testing messaging system...\n');

    // Test 1: Check if the server is running
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    console.log('Health check status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);
    }

    // Test 2: Try to get messages (should fail without auth)
    console.log('\n2. Testing GET messages without auth...');
    try {
      const getResponse = await fetch('http://localhost:3000/api/messages?userId=user1&otherUserId=user2');
      console.log('GET messages status:', getResponse.status);
      const getData = await getResponse.json();
      console.log('GET messages response:', getData);
    } catch (error) {
      console.log('GET messages error:', error.message);
    }

    // Test 3: Try to send a message (should fail without auth)
    console.log('\n3. Testing POST message without auth...');
    try {
      const postResponse = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: 'user2',
          content: 'Test message'
        }),
      });
      console.log('POST message status:', postResponse.status);
      const postData = await postResponse.json();
      console.log('POST message response:', postData);
    } catch (error) {
      console.log('POST message error:', error.message);
    }

    console.log('\n4. Testing socket.io endpoint...');
    try {
      const socketResponse = await fetch('http://localhost:3000/api/socket/io');
      console.log('Socket endpoint status:', socketResponse.status);
      const socketData = await socketResponse.json();
      console.log('Socket endpoint response:', socketData);
    } catch (error) {
      console.log('Socket endpoint error:', error.message);
    }

  } catch (error) {
    console.error('Error in test:', error.message);
  }
}

testMessaging();