
// Local Storage Service for Hybrid Data Management
class LocalStorageService {
  constructor() {
    this.STORAGE_KEYS = {
      FARE_DATA: 'fare_receipts_data',
      SYNC_STATUS: 'data_sync_status',
      LAST_SYNC: 'last_sync_timestamp'
    };
  }

  // Save data to localStorage
  saveFareData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.FARE_DATA, JSON.stringify(data));
      console.log('💾 Data saved to localStorage:', data.length, 'entries');
      return true;
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      return false;
    }
  }

  // Load data from localStorage
  loadFareData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.FARE_DATA);
      if (data) {
        const parsedData = JSON.parse(data);
        console.log('📂 Data loaded from localStorage:', parsedData.length, 'entries');
        return parsedData;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      return [];
    }
  }

  // Mark data as pending sync
  markPendingSync(entryId) {
    try {
      const pendingSync = this.getPendingSync();
      if (!pendingSync.includes(entryId)) {
        pendingSync.push(entryId);
        localStorage.setItem(this.STORAGE_KEYS.SYNC_STATUS, JSON.stringify(pendingSync));
        console.log('⏳ Entry marked for sync:', entryId);
      }
    } catch (error) {
      console.error('❌ Error marking pending sync:', error);
    }
  }

  // Get pending sync items
  getPendingSync() {
    try {
      const pending = localStorage.getItem(this.STORAGE_KEYS.SYNC_STATUS);
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('❌ Error getting pending sync:', error);
      return [];
    }
  }

  // Remove from pending sync
  removePendingSync(entryId) {
    try {
      const pendingSync = this.getPendingSync();
      const updated = pendingSync.filter(id => id !== entryId);
      localStorage.setItem(this.STORAGE_KEYS.SYNC_STATUS, JSON.stringify(updated));
      console.log('✅ Entry synced successfully:', entryId);
    } catch (error) {
      console.error('❌ Error removing from pending sync:', error);
    }
  }

  // Update last sync timestamp
  updateLastSync() {
    try {
      const timestamp = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, timestamp);
      console.log('🕒 Last sync updated:', timestamp);
    } catch (error) {
      console.error('❌ Error updating last sync:', error);
    }
  }

  // Get last sync timestamp
  getLastSync() {
    try {
      return localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('❌ Error getting last sync:', error);
      return null;
    }
  }

  // Clear all data (for logout/reset)
  clearAllData() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.FARE_DATA);
      localStorage.removeItem(this.STORAGE_KEYS.SYNC_STATUS);
      localStorage.removeItem(this.STORAGE_KEYS.LAST_SYNC);
      console.log('🗑️ All local storage cleared');
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
    }
  }
}

export default new LocalStorageService();
