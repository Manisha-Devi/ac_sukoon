
import authService from './authService.js';
import localStorageService from './localStorageService.js';

// Hybrid Data Service - Combines Local Storage + Google Sheets
class DataService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting sync...');
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Gone offline - using local storage only');
    });
  }

  // Initialize data - Load from localStorage first, then sync with Google Sheets
  async initializeData() {
    try {
      console.log('🚀 Initializing hybrid data service...');
      
      // Load from localStorage first (immediate response)
      const localData = localStorageService.loadFareData();
      
      // If online, sync with Google Sheets in background
      if (this.isOnline) {
        setTimeout(() => this.syncWithGoogleSheets(), 1000); // Background sync
      }
      
      return localData;
    } catch (error) {
      console.error('❌ Error initializing data:', error);
      return [];
    }
  }

  // Add new fare entry (save locally first, then sync)
  async addFareEntry(entryData, currentFareData) {
    try {
      // Add to local data immediately
      const newEntry = {
        ...entryData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        synced: false
      };

      const updatedData = [...currentFareData, newEntry];
      
      // Save to localStorage immediately
      localStorageService.saveFareData(updatedData);
      
      // Mark for sync
      localStorageService.markPendingSync(newEntry.id);
      
      // Try to sync to Google Sheets if online
      if (this.isOnline) {
        this.syncSingleEntry(newEntry);
      }
      
      return { success: true, data: updatedData, entry: newEntry };
    } catch (error) {
      console.error('❌ Error adding fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Update existing entry
  async updateFareEntry(entryId, updatedData, currentFareData) {
    try {
      const updatedFareData = currentFareData.map(entry => 
        entry.id === entryId 
          ? { ...entry, ...updatedData, synced: false, lastModified: new Date().toISOString() }
          : entry
      );
      
      // Save to localStorage
      localStorageService.saveFareData(updatedFareData);
      
      // Mark for sync
      localStorageService.markPendingSync(entryId);
      
      // Try to sync if online
      if (this.isOnline) {
        const updatedEntry = updatedFareData.find(entry => entry.id === entryId);
        this.syncSingleEntry(updatedEntry);
      }
      
      return { success: true, data: updatedFareData };
    } catch (error) {
      console.error('❌ Error updating fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete entry
  async deleteFareEntry(entryId, currentFareData) {
    try {
      const updatedData = currentFareData.filter(entry => entry.id !== entryId);
      
      // Save to localStorage
      localStorageService.saveFareData(updatedData);
      
      // Remove from pending sync if exists
      localStorageService.removePendingSync(entryId);
      
      return { success: true, data: updatedData };
    } catch (error) {
      console.error('❌ Error deleting fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync single entry to Google Sheets
  async syncSingleEntry(entry) {
    try {
      if (!this.isOnline) return;
      
      let result;
      
      if (entry.type === 'daily') {
        result = await authService.addFareReceipt({
          date: entry.date,
          route: entry.route,
          cashAmount: entry.cashAmount,
          bankAmount: entry.bankAmount,
          totalAmount: entry.totalAmount
        });
      } else if (entry.type === 'booking') {
        result = await authService.addBookingEntry({
          bookingDetails: entry.bookingDetails,
          dateFrom: entry.dateFrom,
          dateTo: entry.dateTo,
          cashAmount: entry.cashAmount,
          bankAmount: entry.bankAmount,
          totalAmount: entry.totalAmount
        });
      } else if (entry.type === 'off') {
        result = await authService.addOffDay({
          date: entry.date,
          reason: entry.reason
        });
      }
      
      if (result && result.success) {
        // Mark as synced
        localStorageService.removePendingSync(entry.id);
        console.log('✅ Entry synced to Google Sheets:', entry.id);
      }
      
    } catch (error) {
      console.error('❌ Error syncing single entry:', error);
    }
  }

  // Sync all pending data to Google Sheets
  async syncPendingData() {
    try {
      if (!this.isOnline || this.syncInProgress) return;
      
      this.syncInProgress = true;
      console.log('🔄 Syncing pending data...');
      
      const pendingIds = localStorageService.getPendingSync();
      const localData = localStorageService.loadFareData();
      
      for (const entryId of pendingIds) {
        const entry = localData.find(e => e.id === entryId);
        if (entry) {
          await this.syncSingleEntry(entry);
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      localStorageService.updateLastSync();
      this.syncInProgress = false;
      console.log('✅ Pending data sync completed');
      
    } catch (error) {
      console.error('❌ Error syncing pending data:', error);
      this.syncInProgress = false;
    }
  }

  // Background sync with Google Sheets
  async syncWithGoogleSheets() {
    try {
      if (!this.isOnline || this.syncInProgress) return;
      
      console.log('🔄 Background sync with Google Sheets...');
      
      // Sync any pending local data first
      await this.syncPendingData();
      
      localStorageService.updateLastSync();
      
    } catch (error) {
      console.error('❌ Error in background sync:', error);
    }
  }

  // Get sync status
  getSyncStatus() {
    const pendingCount = localStorageService.getPendingSync().length;
    const lastSync = localStorageService.getLastSync();
    
    return {
      isOnline: this.isOnline,
      pendingSync: pendingCount,
      lastSync: lastSync,
      syncInProgress: this.syncInProgress
    };
  }

  // Manual sync trigger
  async forcSync() {
    if (this.isOnline) {
      await this.syncWithGoogleSheets();
    }
  }
}

export default new DataService();
