
// React State Service - No localStorage, pure React state management
class ReactStateService {
  constructor() {
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('📶 Application is online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📶 Application is offline');
    });
  }

  // Check if online
  checkOnlineStatus() {
    if (!this.isOnline) {
      throw new Error('No internet connection available');
    }
  }

  // Generate unique ID for entries
  generateEntryId() {
    return Date.now();
  }

  // Create new entry with proper structure
  createEntry(data, entryType) {
    const entryId = this.generateEntryId();
    const timestamp = new Date().toISOString();
    
    const baseEntry = {
      entryId,
      timestamp,
      type: entryType,
      submittedBy: data.submittedBy || 'Unknown User'
    };

    if (entryType === 'daily') {
      return {
        ...baseEntry,
        date: data.date,
        route: data.route,
        cashAmount: parseFloat(data.cashAmount) || 0,
        bankAmount: parseFloat(data.bankAmount) || 0,
        totalAmount: parseFloat(data.totalAmount) || 0
      };
    } else if (entryType === 'booking') {
      return {
        ...baseEntry,
        bookingDetails: data.bookingDetails,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        cashAmount: parseFloat(data.cashAmount) || 0,
        bankAmount: parseFloat(data.bankAmount) || 0,
        totalAmount: parseFloat(data.totalAmount) || 0
      };
    } else if (entryType === 'off') {
      return {
        ...baseEntry,
        date: data.date,
        reason: data.reason
      };
    }

    return baseEntry;
  }

  // Generate cash book entries from fare data
  generateCashBookEntries(fareData) {
    const cashBookEntries = [];
    
    fareData.forEach(entry => {
      if (entry.type === 'daily') {
        // Receipt entry
        cashBookEntries.push({
          id: `receipt-${entry.entryId}`,
          date: entry.date,
          description: `Daily Receipt - ${entry.route}`,
          jfNo: `JF-${entry.entryId}`,
          receiptAmount: entry.totalAmount,
          paymentAmount: 0,
          source: 'fare-entry',
          type: 'receipt'
        });
      } else if (entry.type === 'booking') {
        // Booking entry
        cashBookEntries.push({
          id: `booking-${entry.entryId}`,
          date: entry.dateFrom,
          description: `Booking - ${entry.bookingDetails}`,
          jfNo: `BK-${entry.entryId}`,
          receiptAmount: entry.totalAmount,
          paymentAmount: 0,
          source: 'fare-entry',
          type: 'booking'
        });
      }
    });

    return cashBookEntries;
  }

  // Calculate totals from fare data
  calculateTotals(fareData) {
    let totalEarnings = 0;
    
    fareData.forEach(entry => {
      if (entry.totalAmount) {
        totalEarnings += entry.totalAmount;
      }
    });

    return {
      totalEarnings,
      totalExpenses: 0, // Will be calculated from expense data
      profit: totalEarnings // Will be recalculated when expense data is available
    };
  }
}

export default new ReactStateService();
