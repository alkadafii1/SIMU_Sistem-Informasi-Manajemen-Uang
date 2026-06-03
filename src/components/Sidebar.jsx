import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function Sidebar({ userData, userAvatar, userInitial }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: t('dashboard') },
    { path: '/transaction', icon: 'add_card', label: t('transactions') },
    { path: '/history', icon: 'receipt_long', label: t('history') },
    { path: '/settings', icon: 'settings', label: t('settings') },
  ];

  const isActive = (path) => location.pathname === path;

  // Theme-based styles
  const sidebarBg = isDarkMode ? 'bg-[#1f2937]' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-slate-200';
  const borderTopColor = isDarkMode ? 'border-gray-700' : 'border-slate-100';
  const textColor = isDarkMode ? 'text-gray-300' : 'text-slate-500';
  const activeBg = isDarkMode ? 'bg-[#00685f]/20' : 'bg-[#00685f]/10';
  const activeText = 'text-[#00685f]';
  const hoverBg = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50';
  const buttonHover = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100';
  const logoTextColor = isDarkMode ? 'text-white' : 'text-[#00685f]';
  const userNameColor = isDarkMode ? 'text-gray-200' : 'text-slate-800';

  return (
    <>
      {/* Dekstop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen z-40 ${sidebarBg} border-r ${borderColor} transition-all duration-300 ${
          collapsed ? 'w-14' : 'w-52'
        }`}
      >
        {/* Tombol Minimize */}
        <div className={`py-3 ${collapsed ? 'px-2' : 'px-3'} border-b ${borderTopColor}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center justify-center py-1.5 rounded-md ${textColor} ${buttonHover} transition-colors`}
            title={collapsed ? "Expand" : "Minimize"}
          >
            <span className="material-symbols-outlined text-base">
              {collapsed ? 'menu' : 'chevron_left'}
            </span>
            {!collapsed && (
              <span className="text-xs ml-1">{t('collapse') || 'Sembunyikan'}</span>
            )}
          </button>
        </div>

        {/* Logo */}
        <div className={`py-4 ${collapsed ? 'px-0' : 'px-3'}`}>
          <div
            onClick={() => navigate('/dashboard')}
            className={`flex items-center cursor-pointer ${collapsed ? 'justify-center' : 'gap-2'}`}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/favicon.webp" 
                alt="SIMU Logo" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {!collapsed && (
              <span className={`text-base font-bold ${logoTextColor}`}>SIMU</span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                isActive(item.path)
                  ? `${activeBg} ${activeText} font-semibold`
                  : `${textColor} ${hoverBg}`
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="material-symbols-outlined text-base">{item.icon}</span>
              {!collapsed && <span className="text-xs">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className={`py-3 border-t ${borderTopColor} ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
            {userAvatar ? (
              <img 
                src={userAvatar} 
                className="w-7 h-7 rounded-full object-cover flex-shrink-0" 
                alt="avatar" 
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f] text-xs flex-shrink-0">
                {userInitial}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold truncate ${userNameColor}`}>
                  {userData?.name || 'Pengguna'}
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  {userData?.email || 'email@example.com'}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer untuk desktop */}
      <div className={`hidden md:block transition-all duration-300 ${collapsed ? 'w-14' : 'w-52'}`} />

      {/* Mobile Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t flex justify-around items-center h-16 px-4 md:hidden ${
        isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive(item.path)
                ? 'text-[#00685f]'
                : isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`}
          >
            <span 
              className="material-symbols-outlined text-base"
              style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] font-medium mt-0.5 ${
              isActive(item.path) ? 'font-bold' : ''
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="block md:hidden h-16" />
    </>
  );
}

export default Sidebar;