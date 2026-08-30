import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, transactionsAPI, setStoredToken, getStoredToken } from './api/client';

export const useStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: !!getStoredToken(),
      user: null,
      role: 'admin',
      darkMode: false,
      transactions: [],
      loadingTransactions: false,
      authLoading: false,

      // Initialize / verify auth state from server
      checkAuth: async () => {
        const token = getStoredToken();
        if (!token) {
          set({ isLoggedIn: false, user: null });
          return false;
        }
        try {
          const res = await authAPI.getMe();
          set({ isLoggedIn: true, user: res.user, role: res.user.role || 'admin' });
          get().fetchTransactions();
          return true;
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          get().logout();
          return false;
        }
      },

      // Authenticate via DB login
      login: async (email, password) => {
        set({ authLoading: true });
        try {
          const data = await authAPI.login({ email, password });
          setStoredToken(data.token);
          set({
            isLoggedIn: true,
            user: data.user,
            role: data.user.role || 'admin',
            authLoading: false
          });
          await get().fetchTransactions();
          return { success: true, user: data.user };
        } catch (error) {
          set({ authLoading: false });
          throw error;
        }
      },

      // Register new user in DB
      register: async (name, email, password, role = 'admin') => {
        set({ authLoading: true });
        try {
          const data = await authAPI.register({ name, email, password, role });
          setStoredToken(data.token);
          set({
            isLoggedIn: true,
            user: data.user,
            role: data.user.role || 'admin',
            authLoading: false
          });
          await get().fetchTransactions();
          return { success: true, user: data.user };
        } catch (error) {
          set({ authLoading: false });
          throw error;
        }
      },

      // Sign out
      logout: () => {
        setStoredToken(null);
        set({
          isLoggedIn: false,
          user: null,
          transactions: [],
          role: 'admin'
        });
      },

      // Fetch user's transactions from DB
      fetchTransactions: async () => {
        if (!getStoredToken()) return;
        set({ loadingTransactions: true });
        try {
          const data = await transactionsAPI.getAll();
          set({ transactions: data.transactions || [], loadingTransactions: false });
        } catch (error) {
          console.error('Failed to load transactions:', error);
          set({ loadingTransactions: false });
        }
      },

      // Add transaction to DB
      addTransaction: async (txData) => {
        try {
          const res = await transactionsAPI.create(txData);
          if (res.transaction) {
            set((state) => ({
              transactions: [res.transaction, ...state.transactions]
            }));
          }
          return res.transaction;
        } catch (error) {
          console.error('Failed to add transaction:', error);
          throw error;
        }
      },

      // Delete transaction from DB
      deleteTransaction: async (id) => {
        try {
          await transactionsAPI.delete(id);
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete transaction:', error);
          throw error;
        }
      },

      // Reset transactions for current user
      resetTransactions: async () => {
        try {
          const res = await transactionsAPI.reset();
          if (res.transactions) {
            set({ transactions: res.transactions });
          }
        } catch (error) {
          console.error('Failed to reset transactions:', error);
          throw error;
        }
      },

      // Role switcher (syncs with DB)
      setRole: async (newRole) => {
        set({ role: newRole });
        try {
          if (get().isLoggedIn) {
            const res = await authAPI.updateRole(newRole);
            if (res.user) {
              set((state) => ({ user: { ...state.user, role: newRole } }));
            }
          }
        } catch (err) {
          console.warn('Could not sync role to server:', err);
        }
      },

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'lumina-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        role: state.role,
      })
    }
  )
);
