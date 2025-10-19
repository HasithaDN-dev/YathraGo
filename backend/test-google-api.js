// Quick test script to check Google Maps API
require('dotenv').config();
const axios = require('axios');

async function testGoogleMapsAPI() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  console.log('🔍 Testing Google Maps API...\n');
  
  if (!apiKey) {
    console.error('❌ GOOGLE_MAPS_API_KEY not found in .env file!');
    console.log('Please add: GOOGLE_MAPS_API_KEY=your_key_here');
    return;
  }
  
  console.log(`✓ API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`✓ Key length: ${apiKey.length} characters\n`);
  
  // Test Distance Matrix API
  const testUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=6.9271,79.8612&destinations=6.9319,79.8478&key=${apiKey}`;
  
  console.log('Testing Distance Matrix API...');
  
  try {
    const response = await axios.get(testUrl, { timeout: 15000 });
    
    console.log('\n📊 Response Status:', response.data.status);
    console.log('📊 Error Message:', response.data.error_message || 'None');
    
    if (response.data.status === 'OK') {
      console.log('\n✅ SUCCESS! Distance Matrix API is working correctly.');
      console.log('Sample result:', JSON.stringify(response.data, null, 2));
    } else if (response.data.status === 'REQUEST_DENIED') {
      console.log('\n❌ API KEY ISSUE:');
      console.log('   - API key might be invalid');
      console.log('   - Distance Matrix API might not be enabled');
      console.log('   - Billing might not be enabled');
      console.log('   - API key might have restrictions');
    } else {
      console.log('\n⚠️  API returned status:', response.data.status);
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ ERROR calling API:');
    if (error.code === 'ECONNABORTED') {
      console.error('   - Request timed out (network issue?)');
    } else if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   - Message:', error.message);
    }
  }
}

testGoogleMapsAPI();


