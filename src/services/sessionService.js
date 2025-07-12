
// Session Management Service
class SessionService {
  static isSessionValid() {
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    const apiKey = localStorage.getItem('userApiKey');
    
    if (!sessionExpiry || !apiKey) {
      return false;
    }
    
    const currentTime = new Date().getTime();
    const expiryTime = parseInt(sessionExpiry);
    
    return currentTime < expiryTime;
  }
  
  static clearSession() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userApiKey');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('userLoginTime');
  }
  
  static refreshSession() {
    if (!this.isSessionValid()) {
      this.clearSession();
      window.location.href = '/login';
      return false;
    }
    return true;
  }
}

export default SessionService;
