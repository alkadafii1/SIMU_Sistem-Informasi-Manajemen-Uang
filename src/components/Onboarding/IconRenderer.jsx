import React from 'react';

const IconRenderer = ({ icon, className = "w-5 h-5" }) => {
  if (typeof icon === 'string' && icon.includes('.svg')) {
    return <img src={icon} alt="icon" className={className} />;
  }
  if (typeof icon === 'string') {
    return <span className="material-symbols-outlined text-base">{icon}</span>;
  }
  return icon;
};

export default IconRenderer;