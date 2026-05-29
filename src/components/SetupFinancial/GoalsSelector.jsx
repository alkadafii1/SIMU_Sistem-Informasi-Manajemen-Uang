import React from 'react';
import { GOALS_OPTIONS } from '../../constants/setupData';

const GoalsSelector = ({ selectedGoals, toggleGoal }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-base text-[#1E4D4A]">target</span>
        Pilih Target Finansial Impian
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOALS_OPTIONS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-[#1E4D4A]/5 border-[#1E4D4A] shadow-sm' 
                  : 'bg-transparent border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-[#1E4D4A] text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <span className="material-symbols-outlined text-lg">{goal.icon}</span>
              </div>
              <span className="text-xs font-semibold">{goal.label}</span>
              {isSelected && (
                <span className="ml-auto text-[#1E4D4A] text-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-3">Pilih target yang ingin kamu capai (bisa lebih dari satu)</p>
    </div>
  );
};

export default GoalsSelector;