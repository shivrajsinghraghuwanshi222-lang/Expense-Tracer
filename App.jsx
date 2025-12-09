import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  PieChart, 
  IndianRupee, 
  Coffee, 
  BookOpen, 
  Bus, 
  Smartphone, 
  Film, 
  MoreHorizontal,
  ArrowLeft,
  Filter,
  Clock
} from 'lucide-react';

// --- Components & Helpers ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', 
    month: 'short'
  });
};

const CATEGORIES = [
  { id: 'food', name: 'Food & Canteen', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
  { id: 'transport', name: 'Transport', icon: Bus, color: 'bg-blue-100 text-blue-600' },
  { id: 'books', name: 'Stationery & Books', icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'recharge', name: 'Recharge & Data', icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
  { id: 'entertainment', name: 'Movies & Fun', icon: Film, color: 'bg-pink-100 text-pink-600' },
  { id: 'misc', name: 'Miscellaneous', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' },
];

export default function App() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('student_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [view, setView] = useState('dashboard'); // dashboard, add
  const [timeFilter, setTimeFilter] = useState('monthly'); // daily, weekly, monthly
  
  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);

  useEffect(() => {
    localStorage.setItem('student_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!amount) return;

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amount),
      description: description || CATEGORIES.find(c => c.id === category).name,
      category,
      date: new Date().toISOString(),
    };

    setExpenses([newExpense, ...expenses]);
    setAmount('');
    setDescription('');
    setView('dashboard');
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // --- Analytics Logic ---

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of week (Monday)
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0,0,0,0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (timeFilter === 'daily') return expenseDate >= startOfDay;
      if (timeFilter === 'weekly') return expenseDate >= startOfWeek;
      if (timeFilter === 'monthly') return expenseDate >= startOfMonth;
      return true;
    });
  }, [expenses, timeFilter]);

  const totalSpent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const categoryBreakdown = useMemo(() => {
    const stats = {};
    filteredExpenses.forEach(e => {
      stats[e.category] = (stats[e.category] || 0) + e.amount;
    });
    return Object.entries(stats)
      .map(([key, value]) => ({
        id: key,
        amount: value,
        percentage: (value / totalSpent) * 100,
        ...CATEGORIES.find(c => c.id === key)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, totalSpent]);

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden flex flex-col relative">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {view === 'dashboard' ? (
          // --- DASHBOARD VIEW ---
          <div className="pb-24 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <IndianRupee size={120} />
              </div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h1 className="text-sm font-medium opacity-90">Total Spent</h1>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm capitalize">
                       {timeFilter}
                     </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const next = timeFilter === 'daily' ? 'weekly' : timeFilter === 'weekly' ? 'monthly' : 'daily';
                    setTimeFilter(next);
                  }}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors"
                >
                  <Filter size={20} />
                </button>
              </div>

              <div className="relative z-10">
                <h2 className="text-5xl font-bold tracking-tight">
                   {formatCurrency(totalSpent).replace('₹', '')}<span className="text-2xl opacity-80">₹</span>
                </h2>
                <p className="text-indigo-100 mt-2 text-sm">Keep it up! Manage your budget wisely.</p>
              </div>
            </div>

            {/* Quick Stats / Chart Placeholder */}
            <div className="px-6 -mt-8 relative z-10">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <PieChart size={18} className="text-indigo-500"/> Breakdown
                    </h3>
                 </div>
                 
                 {categoryBreakdown.length > 0 ? (
                   <div className="space-y-3">
                     {categoryBreakdown.slice(0, 3).map((cat) => (
                       <div key={cat.id} className="relative">
                         <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-600 font-medium flex items-center gap-2">
                             <cat.icon size={14} className="text-gray-400"/> {cat.name}
                           </span>
                           <span className="font-bold text-gray-800">{formatCurrency(cat.amount)}</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                           <div 
                              className={`h-full rounded-full ${cat.color.split(' ')[0].replace('bg-', 'bg-')}`} 
                              style={{ width: `${cat.percentage}%` }}
                           ></div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-4 text-gray-400 text-sm">
                     No expenses in this period.
                   </div>
                 )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="px-6 mt-8">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center justify-between">
                <span>Recent Activity</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Last 10</span>
              </h3>
              
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                     <Coffee size={48} className="mx-auto mb-2 text-gray-300" />
                     <p>No expenses yet. Add one!</p>
                  </div>
                ) : (
                  expenses.slice(0, 10).map((expense) => {
                    const cat = CATEGORIES.find(c => c.id === expense.category);
                    return (
                      <div key={expense.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl ${cat.color}`}>
                          <cat.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{cat.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                             <span className="truncate max-w-[120px]">{expense.description}</span>
                             <span>•</span>
                             <span className="flex items-center gap-1">
                               <Clock size={10} />
                               {formatDate(expense.date)}, {formatTime(expense.date)}
                             </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">-{formatCurrency(expense.amount)}</p>
                          <button 
                            onClick={() => deleteExpense(expense.id)}
                            className="text-xs text-red-400 mt-1 hover:text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          // --- ADD EXPENSE VIEW ---
          <div className="flex flex-col h-full bg-white animate-fade-in">
            <div className="p-4 flex items-center border-b border-gray-100">
              <button onClick={() => setView('dashboard')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold ml-2 text-gray-800">Add Expense</h2>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 flex-1 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-gray-800 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2 ${
                        category === cat.id 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`p-2 rounded-full mb-1 ${cat.color} bg-opacity-20`}>
                        <cat.icon size={20} />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{cat.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Note (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Samosas with Rahul"
                  className="w-full p-4 text-lg text-gray-800 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={!amount}
                className="mt-auto w-full py-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Save Expense
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {view === 'dashboard' && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <button
            onClick={() => setView('add')}
            className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl shadow-indigo-300 transform transition-transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2 px-6"
          >
            <Plus size={24} strokeWidth={3} />
            <span className="font-bold">Add Expense</span>
          </button>
        </div>
      )}
    </div>
  );
}