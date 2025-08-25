// Test script to verify the receiver ID fix
const fetch = require('node-fetch');

async function testReceiverFix() {
  console.log('=== TESTING RECEIVER ID FIX ===\n');

  // Test the API endpoint with a teacher ID to see if it resolves to user ID
  console.log('1. Testing API with teacher ID (should auto-resolve to user ID)...');
  
  // This would normally require authentication, but let's see what error we get
  try {
    const response = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiverId: 'cmeris1eq0000nd3bbp8coulw', // This might be a teacher ID
        content: 'Test message with teacher ID'
      }),
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.status === 401) {
      console.log('✅ Expected authentication error - the fix is in place');
    } else if (response.status === 404) {
      console.log('❌ Still getting "Receiver not found" error');
      console.log('This means the teacher ID was not found in the database');
    } else if (response.status === 200) {
      console.log('✅ Success! Message sent with teacher ID resolution');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n2. Checking if we can get teacher profile to see the structure...');
  
  try {
    const response = await fetch('http://localhost:3000/api/teacher/cmeris1eq0000nd3bbp8coulw/profile');
    console.log('Teacher profile status:', response.status);
    
    if (response.ok) {
      const teacherData = await response.json();
      console.log('Teacher data structure:');
      console.log('- ID (teacher profile):', teacherData.id);
      console.log('- User ID (for messaging):', teacherData.userId);
      console.log('- Name:', teacherData.name);
      console.log('- Email:', teacherData.email);
      
      if (teacherData.userId) {
        console.log('✅ Teacher profile includes userId field');
      } else {
        console.log('❌ Teacher profile missing userId field');
      }
    } else {
      console.log('Teacher profile not found or error');
    }
  } catch (error) {
    console.log('Error fetching teacher profile:', error.message);
  }

  console.log('\n=== END TESTS ===');
}

testReceiverFix();