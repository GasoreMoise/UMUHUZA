const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken;

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

const updateData = {
  name: 'Updated Name',
  email: 'updated@example.com',
  phoneNumber: '+1234567890',
  address: '123 Test Street'
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null) => {
  return axios({
    method,
    url: `${API_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    data
  });
};

// Test cases
async function runTests() {
  try {
    console.log('🚀 Starting update profile tests...\n');

    // 1. Login to get token
    console.log('1. Logging in to get auth token...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Test successful profile update
    console.log('2. Testing successful profile update...');
    const updateResponse = await makeAuthenticatedRequest('PUT', '/citizens/profile', updateData);
    console.log('Response:', updateResponse.data);
    console.log('✅ Profile update successful\n');

    // 3. Test validation - invalid email
    console.log('3. Testing validation - invalid email...');
    try {
      await makeAuthenticatedRequest('PUT', '/citizens/profile', {
        email: 'invalid-email'
      });
    } catch (error) {
      console.log('Expected error:', error.response.data);
      console.log('✅ Invalid email validation working\n');
    }

    // 4. Test validation - short password
    console.log('4. Testing validation - short password...');
    try {
      await makeAuthenticatedRequest('PUT', '/citizens/profile', {
        password: '123'
      });
    } catch (error) {
      console.log('Expected error:', error.response.data);
      console.log('✅ Short password validation working\n');
    }

    // 5. Test validation - invalid phone number
    console.log('5. Testing validation - invalid phone number...');
    try {
      await makeAuthenticatedRequest('PUT', '/citizens/profile', {
        phoneNumber: '123'
      });
    } catch (error) {
      console.log('Expected error:', error.response.data);
      console.log('✅ Invalid phone number validation working\n');
    }

    // 6. Test partial update
    console.log('6. Testing partial update...');
    const partialUpdateResponse = await makeAuthenticatedRequest('PUT', '/citizens/profile', {
      name: 'Partially Updated'
    });
    console.log('Response:', partialUpdateResponse.data);
    console.log('✅ Partial update successful\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

// Run the tests
runTests(); 