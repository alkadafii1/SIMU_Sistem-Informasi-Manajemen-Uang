import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper component untuk render icon (SVG)
const IconRenderer = ({ icon, className = "w-5 h-5" }) => {
  if (typeof icon === 'string' && icon.includes('.svg')) {
    return <img src={icon} alt="icon" className={className} />;
  }
  if (typeof icon === 'string') {
    return <span className="text-base">{icon}</span>;
  }
  return icon;
};

// Data Statistic
const STEP_ONE_FEATURES = [
  { icon: '/icons/notes.svg', text: 'Catat pemasukan & pengeluaran cepat' },
  { icon: '/icons/budget.svg', text: 'Rekomendasi budget harian berbasis AI' },
  { icon: '/icons/lock.svg', text: 'Analisis aman dengan enkripsi' },
];

const ALLOCATIONS = [
  { icon: '/icons/needs.svg', name: 'Kebutuhan Utama', description: 'Cicilan, Tagihan, Makanan & Transportasi', percentage: 50, color: '#006D77', bgColor: 'bg-[#006D77]/30' },
  { icon: '/icons/wants.svg', name: 'Keinginan & Hobi', description: 'Jajan, Konser, & Self-reward', percentage: 30, color: '#2A9D8F', bgColor: 'bg-[#2A9D8F]/20' },
  { icon: '/icons/invest.svg', name: 'Tabungan & Investasi', description: 'Dana darurat, Saham, & Masa depan', percentage: 20, color: '#80CED7', bgColor: 'bg-[#80CED7]/40' },
];

const SIMULATION_DATA = [
  { label: 'Kebutuhan', value: 'Rp 2.500.000', color: 'bg-[#006D77]', width: 'w-1/2' },
  { label: 'Keinginan', value: 'Rp 1.500.000', color: 'bg-[#2A9D8F]', width: 'w-[30%]' },
  { label: 'Tabungan', value: 'Rp 1.000.000', color: 'bg-[#80CED7] ', width: 'w-1/5' },
];

const STEP_THREE_FEATURES = [
  { icon: '/icons/budget.svg', title: 'Smart Daily Budget', description: 'Batas belanja harianmu dikalkulasi otomatis setiap pagi agar akhir bulan tetap aman.', bgColor: 'bg-emerald-50/80 border border-emerald-100' },
  { icon: '/icons/ai.svg', title: 'AI Financial Advisor', description: 'Dapatkan insight personal mendalam mengenai kebiasaan tokomu langsung dari AI.', bgColor: 'bg-indigo-50/80 border border-indigo-100' },
  { icon: '/icons/target.svg', title: 'Dream Tracker', description: 'Visualisasikan target tabungan untuk barang impianmu dengan persentase progres nyata.', bgColor: 'bg-rose-50/80 border border-rose-100' },
];

const TRANSACTIONS = [
  { icon: '/icons/coffee.svg', label: 'Kopi Susu', amount: '-Rp 28.000', category: 'Keinginan', isExpense: true },
  { icon: '/icons/car.svg', label: 'Grab Car', amount: '-Rp 45.000', category: 'Kebutuhan', isExpense: true },
  { icon: '/icons/salary.svg', label: 'Gaji Bulanan', amount: '+Rp 5.000.000', category: 'Pemasukan', isExpense: false },
];

