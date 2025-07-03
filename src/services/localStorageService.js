// Local Storage Service - Only for User Authentication
class LocalStorageService {
  constructor() {
    this.STORAGE_KEYS = {
      USER_DATA: 'user',
      USER_TOKEN: 'authToken'
    };
  }

  // Save user data to localStorage (login details only)
  saveUserData(userData) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('💾 User data saved to localStorage');
      return true;
    } catch (error) {
      console.error('❌ Error saving user data to localStorage:', error);
      return false;
    }
  }

  // Load user data from localStorage
  loadUserData() {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading user data from localStorage:', error);
      return null;
    }
  }

  // Save auth token
  saveAuthToken(token) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER_TOKEN, token);
      return true;
    } catch (error) {
      console.error('❌ Error saving auth token:', error);
      return false;
    }
  }

  // Get auth token
  getAuthToken() {
    try {
      return localStorage.getItem(this.STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  }

  // Clear user data on logout
  clearUserData() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(this.STORAGE_KEYS.USER_TOKEN);
      console.log('🗑️ User data cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  }

  // Check if user is logged in
  isUserLoggedIn() {
    const userData = this.loadUserData();
    return userData && userData.isAuthenticated;
  }
}

export default new LocalStorageService();