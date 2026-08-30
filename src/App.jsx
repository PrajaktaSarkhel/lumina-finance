import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from './store';
import { 
  LayoutDashboard, Wallet, ArrowUpCircle, ArrowDownCircle, 
  Moon, Sun, Trash2, Settings, PieChart as PieIcon, 
  Bell, CreditCard, Search, Plus, Shield, LogOut, Loader2, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Assets ---
import LogoImage from './assets/logo.png'; 

function App() {
  const { 
    user,
    transactions, 
    loadingTransactions, 
    fetchTransactions,
    addTransaction, 
    deleteTransaction,
    resetTransactions,
    role, 
    setRole, 
    darkMode, 
    toggleDarkMode, 
    logout 
  } = useStore();

  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // State for the Add Transaction Form
  const [formData, setFormData] = useState({ amount: '', category: '', type: 'expense', note: '' });

  // Sync transactions on load
  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- Theme Toggle Fix ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Dashboard Logic
  const insights = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExp = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    
    const top = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b, 'None');
    return { topCategory: top, totalExp, income, balance: income - totalExp };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t =>
      t.category.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.amount.toString().includes(q) ||
      (t.note && t.note.toLowerCase().includes(q))
    );
  }, [transactions, searchQuery]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.amount || !formData.category) {
      setFormError('Please fill in amount and category.');
      return;
    }

    try {
      setFormSubmitting(true);
      await addTransaction({
        amount: parseFloat(formData.amount),
        category: formData.category.trim(),
        type: formData.type,
        note: formData.note ? formData.note.trim() : '',
        date: new Date().toISOString().split('T')[0]
      });
      setFormData({ amount: '', category: '', type: 'expense', note: '' });
    } catch (err) {
      setFormError(err.message || 'Failed to add transaction.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Avatar Initials
  const avatarInitials = useMemo(() => {
    if (user?.name) {
      const parts = user.name.trim().split(' ');
      return parts.length > 1 
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    return 'U';
  }, [user]);

  // --- SUB-PAGE COMPONENTS ---

  const TransactionsPage = ({ data }) => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold dark:text-white">Transaction History</h3>
        <button
          onClick={fetchTransactions}
          disabled={loadingTransactions}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 font-bold transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loadingTransactions ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {data.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-slate-500">
            <CreditCard size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-bold">No transactions found</p>
            <p className="text-xs mt-1">Add your first transaction in the sidebar to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Note</th>
                <th className="px-6 py-4">Amount</th>
                {role === 'admin' && <th className="px-6 py-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {data.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium dark:text-white flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {t.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{t.date}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{t.note || '—'}</td>
                  <td className={`px-6 py-4 font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                  </td>
                  {role === 'admin' && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => deleteTransaction(t.id)} 
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const AnalyticsPage = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsStatCard title="Savings Rate" value={insights.income > 0 ? `${Math.max(0, Math.round((insights.balance / insights.income) * 100))}%` : '0%'} color="bg-blue-600" />
        <AnalyticsStatCard title="Expense Ratio" value={insights.income > 0 ? `${Math.round((insights.totalExp / insights.income) * 100)}%` : '0%'} color="bg-purple-600" />
        <AnalyticsStatCard title="Financial Score" value="88/100" color="bg-emerald-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-4 dark:text-white">Spending Behavior</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Based on your current activity in the database, your top spending category is <strong className="text-blue-500">{insights.topCategory}</strong>. 
            You are currently saving <strong className="text-emerald-500">${insights.balance.toLocaleString()}</strong> this period.
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white">
          <Shield className="text-blue-400 mb-4" size={32} />
          <h3 className="font-bold mb-2">Portfolio Security</h3>
          <p className="text-slate-400 text-sm">Automated SQLite DB persistence is active. Your credentials and transactions are isolated to your user ID.</p>
        </div>
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div className="max-w-2xl space-y-6 animate-in slide-in-from-left-4 duration-500">
      <h3 className="text-xl font-bold dark:text-white">System Settings</h3>
      <div className="p-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
        <div className="pb-4 border-b border-gray-50 dark:border-slate-800">
          <p className="font-bold text-sm dark:text-white mb-1">Account Information</p>
          <p className="text-xs text-gray-400">Signed in as <span className="text-blue-500 font-bold">{user?.name || 'User'}</span> ({user?.email || 'N/A'})</p>
        </div>

        <ToggleSetting title="Push Notifications" description="large balance changes" active={true} />
        <ToggleSetting title="Email Reports" description="Weekly financial summary" active={false} />
        
        <div className="pt-4 border-t border-gray-50 dark:border-slate-800 flex flex-col gap-3">
          <p className="text-xs text-red-400 font-medium uppercase tracking-wider">Account & Database</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-red-500 text-sm font-bold bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <LogOut size={16}/> Sign Out
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Reset your database transactions back to default demo data?")) {
                  try {
                    await resetTransactions();
                    alert("Transactions reset to default successfully.");
                  } catch (err) {
                    alert("Failed to reset: " + err.message);
                  }
                }
              }}
              className="flex items-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={16}/> Reset Account Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white flex h-screen overflow-hidden transition-colors duration-300">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-6 z-10 transition-colors">
        <div className="flex items-center gap-3.5 mb-10 px-1">
          <img src={LogoImage} alt="Lumina Favicon" className="w-8 h-8 rounded-full shadow-md" />
          <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white">LUMINA</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {['Overview', 'Transactions', 'Analytics', 'Settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400 shadow-sm' 
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-950 dark:hover:text-white'
              }`}
            >
              {tab === 'Overview' && <LayoutDashboard size={20}/>}
              {tab === 'Transactions' && <CreditCard size={20}/>}
              {tab === 'Analytics' && <PieIcon size={20}/>}
              {tab === 'Settings' && <Settings size={20}/>}
              {tab}
            </button>
          ))}
        </nav>

        {/* User Profile Card */}
        <div className="mt-auto p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
                {avatarInitials}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">{role}</p>
                <p className="text-xs font-bold dark:text-white truncate" title={user?.name || 'User'}>
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-gray-400 truncate" title={user?.email}>
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 shrink-0 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
          <button 
            onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')} 
            className="w-full text-[10px] py-1.5 font-bold border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-700 dark:text-gray-300 transition-all uppercase cursor-pointer"
          >
            Switch to {role === 'admin' ? 'Viewer' : 'Admin'}
          </button>
        </div>
      </aside>

      {/* CENTER CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black italic text-gray-950 dark:text-white">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h2>
            <p className="text-gray-400 text-sm">Dashboard / {activeTab}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 dark:text-white w-56 transition-all"
              />
            </div>
            {/* Theme Toggle */}
            <button onClick={toggleDarkMode} className="p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-blue-500 transition-all cursor-pointer">
              {darkMode ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-blue-600"/>}
            </button>
          </div>
        </header>

        {/* Dynamic Content Switching */}
        {activeTab === 'Overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard title="Balance" amount={insights.balance} icon={<Wallet className="text-blue-500"/>} trend={insights.balance >= 0 ? 'Healthy' : 'Deficit'} />
              <SummaryCard title="Spending" amount={insights.totalExp} icon={<ArrowDownCircle className="text-red-500"/>} trend={insights.topCategory} />
              <SummaryCard title="Income" amount={insights.income} icon={<ArrowUpCircle className="text-emerald-500"/>} trend="On Track" />
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold dark:text-white">Cash Flow Analytics</h3>
                {loadingTransactions && <Loader2 size={16} className="animate-spin text-blue-500" />}
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={transactions.slice().reverse()}>
                    <defs>
                      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f033"/>
                    <XAxis dataKey="date" hide/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff'}}/>
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Transactions' && <TransactionsPage data={filteredTransactions} />}
        {activeTab === 'Analytics' && <AnalyticsPage />}
        {activeTab === 'Settings' && <SettingsPage />}
      </main>

      {/* RIGHT SIDEBAR - WORKABLE ADD TRANSACTION */}
      <aside className="w-80 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hidden xl:flex flex-col transition-colors">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-sm tracking-widest uppercase opacity-40">Activity Feed</h3>
          <Bell size={18} className="text-gray-300 hover:text-blue-500 transition-colors cursor-pointer"/>
        </div>

        {/* FEED */}
        <div className="space-y-6 flex-1 overflow-y-auto mb-6 custom-scrollbar pr-2">
          {transactions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No recent activity.</p>
          ) : (
            transactions.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/10'}`}>
                    {t.type === 'income' ? <ArrowUpCircle size={18}/> : <ArrowDownCircle size={18}/>}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate w-24 dark:text-white">{t.category}</p>
                    <p className="text-[10px] text-gray-400">{t.date}</p>
                  </div>
                </div>
                <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  ${Number(t.amount).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ADD TRANSACTION BOX */}
        <div className="p-6 bg-blue-50 dark:bg-slate-800 rounded-3xl border border-blue-100 dark:border-slate-700 shadow-inner">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Plus size={16} className="text-blue-500"/> Add Transaction
          </h4>
          {formError && (
            <div className="mb-3 p-2 text-xs bg-red-500/10 text-red-500 rounded-lg">
              {formError}
            </div>
          )}
          <form onSubmit={handleAddSubmit} className="space-y-3">
            <input 
              type="number" 
              placeholder="Amount (e.g., 150)" 
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 ring-blue-500/20 dark:text-white"
            />
            <input 
              type="text" 
              placeholder="Category (e.g., Groceries)" 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 ring-blue-500/20 dark:text-white"
            />
            <input 
              type="text" 
              placeholder="Note (optional)" 
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 ring-blue-500/20 dark:text-white"
            />
            <div className="flex gap-2">
              {['income', 'expense'].map(type => (
                <button 
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type})}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.type === type ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button 
              type="submit" 
              disabled={role !== 'admin' || formSubmitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed cursor-pointer"
            >
              {formSubmitting ? 'SAVING...' : 'SAVE TRANSACTION'}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function SummaryCard({ title, amount, icon, trend }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all cursor-default">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl">{icon}</div>
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase mb-1 tracking-wider">{title}</p>
          <h3 className="text-2xl font-black dark:text-white">${amount.toLocaleString()}</h3>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-500/20">{trend}</p>
      </div>
    </div>
  );
}

function AnalyticsStatCard({ title, value, color }) {
  return (
    <div className={`${color} p-6 rounded-3xl text-white shadow-lg shadow-black/5`}>
      <p className="opacity-70 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h4 className="text-3xl font-black mt-2">{value}</h4>
    </div>
  );
}

function ToggleSetting({ title, description, active }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-800 last:border-0">
      <div>
        <p className="font-bold text-sm dark:text-white">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${active ? 'right-1' : 'left-1'}`}></div>
      </div>
    </div>
  );
}

export default App;