// Reusable Sub-Components
const StepIndicator = ({ currentStep, totalSteps, onStepClick }) => (
  <div className="flex items-center gap-2.5">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <button
        key={step}
        onClick={() => onStepClick(step)}
        className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
          currentStep === step
            ? 'w-9 bg-[#1E4D4A] shadow-lg shadow-[#1E4D4A]/30'
            : 'w-2.5 bg-slate-200 hover:bg-slate-300'
        }`}
        aria-label={`Step ${step}`}
      />
    ))}
    <span className="text-xs font-semibold text-slate-400 ml-2 tracking-wider">
      {currentStep} / {totalSteps}
    </span>
  </div>
);

const NavigationButtons = ({ step, totalSteps, onPrev, onNext, onStepClick }) => {
  const isLastStep = step === totalSteps;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-6 border-t border-slate-100/80">
      <StepIndicator currentStep={step} totalSteps={totalSteps} onStepClick={onStepClick} />
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {step > 1 && (
          <button
            onClick={onPrev}
            className="flex-1 sm:flex-none px-6 py-3.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer min-w-[100px]"
          >
            Kembali
          </button>
        )}
        <button
          onClick={onNext}
          className={`${
            step > 1 ? 'flex-1 sm:flex-none' : 'w-full'
          } px-8 py-3.5 bg-[#1E4D4A] hover:bg-[#143533] text-white text-sm font-bold rounded-2xl shadow-xl shadow-[#1E4D4A]/20 hover:shadow-[#1E4D4A]/30 transition-all duration-200 active:scale-[0.98] cursor-pointer min-w-[140px]`}
        >
          {isLastStep ? 'Mulai Sekarang' : 'Selanjutnya'}
        </button>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, bgColor, title, description }) => (
  <div className="flex items-start gap-4 text-left p-3.5 rounded-2xl hover:bg-white/50 transition-colors duration-200">
    <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
      <IconRenderer icon={icon} className="w-5 h-5" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-slate-800 mb-0.5">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

const AllocationCard = ({ icon, name, description, percentage, color, bgColor }) => (
  <div className="flex items-center justify-between p-4 bg-white/80 border border-slate-100/60 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center gap-3.5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
        <IconRenderer icon={icon} className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-800">{name}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="text-right flex-shrink-0 ml-4 bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100">
      <span className="text-2xl font-black tracking-tight" style={{ color }}>{percentage}%</span>
      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Gaji</p>
    </div>
  </div>
);

// Step Components
const StepOne = () => (
  <div className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-20 animate-fadeIn">
    {/* Ilustrasi Mewah */}
    <div className="flex-1 flex justify-center relative">
      <div className="absolute w-72 h-72 bg-gradient-to-tr from-[#1E4D4A]/10 to-transparent rounded-full blur-3xl -top-10"></div>
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#E0EBE9] to-[#D4E4E1] rounded-[48px] rotate-6 shadow-xl shadow-[#1E4D4A]/5"></div>
        <div className="absolute inset-0 bg-white/40 border border-white/60 backdrop-blur-md rounded-[48px] -rotate-3 opacity-80 shadow-inner"></div>
        
        {/* Floating Abstract Cards */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-44 h-28 md:w-56 md:h-36 bg-gradient-to-br from-[#2D5A53] to-[#1E4D4A] rounded-3xl border-4 border-white shadow-2xl relative flex flex-col justify-between p-4 text-white hover:rotate-0 transition-transform duration-500 cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <div className="h-1.5 w-12 bg-white/40 rounded-full"></div>
                <div className="h-1.5 w-8 bg-white/20 rounded-full"></div>
              </div>
              <span className="text-lg">💳</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-mono tracking-wider opacity-60">**** 4829</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Teks Editorial */}
    <div className="flex-1 text-center lg:text-left max-w-md w-full">
      <div className="inline-flex items-center gap-2 bg-[#1E4D4A]/10 text-[#1E4D4A] text-xs font-bold px-3.5 py-2 rounded-full mb-5 shadow-sm border border-[#1E4D4A]/5">
        <span className="w-2 h-2 bg-[#1E4D4A] rounded-full animate-pulse"></span>
        Financial Freedom Start Here
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 mb-4 leading-tight tracking-tight">
        Kuasai Uangmu Bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4D4A] to-[#4b807c]">SIMU</span>
      </h2>
      <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-8 font-medium">
        Asisten finansial pintar yang membantu Anda mencatat log harian, mengalokasikan anggaran otomatis, hingga menganalisis kesehatan keuangan dengan teknologi AI.
      </p>

      <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-3xl border border-slate-100/50">
        {STEP_ONE_FEATURES.map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3.5 text-left bg-white p-3 rounded-2xl shadow-sm border border-slate-100/40">
            <div className="w-9 h-9 bg-[#E0EBE9] rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
              <IconRenderer icon={icon} className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-600">{text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StepTwo = () => (
  <div className="w-full flex flex-col lg:flex-row items-start gap-10 lg:gap-20 animate-fadeIn">
    {/* Kiri - Dashboard Ring */}
    <div className="flex-1 flex flex-col items-center lg:items-start w-full">
      <div className="relative w-40 h-40 md:w-48 md:h-48 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
        <svg className="w-full h-full -rotate-90 relative filter drop-shadow-md" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="#E6F7F5" strokeWidth="12" />
          
          {/* Segmen 1: Kebutuhan 50% */}
          <circle 
            cx="50" cy="50" r="40" fill="none" 
            stroke="#006D77" strokeWidth="12" 
            strokeDasharray="251.3" 
            strokeDashoffset="0" 
            strokeLinecap="butt" 
          />
          
          {/* Segmen 2: Keinginan 30% */}
          <circle 
            cx="50" cy="50" r="40" fill="none" 
            stroke="#2A9D8F" strokeWidth="12" 
            strokeDasharray="251.3" 
            strokeDashoffset="-125.7" 
            strokeLinecap="butt" 
          />
          
          {/* Segmen 3: Tabungan 20% */}
          <circle 
            cx="50" cy="50" r="40" fill="none" 
            stroke="#80CED7" strokeWidth="12" 
            strokeDasharray="251.3" 
            strokeDashoffset="-201.1" 
            strokeLinecap="butt" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/80 w-24 h-24 rounded-full flex flex-col items-center justify-center border border-white backdrop-blur-sm shadow-md">
            <span className="text-xl font-black text-slate-800 tracking-tighter">50/30/20</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Metode</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-6 mb-3 text-center lg:text-left tracking-tight">
        Alokasi Otomatis,<br className="hidden lg:block" /> Bebas Overspending
      </h2>
      <p className="text-sm text-slate-500 leading-relaxed text-center lg:text-left max-w-sm mb-6">
        Pendapatan Anda otomatis dibagi rapi demi masa depan finansial yang kokoh dan bebas stres.
      </p>

      {/* Simulasi Card Premium */}
      <div className="w-full max-w-sm bg-white/70 border border-white backdrop-blur-md shadow-xl shadow-slate-100 rounded-3xl p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
            Simulasi Gaji Bulanan
          </p>
          <span className="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-100">Rp 5.000.000</span>
        </div>
        <div className="space-y-3.5">
          {SIMULATION_DATA.map(({ label, value, color, width }) => (
            <div key={label} className="group">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">{label}</span>
                <span className="font-bold text-slate-800">{value}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1.5px]">
                <div className={`h-full ${color} ${width} rounded-full transition-all duration-1000 origin-left shadow-sm`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Kanan - Stacked Cards */}
    <div className="flex-1 w-full space-y-4">
      {ALLOCATIONS.map((item) => (
        <AllocationCard key={item.name} {...item} />
      ))}

      {/* Smart Tip Card */}
      <div className="p-4.5 bg-gradient-to-r from-[#1E4D4A]/5 to-[#A3B18A]/10 border border-[#1E4D4A]/10 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 text-7xl opacity-5 pointer-events-none translate-x-4 translate-y-4">💡</div>
        <div className="flex items-start gap-3.5">
        </div>
      </div>
    </div>
  </div>
);

const StepThree = () => (
  <div className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-20 animate-fadeIn">
    {/* Smartphone Mockup */}
    <div className="flex-1 flex justify-center relative w-full">
      <div className="absolute w-60 h-80 bg-[#1E4D4A]/10 rounded-full blur-3xl scale-110 top-10"></div>
      <div className="relative w-56 h-[370px] md:w-64 md:h-[420px] bg-slate-900 border-[7px] border-slate-800 rounded-[44px] shadow-2xl flex flex-col overflow-hidden transform hover:rotate-2 transition-transform duration-500">
        
        {/* Screen Content Wrapper */}
        <div className="bg-white flex-1 flex flex-col overflow-hidden rounded-[38px] p-4 relative">
          
          {/* Dynamic Island Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4.5 bg-slate-900 rounded-full z-50 flex items-center justify-end px-2">
            <div className="w-1.5 h-1.5 bg-indigo-900/40 rounded-full border border-indigo-400/20"></div>
          </div>

          {/* Top Status Bar Mock */}
          <div className="flex justify-between items-center pt-1.5 pb-3 px-2">
            <span className="text-[9px] text-slate-700 font-extrabold">9:41</span>
            <div className="flex items-center gap-1 opacity-60">
              <span className="text-[8px]">📶</span>
              <span className="text-[8px]">🔋</span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto no-scrollbar">
            {/* App Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-medium text-slate-400">Selamat datang 👋</p>
                <p className="text-xs font-black text-slate-800">Pengguna</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-tr from-[#1E4D4A] to-[#2D5A53] rounded-xl flex items-center justify-center shadow-md shadow-[#1E4D4A]/20">
                <span className="text-white text-xs font-black">P</span>
              </div>
            </div>

            {/* Neon Budget Card */}
            <div className="bg-gradient-to-br from-[#1E4D4A] to-[#143533] rounded-2xl p-3.5 text-white shadow-xl shadow-[#1E4D4A]/10 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
              <p className="text-[8px] uppercase tracking-wider opacity-60 font-bold mb-1">Sisa Dana Hari Ini</p>
              <p className="text-xl font-black tracking-tight leading-none">Rp 125.000</p>
              
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-300 to-teal-400 w-3/4 h-full rounded-full"></div>
              </div>
              <div className="flex justify-between mt-1.5 text-[8px] opacity-70 font-medium">
                <p>Terpakai: Rp 93k</p>
                <p>Sisa: Rp 32k</p>
              </div>
            </div>

            {/* Mini Transaction List */}
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Aktivitas Terbaru</p>
              <div className="space-y-1.5">
                {TRANSACTIONS.map(({ icon, label, amount, category, isExpense }) => (
                  <div key={label} className="flex items-center gap-2.5 py-1.5 border-b border-slate-50 last:border-0">
                    <div className="w-7 h-7 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                      <IconRenderer icon={icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-slate-700 truncate leading-tight">{label}</p>
                      <p className="text-[7px] text-slate-400 font-medium">{category}</p>
                    </div>
                    <p className={`text-[10px] font-black tracking-tight flex-shrink-0 ${isExpense ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Alert Widget */}
            <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-center gap-2.5 mt-auto shadow-sm">
              <span className="text-sm flex-shrink-0 animate-pulse">🚨</span>
              <p className="text-[8px] text-amber-800 font-semibold leading-normal">
                Anggaran <span className="underline font-black">Keinginan</span> tersisa 15% lagi untuk hari ini. Rem dulu yuk!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Kanan - Feature Badges Grid */}
    <div className="flex-1 text-center lg:text-left max-w-md w-full">
      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-emerald-100/50">
        🛡️ Pantau Finansial Secara Real-Time
      </div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
      Daily Budget & <br/>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4D4A] to-[#609994]">Smart Alert</span>
      </h2>
      <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-6 font-medium">
        Nikmati kendali penuh setiap hari. Dapatkan pengingat proaktif sebelum dompet Anda mengalami defisit tak terduga.
      </p>

      <div className="space-y-3">
        {STEP_THREE_FEATURES.map((feature) => (
          <FeatureItem key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  </div>
);

// Main App Component
const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const totalSteps = 3;

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  const stepContent = {
    1: <StepOne />,
    2: <StepTwo />,
    3: <StepThree />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-[#f0f7f6] relative font-sans">
      
      {/* Premium Ambient Background Blurs */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-[#1E4D4A]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-30 -left-30 w-80 h-80 bg-[#A3B18A]/8 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="flex flex-col max-w-6xl mx-auto w-full z-10 relative px-5 py-6 md:p-8 lg:p-12">
        
        {/* Clean Modern Header - Sticky di mobile */}
        <div className="sticky top-0 z-20 flex justify-between items-center mb-8 md:mb-12 bg-white/80 backdrop-blur-sm -mx-5 px-5 py-3 md:bg-transparent md:backdrop-blur-none md:static md:p-0">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <img src="/favicon.webp" alt="Logo" className="w-9 h-9 object-contain group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-[#1E4D4A] font-black text-xl tracking-tight hidden sm:block">SIMU</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-bold text-slate-400 hover:text-[#1E4D4A] uppercase tracking-wider bg-slate-100/50 hover:bg-[#1E4D4A]/10 border border-transparent hover:border-[#1E4D4A]/5 px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Lewati
          </button>
        </div>

        {/* Dynamic Step Content Area */}
        <div className="flex-1 min-h-[400px] md:min-h-[500px]">
          {stepContent[step]}
        </div>

        {/* Global Navigation Controller */}
        <div className="sticky bottom-0 z-20 bg-white/80 backdrop-blur-sm -mx-5 px-5 py-4 mt-8 md:bg-transparent md:backdrop-blur-none md:static md:p-0 md:mt-4">
          <NavigationButtons 
            step={step}
            totalSteps={totalSteps}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
            onStepClick={setStep}
          />
        </div>
      </div>

      {/* Animasi CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;