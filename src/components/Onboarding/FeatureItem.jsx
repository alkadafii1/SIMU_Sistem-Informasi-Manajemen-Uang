import React from 'react';
import IconRenderer from './IconRenderer';

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

export default FeatureItem;