// React State Service - No localStorage, pure React state management
class ReactStateService {
  constructor() {
    this.currentUser = null;
    this.userListeners = [];
  }

  // User state management
  setUser(userData) {
    this.currentUser = userData;
    this.userListeners.forEach(listener => listener(userData));
  }

  getUser() {
    return this.currentUser;
  }

  onUserChange(callback) {
    this.userListeners.push(callback);
    return () => {
      this.userListeners = this.userListeners.filter(listener => listener !== callback);
    };
  }

  clearUser() {
    this.currentUser = null;
    this.userListeners.forEach(listener => listener(null));
  }

  // Helper method to get user name for submissions
  getUserName() {
    return this.currentUser ? this.currentUser.fullName || this.currentUser.username : 'Unknown User';
  }

  // Helper method to get user type
  getUserType() {
    return this.currentUser ? this.currentUser.userType : 'Unknown';
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return this.currentUser && this.currentUser.isAuthenticated;
  }
}

export default new ReactStateService();