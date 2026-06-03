import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TransactionPage from './pages/TransactionPage';
import HistoryPage from './pages/HistoryPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import SetupFinancial from './pages/SetupFinancial';
import ProfilePage from './pages/ProfilePage';
import GoalsSetting from './pages/GoalsSetting';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transaction" element={<TransactionPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/setup-financial" element={<SetupFinancial />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/goals-setting" element={<GoalsSetting />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}

export default App;