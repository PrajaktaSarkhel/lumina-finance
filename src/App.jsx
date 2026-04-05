import React, { useState, useMemo } from 'react';
import { useStore } from './store';
import { 
  LayoutDashboard, Wallet, ArrowUpCircle, ArrowDownCircle, 
  Moon, Sun, Trash2, Download, User, Settings, PieChart as PieIcon, 
  Bell, CreditCard, LogOut, Search, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const { transactions, role, setRole, darkMode, toggleDarkMode, deleteTransaction } = useStore();
  const [activeTab, setActiveTab] = useState('Overview');

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

  const navItems = [
    { id: 'Overview', icon: <LayoutDashboard size={20}/> },
    { id: 'Transactions', icon: <CreditCard size={20}/> },
    { id: 'Analytics', icon: <PieIcon size={20}/> },
    { id: 'Settings', icon: <Settings size={20}/> },
  ];

  return (
    <div className={`${darkMode ? 'dark bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'} flex h-screen overflow-hidden transition-colors duration-300`}>
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
            <LayoutDashboard size={24} className="text-white"/>
          </div>
          <h1 className="text-xl font-bold tracking-tight">LUMINA</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon} {item.id}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">P</div>
            <div>
              <p className="text-xs font-bold uppercase">{role}</p>
              <p className="text-[10px] opacity-60 italic">Online</p>
            </div>
          </div>
          <button onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')} className="w-full text-[10px] py-1 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all">Switch Role</button>
        </div>
      </aside>

      {/* CENTER CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Good Morning, Prajakta!</h2>
            <p className="text-gray-500 text-sm">Here's what's happening with your finances today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500/20 w-64"/>
            </div>
            <button onClick={toggleDarkMode} className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
              {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
          </div>
        </header>

        {activeTab === 'Overview' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SummaryCard title="Total Balance" amount={1530} icon={<Wallet className="text-blue-500"/>} trend="+12.5%" />
              <SummaryCard title="Monthly Spending" amount={insights.totalExp} icon={<ArrowDownCircle className="text-red-500"/>} trend={insights.topCategory} />
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm mb-8">
              <h3 className="font-bold mb-6">Revenue Growth</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={transactions}>
                    <defs>
                      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f033"/>
                    <XAxis dataKey="date" hide/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}/>
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <PieIcon size={48} className="mb-4 opacity-20"/>
            <p>{activeTab} view is coming soon!</p>
          </div>
        )}
      </main>

      {/* RIGHT SIDEBAR (Insights Panel) */}
      <aside className="w-80 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hidden xl:block">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold">Recent Activity</h3>
          <Bell size={18} className="text-gray-400 cursor-pointer hover:text-blue-500"/>
        </div>

        <div className="space-y-6">
          {transactions.slice(0, 4).map(t => (
            <div key={t.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {t.type === 'income' ? <ArrowUpCircle size={18}/> : <ArrowDownCircle size={18}/>}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.category}</p>
                  <p className="text-[10px] text-gray-500">{t.date}</p>
                </div>
              </div>
              <p className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
          <Plus className="absolute -right-4 -top-4 opacity-10 w-24 h-24" />
          <h4 className="text-sm font-medium mb-1 opacity-80">Quick Action</h4>
          <p className="text-lg font-bold mb-4 leading-snug">Need to add a new transaction?</p>
          <button disabled={role !== 'admin'} className="w-full py-3 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Add Transaction
          </button>
        </div>
      </aside>
    </div>
  );
}

function SummaryCard({ title, amount, icon, trend, trendLabel }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-blue-500/50 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl">{icon}</div>
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold">${amount.toLocaleString()}</h3>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/10 px-2 py-1 rounded-lg">{trend}</p>
      </div>
    </div>
  );
}

export default App;