
import authService from './authService.js';

class ExpenseDataService {
  constructor() {
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  checkOnlineStatus() {
    if (!this.isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
  }

  async initializeExpenseData() {
    try {
      this.checkOnlineStatus();
      console.log('🚀 Loading expense data from Google Sheets...');

      const [fuelPayments, feesPayments, servicePayments, unionPayments, otherPayments] = await Promise.all([
        authService.getFuelPayments(),
        authService.getFeesPayments(),
        authService.getServicePayments(),
        authService.getUnionPayments(),
        authService.getOtherPayments()
      ]);

      let allExpenses = [];

      if (fuelPayments.success && fuelPayments.data) {
        allExpenses = [...allExpenses, ...fuelPayments.data.map(entry => ({
          ...entry,
          type: 'fuel'
        }))];
      }

      if (feesPayments.success && feesPayments.data) {
        allExpenses = [...allExpenses, ...feesPayments.data.map(entry => ({
          ...entry,
          type: 'fees'
        }))];
      }

      if (servicePayments.success && servicePayments.data) {
        allExpenses = [...allExpenses, ...servicePayments.data.map(entry => ({
          ...entry,
          type: 'service'
        }))];
      }

      if (unionPayments.success && unionPayments.data) {
        allExpenses = [...allExpenses, ...unionPayments.data.map(entry => ({
          ...entry,
          type: 'union'
        }))];
      }

      if (otherPayments.success && otherPayments.data) {
        allExpenses = [...allExpenses, ...otherPayments.data.map(entry => ({
          ...entry,
          type: 'other'
        }))];
      }

      allExpenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('✅ Expense data loaded from Google Sheets:', allExpenses.length, 'entries');
      return allExpenses;

    } catch (error) {
      console.error('❌ Error loading expense data from Google Sheets:', error);
      throw error;
    }
  }

  async addExpenseEntry(entryData) {
    try {
      this.checkOnlineStatus();

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';

      let result;
      const newEntry = {
        ...entryData,
        entryId: Date.now(),
        timestamp: new Date().toISOString(),
        submittedBy: submittedBy
      };

      switch (entryData.type) {
        case 'fuel':
          result = await authService.addFuelPayment({
            entryId: newEntry.entryId,
            date: entryData.date,
            pumpName: entryData.pumpName,
            liters: entryData.liters,
            ratePerLiter: entryData.ratePerLiter,
            cashAmount: entryData.cashAmount || 0,
            bankAmount: entryData.bankAmount || 0,
            totalAmount: entryData.totalAmount,
            submittedBy: submittedBy
          });
          break;
        case 'fees':
          result = await authService.addFeesPayment({
            entryId: newEntry.entryId,
            date: entryData.date,
            description: entryData.description,
            cashAmount: entryData.cashAmount || 0,
            bankAmount: entryData.bankAmount || 0,
            totalAmount: entryData.totalAmount,
            submittedBy: submittedBy
          });
          break;
        case 'service':
          result = await authService.addServicePayment({
            entryId: newEntry.entryId,
            date: entryData.date,
            serviceType: entryData.serviceType,
            vendor: entryData.vendor,
            description: entryData.description,
            cashAmount: entryData.cashAmount || 0,
            bankAmount: entryData.bankAmount || 0,
            totalAmount: entryData.totalAmount,
            submittedBy: submittedBy
          });
          break;
        case 'union':
          result = await authService.addUnionPayment({
            entryId: newEntry.entryId,
            date: entryData.date,
            description: entryData.description,
            cashAmount: entryData.cashAmount || 0,
            bankAmount: entryData.bankAmount || 0,
            totalAmount: entryData.totalAmount,
            submittedBy: submittedBy
          });
          break;
        case 'other':
          result = await authService.addOtherPayment({
            entryId: newEntry.entryId,
            date: entryData.date,
            paymentDetails: entryData.paymentDetails,
            vendor: entryData.vendor,
            cashAmount: entryData.cashAmount || 0,
            bankAmount: entryData.bankAmount || 0,
            totalAmount: entryData.totalAmount,
            submittedBy: submittedBy
          });
          break;
      }

      if (result && result.success) {
        console.log('✅ Expense entry added to Google Sheets successfully');
        return { success: true, entry: newEntry };
      } else {
        throw new Error(result?.error || 'Failed to add expense entry to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error adding expense entry:', error);
      return { success: false, error: error.message };
    }
  }

  async updateExpenseEntry(entryId, updatedData, entryType) {
    try {
      this.checkOnlineStatus();

      const result = await authService.updateExpenseEntry(entryId, updatedData, entryType);

      if (result && result.success) {
        console.log('✅ Expense entry updated in Google Sheets successfully');
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to update expense entry in Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error updating expense entry:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteExpenseEntry(entryId, entryType) {
    try {
      this.checkOnlineStatus();

      const result = await authService.deleteExpenseEntry(entryId, entryType);

      if (result && result.success) {
        console.log('✅ Expense entry deleted from Google Sheets successfully');
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to delete expense entry from Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error deleting expense entry:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ExpenseDataService();
