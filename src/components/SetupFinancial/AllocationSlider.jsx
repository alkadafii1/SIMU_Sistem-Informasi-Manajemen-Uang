import React from 'react';

const AllocationSlider = ({ 
  title, 
  color, 
  percentage, 
  nominal, 
  onUpdate, 
  maxValue,
  description,
  formatRupiah 
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
          <span className="text-xs text-slate-400">({formatRupiah(nominal)})</span>
        </div>
      </div>
      <input 
        type="range" 
        min="0" 
        max={maxValue} 
        value={percentage}
        onChange={(e) => onUpdate(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: color }}
      />
      <p className="text-[10px] text-slate-400 mt-1">{description}</p>
    </div>
  );
};

export default AllocationSlider;