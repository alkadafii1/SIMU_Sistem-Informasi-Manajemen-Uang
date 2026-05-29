import React from 'react';
import IconRenderer from './IconRenderer';

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

export default AllocationCard;