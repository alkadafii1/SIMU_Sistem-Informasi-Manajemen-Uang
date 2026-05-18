import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupFinancial from './pages/SetupFinancial';
import Dashboard from './pages/Dashboard';
import TransactionPage from './pages/TransactionPage';
import StatisticsPage from './pages/StatisticsPage'; 
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  // State global untuk pendapatan/saldo utama
  const [monthlyIncome, setMonthlyIncome] = useState(5000000);
  const [customPct, setCustomPct] = useState({ kebutuhan: 50, keinginan: 30, tabungan: 20 });
  const [userSelectedGoals, setUserSelectedGoals] = useState(['rumah']);
  
  // State global untuk menampung riwayat aktivitas transaksi secara real-time
  const [transactions, setTransactions] = useState([
    { type: 'pemasukan', amount: 5000000, category: 'Gaji Pokok', note: 'Setup Saldo Awal', date: 'Baru saja' }
  ]);

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-slate-800 antialiased font-sans">
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/setup-financial" 
          element={
            <SetupFinancial 
              setMonthlyIncome={setMonthlyIncome} 
              setCustomPct={setCustomPct}
              setUserSelectedGoals={setUserSelectedGoals}
            />
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              monthlyIncome={monthlyIncome} 
              setMonthlyIncome={setMonthlyIncome}
              customPct={customPct}
              userSelectedGoals={userSelectedGoals}
              transactions={transactions}
            />
          } 
        />

        <Route 
          path="/transaction" 
          element={
            <TransactionPage 
              monthlyIncome={monthlyIncome} 
              setMonthlyIncome={setMonthlyIncome}
              transactions={transactions}
              setTransactions={setTransactions}
            />
          } 
        />

        <Route 
          path="/statistics" 
          element={
            <StatisticsPage 
              monthlyIncome={monthlyIncome}
              customPct={customPct}
            />
          } 
        />

        <Route 
          path="/history" 
          element={
            <HistoryPage 
              monthlyIncome={monthlyIncome}
              transactions={transactions}
            />
          } 
        />

        {/* ROUTE BARU: Halaman Utama Settings */}
        <Route 
          path="/settings" 
          element={
            <SettingsPage />
          } 
        />

        {/* ROUTE BARU: Halaman Detail / Edit Profile Settings */}
        <Route 
          path="/profile" 
          element={
            <ProfilePage 
              monthlyIncome={monthlyIncome}
            />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;