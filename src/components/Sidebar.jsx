import React from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar({ userData, userAvatar, userInitial }) {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-100 flex-col justify-between p-6 h-screen sticky top-0">
      <div className="space-y-8">
        <div onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-3 px-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
        <img src="/favicon.webp" alt="Logo" className="w-full h-full object-contain" />
        </div>
          <span className="text-xl font-extrabold text-[#00685f]" style={{ fontFamily: 'Manrope, sans-serif' }}>SIMU</span>
        </div>
        <nav className="space-y-1.5">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#00685f]/10 text-[#00685f] font-semibold text-sm transition-all text-left">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span>Dashboard</span>
          </button>
          <button onClick={() => navigate('/statistics')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm transition-all text-left">
            <span className="material-symbols-outlined">analytics</span>
            <span>Statistik Analisis</span>
          </button>
          <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm transition-all text-left">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Riwayat Aktivitas</span>
          </button>
          <button onClick={() => navigate('/transaction')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm transition-all text-left">
            <span className="material-symbols-outlined">payments</span>
            <span>Target Tabungan</span>
          </button>
          <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm transition-all text-left">
            <span className="material-symbols-outlined">settings</span>
            <span>Pengaturan</span>
          </button>
        </nav>
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
        {userAvatar ? (
          <img src={userAvatar} className="w-10 h-10 rounded-full object-cover border border-slate-100" alt="avatar" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f]">
            {userInitial}
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-bold text-slate-800 truncate">{userData.name}</span>
          <span className="text-[10px] text-slate-400 font-medium truncate">{userData.email}</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;