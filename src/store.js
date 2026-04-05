import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      role: 'admin', // admin or viewer
      darkMode: false,
      transactions: [
        { id: 1, date: '2024-03-01', amount: 2500, category: 'Salary', type: 'income', note: 'Monthly Pay' },
        { id: 2, date: '2024-03-02', amount: 800, category: 'Rent', type: 'expense', note: 'Apartment' },
        { id: 3, date: '2024-03-05', amount: 120, category: 'Food', type: 'expense', note: 'Groceries' },
        { id: 4, date: '2024-03-10', amount: 50, category: 'Entertainment', type: 'expense', note: 'Movie' },
      ],
      setRole: (role) => set({ role }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
    }),
    { name: 'lumina-storage' } // This enables Local Storage persistence
  )
);


