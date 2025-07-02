
// Google Sheets API Integration Service
const API_URL = 'https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec';

// Generic API call function
const apiCall = async (data, method = 'POST') => {
  try {
    console.log('Making API call:', { data, method, url: API_URL });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    };

    if (method === 'POST') {
      options.body = JSON.stringify(data);
    }

    const url = method === 'GET' ? `${API_URL}?${new URLSearchParams(data)}` : API_URL;
    
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    return result;
  } catch (error) {
    console.error('API Call Error:', error);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout - please try again' };
    }
    
    if (error.message.includes('Failed to fetch')) {
      return { success: false, error: 'Cannot connect to server. Please check if the Google Apps Script is deployed properly.' };
    }
    
    return { success: false, error: error.message };
  }
};

// Authentication
export const login = async (username, password) => {
  return await apiCall({
    action: 'login',
    username: username,
    password: password
  });
};

// Fare Receipts
export const addFareReceipt = async (data) => {
  return await apiCall({
    action: 'addFareReceipt',
    ...data
  });
};

export const getFareReceipts = async () => {
  return await apiCall({ action: 'getFareReceipts' }, 'GET');
};

// Booking Entries
export const addBookingEntry = async (data) => {
  return await apiCall({
    action: 'addBookingEntry',
    ...data
  });
};

export const getBookingEntries = async () => {
  return await apiCall({ action: 'getBookingEntries' }, 'GET');
};

// Off Days
export const addOffDay = async (data) => {
  return await apiCall({
    action: 'addOffDay',
    ...data
  });
};

export const getOffDays = async () => {
  return await apiCall({ action: 'getOffDays' }, 'GET');
};

// Fuel Payments
export const addFuelPayment = async (data) => {
  return await apiCall({
    action: 'addFuelPayment',
    ...data
  });
};

export const getFuelPayments = async () => {
  return await apiCall({ action: 'getFuelPayments' }, 'GET');
};

// Adda Payments
export const addAddaPayment = async (data) => {
  return await apiCall({
    action: 'addAddaPayment',
    ...data
  });
};

export const getAddaPayments = async () => {
  return await apiCall({ action: 'getAddaPayments' }, 'GET');
};

// Union Payments
export const addUnionPayment = async (data) => {
  return await apiCall({
    action: 'addUnionPayment',
    ...data
  });
};

export const getUnionPayments = async () => {
  return await apiCall({ action: 'getUnionPayments' }, 'GET');
};

// Service Payments
export const addServicePayment = async (data) => {
  return await apiCall({
    action: 'addServicePayment',
    ...data
  });
};

export const getServicePayments = async () => {
  return await apiCall({ action: 'getServicePayments' }, 'GET');
};

// Other Payments
export const addOtherPayment = async (data) => {
  return await apiCall({
    action: 'addOtherPayment',
    ...data
  });
};

export const getOtherPayments = async () => {
  return await apiCall({ action: 'getOtherPayments' }, 'GET');
};

// Cash Book Entries
export const addCashBookEntry = async (data) => {
  return await apiCall({
    action: 'addCashBookEntry',
    ...data
  });
};

export const getCashBookEntries = async () => {
  return await apiCall({ action: 'getCashBookEntries' }, 'GET');
};

// Approval Data
export const addApprovalData = async (data) => {
  return await apiCall({
    action: 'addApprovalData',
    ...data
  });
};

export const getApprovalData = async () => {
  return await apiCall({ action: 'getApprovalData' }, 'GET');
};

// Test API connection with detailed diagnostics
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Google Apps Script connection...');
    console.log('📍 API URL:', API_URL);
    
    const result = await apiCall({ action: 'test' }, 'GET');
    
    if (result.success) {
      console.log('✅ API Connection successful!');
      console.log('📊 Test Results:', result);
      
      // Check if all required components are working
      if (result.tests) {
        Object.keys(result.tests).forEach(testName => {
          const test = result.tests[testName];
          console.log(`${test.success ? '✅' : '❌'} ${testName}:`, test);
        });
      }
    } else {
      console.log('❌ API Connection failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('🚨 Connection test error:', error);
    return { 
      success: false, 
      error: error.message,
      details: 'Failed to reach Google Apps Script endpoint'
    };
  }
};

// Generic Update/Delete functions
export const updateEntry = async (sheetName, rowId, updates) => {
  return await apiCall({
    action: 'updateEntry',
    sheetName: sheetName,
    rowId: rowId,
    updates: updates
  });
};

export const deleteEntry = async (sheetName, rowId) => {
  return await apiCall({
    action: 'deleteEntry',
    sheetName: sheetName,
    rowId: rowId
  });
};
