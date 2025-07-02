
// Authentication service for Google Sheets database
class AuthService {
  constructor() {
    // Google Apps Script Web App URL
    this.API_URL = 'https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec';
  }

  // Authenticate user against Google Sheets database
  async authenticateUser(username, password, userType) {
    try {
      console.log('🔐 Authenticating user:', { username, userType });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        signal: controller.signal,
        redirect: 'follow',
        mode: 'cors',
        body: JSON.stringify({
          action: 'login',
          username: username,
          password: password,
          userType: userType
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        console.log('Non-JSON response:', textResult);
        // Try to parse as JSON anyway in case the content-type is wrong
        try {
          result = JSON.parse(textResult);
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${textResult}`);
        }
      }

      console.log('🔍 Authentication response:', result);

      if (result.success) {
        // Update last login timestamp
        await this.updateLastLogin(username);
        
        return {
          success: true,
          user: {
            username: result.user.username,
            userType: result.user.userType,
            fullName: result.user.fullName,
            status: result.user.status,
            isAuthenticated: true
          }
        };
      } else {
        return {
          success: false,
          message: result.message || 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return {
        success: false,
        message: 'Authentication service unavailable'
      };
    }
  }

  // Update last login timestamp
  async updateLastLogin(username) {
    try {
      await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'updateLastLogin',
          username: username,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('⚠️ Failed to update last login:', error);
    }
  }

  // Get all users (for admin purposes)
  async getAllUsers() {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getAllUsers'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return { success: false, message: 'Failed to fetch users' };
    }
  }

  // Add Fare Receipt to Google Sheets
  async addFareReceipt(data) {
    try {
      console.log('📝 Adding fare receipt to Google Sheets:', data);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'addFareReceipt',
          date: data.date,
          route: data.route,
          cashAmount: data.cashAmount || 0,
          bankAmount: data.bankAmount || 0,
          totalAmount: data.totalAmount || 0,
          submittedBy: data.submittedBy || 'driver'
        })
      });

      const result = await response.json();
      console.log('✅ Fare receipt response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding fare receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Add Booking Entry to Google Sheets
  async addBookingEntry(data) {
    try {
      console.log('📝 Adding booking entry to Google Sheets:', data);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'addBookingEntry',
          bookingDetails: data.bookingDetails,
          dateFrom: data.dateFrom,
          dateTo: data.dateTo,
          cashAmount: data.cashAmount || 0,
          bankAmount: data.bankAmount || 0,
          totalAmount: data.totalAmount || 0,
          submittedBy: data.submittedBy || 'driver'
        })
      });

      const result = await response.json();
      console.log('✅ Booking entry response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding booking entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Add Off Day to Google Sheets
  async addOffDay(data) {
    try {
      console.log('📝 Adding off day to Google Sheets:', data);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'addOffDay',
          date: data.date,
          reason: data.reason,
          submittedBy: data.submittedBy || 'driver'
        })
      });

      const result = await response.json();
      console.log('✅ Off day response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding off day:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all Fare Receipts from Google Sheets
  async getFareReceipts() {
    try {
      console.log('📋 Fetching fare receipts from Google Sheets...');
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'getFareReceipts'
        })
      });

      const result = await response.json();
      console.log('✅ Fare receipts fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching fare receipts:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Booking Entries from Google Sheets
  async getBookingEntries() {
    try {
      console.log('📋 Fetching booking entries from Google Sheets...');
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'getBookingEntries'
        })
      });

      const result = await response.json();
      console.log('✅ Booking entries fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching booking entries:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Off Days from Google Sheets
  async getOffDays() {
    try {
      console.log('📋 Fetching off days from Google Sheets...');
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'getOffDays'
        })
      });

      const result = await response.json();
      console.log('✅ Off days fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching off days:', error);
      return { success: false, error: error.message };
    }
  }

  // Test connection to Google Sheets database
  async testConnection() {
    try {
      console.log('🔍 Testing Google Sheets database connection...');
      console.log('📍 API URL:', this.API_URL);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'test'
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Database connection successful:', result);
        return true;
      } else {
        console.log('❌ Database connection failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Database connection error:', error);
      return false;
    }
  }
}

export default new AuthService();
