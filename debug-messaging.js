// Debug script to check what's happening with messaging
const fetch = require('node-fetch');

async function debugMessaging() {
  console.log('=== DEBUGGING MESSAGING ISSUES ===\n');

  // Test 1: Check if we can get a valid teacher ID
  console.log('1. Testing teacher profile endpoint...');
  try {
    const teacherResponse = await fetch('http://localhost:3000/api/teacher/cmeris1eq0000nd3bbp8coulw/profile');
    console.log('Teacher profile status:', teacherResponse.status);
    if (teacherResponse.ok) {
      const teacherData = await teacherResponse.json();
      console.log('Teacher ID:', teacherData.id);
      console.log('Teacher name:', teacherData.name);
    } else {
      console.log('Teacher profile failed:', await teacherResponse.text());
    }
  } catch (error) {
    console.log('Teacher profile error:', error.message);
  }

  // Test 2: Try to simulate the exact POST request that's failing
  console.log('\n2. Testing POST message with exact payload...');
  try {
    const postResponse = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=your-session-token-here' // This would need a real session
      },
      body: JSON.stringify({
        receiverId: 'cmeris1eq0000nd3bbp8coulw', // Using the same ID from the GET request
        content: 'Test message from debug script'
      }),
    });
    
    console.log('POST message status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('POST message response:', postData);
  } catch (error) {
    console.log('POST message error:', error.message);
  }

  // Test 3: Check the GET messages request that's working
  console.log('\n3. Testing GET messages with undefined otherUserId...');
  try {
    const getResponse = await fetch('http://localhost:3000/api/messages?userId=cmeris1eq0000nd3bbp8coulw&otherUserId=undefined');
    console.log('GET messages status:', getResponse.status);
    const getData = await getResponse.json();
    console.log('GET messages response length:', Array.isArray(getData) ? getData.length : 'not an array');
  } catch (error) {
    console.log('GET messages error:', error.message);
  }

  console.log('\n=== END DEBUG ===');
}

debugMessaging();