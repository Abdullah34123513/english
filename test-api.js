const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing teachers API...');
    const response = await fetch('http://localhost:3000/api/student/teachers');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('Teachers data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();