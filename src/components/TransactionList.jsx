import { useStore } from '../store';

export const TransactionList = () => {
  const { transactions, role } = useStore();
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Recent Transactions</h2>
        {role === 'admin' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            + Add Transaction
          </button>
        )}
      </div>
      {/* Table logic here */}
      <p className="text-sm text-gray-400">Role: <span className="capitalize font-bold">{role}</span></p>
    </div>
  );
};