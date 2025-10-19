// Test API endpoint with actual HTTP request
const testUrl = 'http://localhost:3000/find-vehicle/search?customerId=4&profileType=staff&profileId=4';

console.log('Testing URL:', testUrl);
console.log('\nMaking request...\n');

fetch(testUrl)
  .then(response => response.json())
  .then(data => {
    console.log('Response received:');
    console.log(JSON.stringify(data, null, 2));
    console.log(`\nTotal results: ${Array.isArray(data) ? data.length : 'N/A'}`);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
