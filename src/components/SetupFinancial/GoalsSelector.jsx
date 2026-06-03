import React from 'react';

// Data goals dengan gambar
const GOALS_OPTIONS = [
  { id: 'rumah', label: 'Beli Rumah Impian', icon: 'home', image: '/images/goals/home.svg' },
  { id: 'mobil', label: 'Beli Mobil Baru', icon: 'directions_car', image: '/images/goals/car.svg' },
  { id: 'liburan', label: 'Liburan', icon: 'flight', image: '/images/goals/travel.svg' },
  { id: 'gadget', label: 'Upgrade Gadget & PC', icon: 'laptop_mac', image: '/images/goals/gadget.svg' },
  { id: 'darurat', label: 'Dana Darurat Utama', icon: 'health_and_safety', image: '/images/goals/emergency.svg' }
];

const GoalsSelector = ({ selectedGoals, toggleGoal }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-base text-[#1E4D4A]">target</span>
        Pilih Target Finansial Impian
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {GOALS_OPTIONS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 ${
                isSelected 
                  ? 'border-[#1E4D4A] bg-[#1E4D4A]/5 shadow-md' 
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
              }`}
            >
              {/* Image Container */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 p-2 ${
                isSelected 
                  ? 'bg-[#1E4D4A] shadow-md' 
                  : 'bg-slate-50 group-hover:bg-slate-100'
              }`}>
                <img 
                  src={goal.image} 
                  alt={goal.label}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback ke Material Icon jika gambar tidak ditemukan
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      const span = document.createElement('span');
                      span.className = 'material-symbols-outlined text-2xl';
                      span.textContent = goal.icon;
                      if (isSelected) span.style.color = 'white';
                      parent.appendChild(span);
                      e.target.remove();
                    }
                  }}
                />
              </div>
              
              {/* Label */}
              <span className={`text-xs font-semibold text-center ${
                isSelected ? 'text-[#1E4D4A]' : 'text-slate-600'
              }`}>
                {goal.label}
              </span>
              
              {/* Checkmark ketika terpilih */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1E4D4A] rounded-full flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-[10px] text-slate-400 text-center mt-4">
        Pilih target yang ingin kamu capai (bisa lebih dari satu)
      </p>
    </div>
  );
};

export default GoalsSelector;