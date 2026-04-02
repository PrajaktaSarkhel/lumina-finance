import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

export const Summary = ({ transactions }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const cards = [
    { title: 'Total Balance', amount: income - expenses, icon: <Wallet />, color: 'text-blue-600' },
    { title: 'Total Income', amount: income, icon: <ArrowUpCircle />, color: 'text-green-600' },
    { title: 'Total Expenses', amount: expenses, icon: <ArrowDownCircle />, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.title} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className={`mb-4 ${card.color}`}>{card.icon}</div>
          <p className="text-gray-500 text-sm font-medium">{card.title}</p>
          <h3 className="text-2xl font-bold">${card.amount.toLocaleString()}</h3>
        </div>
      ))}
    </div>
  );
};