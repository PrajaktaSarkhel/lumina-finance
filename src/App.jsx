import React, { useState, useMemo } from 'react';
import { useStore } from './store';
import { 
  LayoutDashboard, Wallet, ArrowUpCircle, ArrowDownCircle, 
  Moon, Sun, Trash2, Download, UserCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

function App() {
  const { transactions, role, setRole, darkMode, toggleDarkMode, deleteTransaction } = useStore();
  const [filter, setFilter] = useState('all');

  // Logic for Insights (Your requested snippet)
  const insights = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return { topCategory: 'N/A', totalExp: 0 };
    
    const totals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const top = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
    return { topCategory: top, totalExp: totals[top] };
  }, [transactions]);

  const filteredData = transactions.filter(t => filter === 'all' || t.type === filter);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "finance_report.json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className={`${darkMode ? 'dark bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300`}>
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg"><LayoutDashboard size={20} className="text-white"/></div>
            <h1 className="text-xl font-bold tracking-tight">LUMINA<span className="text-blue-600">FINANCE</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 text-sm p-2 rounded-md outline-none"
            >
              <option value="admin">Admin Role</option>
              <option value="viewer">Viewer Role</option>
            </select>
            <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Total Balance" amount={transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)} icon={<Wallet className="text-blue-600"/>}/>
          <SummaryCard title="Top Spending" amount={insights.totalExp} subtext={insights.topCategory} icon={<ArrowDownCircle className="text-red-500"/>}/>
          <div className="p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <p className="opacity-80 text-sm">Active Role</p>
            <h3 className="text-2xl font-bold capitalize mt-1">{role}</h3>
            <p className="text-xs mt-4 opacity-70">{role === 'admin' ? 'Full Access: Add/Delete Enabled' : 'Read Only: View access restricted'}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold mb-4">Balance Flow</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transactions}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                  <XAxis dataKey="date" hide/>
                  <YAxis hide/>
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Recent Activity</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs rounded-full ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>All</button>
                  <button onClick={() => setFilter('expense')} className={`px-3 py-1 text-xs rounded-full ${filter === 'expense' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>Expenses</button>
                </div>
             </div>
             
             <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {filteredData.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">No transactions found.</p>
                ) : (
                  filteredData.map(t => (
                    <div key={t.id} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {t.type === 'income' ? <ArrowUpCircle size={18}/> : <ArrowDownCircle size={18}/>}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.category}</p>
                          <p className="text-xs text-gray-500">{t.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount}
                        </p>
                        {role === 'admin' && (
                          <button onClick={() => deleteTransaction(t.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={16}/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
             </div>
             <button onClick={exportJSON} className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-blue-600 font-medium py-2 border border-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                <Download size={16}/> Export Data (JSON)
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, amount, icon, subtext }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2">
      <div className="p-2 bg-gray-50 dark:bg-slate-700 w-fit rounded-lg">{icon}</div>
      <p className="text-gray-500 text-sm mt-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold">${amount.toLocaleString()}</h3>
        {subtext && <span className="text-xs font-medium text-gray-400">in {subtext}</span>}
      </div>
    </div>
  );
}

export default App;