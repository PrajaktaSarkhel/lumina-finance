import { create } from 'zustand';

export const useStore = create((set) => ({
  role: 'admin', // 'admin' or 'viewer'
  setRole: (role) => set({ role }),
  transactions: [
    { id: 1, date: '2023-10-01', amount: 1200, category: 'Housing', type: 'expense' },
    { id: 2, date: '2023-10-02', amount: 5000, category: 'Salary', type: 'income' },
    { id: 3, date: '2023-10-05', amount: 150, category: 'Food', type: 'expense' },
    { id: 4, date: '2023-10-07', amount: 80, category: 'Entertainment', type: 'expense' },
  ],
  addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
}));