import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.101:8080/api';

// Test API đăng nhập
export const testLogin = async () => {
  try {
    console.log('Testing login API...');
    
    const response = await axios.post(`${API_BASE_URL}/mobile/auth/login`, {
      cccd: '012345678901',
      password: '123456'
    });
    
    console.log('Login response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Test API household
export const testHousehold = async () => {
  try {
    console.log('Testing household API...');
    
    const response = await axios.get(`${API_BASE_URL}/mobile/household?cmndCccd=012345678901`);
    
    console.log('Household response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Household error:', error.response?.data || error.message);
    throw error;
  }
};

// Chạy test
export const runTests = async () => {
  try {
    console.log('=== MOBILE API TESTS ===');
    
    await testLogin();
    await testHousehold();
    
    console.log('=== ALL TESTS PASSED ===');
  } catch (error) {
    console.error('=== TESTS FAILED ===', error);
  }
};

