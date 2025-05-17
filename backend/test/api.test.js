const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken;
let testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
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
    console.log('🚀 Starting API tests...\n');

    // 1. Register new user
    console.log('1. Testing user registration...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('Response:', registerResponse.data);
      console.log('✅ Registration successful\n');
    } catch (error) {
      if (error.response?.data?.message === 'User already exists') {
        console.log('ℹ️ User already exists, continuing with tests\n');
      } else {
        throw error;
      }
    }

    // 2. Login
    console.log('2. Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('Response:', loginResponse.data);
    console.log('✅ Login successful\n');

    // 3. Get Profile
    console.log('3. Testing get profile...');
    const profileResponse = await makeAuthenticatedRequest('GET', '/auth/profile');
    console.log('Response:', profileResponse.data);
    console.log('✅ Get profile successful\n');

    // 4. Update Profile - Success case
    console.log('4. Testing profile update - success case...');
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com'
    };
    const updateResponse = await makeAuthenticatedRequest('PUT', '/citizens/profile', updateData);
    console.log('Response:', updateResponse.data);
    console.log('✅ Profile update successful\n');

    // 5. Update Profile - Validation error (invalid email)
    console.log('5. Testing profile update - validation error...');
    try {
      await makeAuthenticatedRequest('PUT', '/citizens/profile', {
        email: 'invalid-email'
      });
    } catch (error) {
      console.log('Expected error:', error.response.data);
      console.log('✅ Validation error handling working\n');
    }

    // 6. Update Profile - Validation error (short password)
    console.log('6. Testing profile update - password validation...');
    try {
      await makeAuthenticatedRequest('PUT', '/citizens/profile', {
        password: '123'
      });
    } catch (error) {
      console.log('Expected error:', error.response.data);
      console.log('✅ Password validation working\n');
    }

    // 7. Update Profile - Partial update
    console.log('7. Testing partial profile update...');
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