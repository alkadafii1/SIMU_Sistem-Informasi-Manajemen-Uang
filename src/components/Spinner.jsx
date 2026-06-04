import React from 'react';
import logo from '/favicon.webp';

const LoadingSpinner = ({ fullScreen = false, text = 'Memuat data...', size = 'md' }) => {
  
  // Ukuran berdasarkan props
  const sizes = {
    sm: {
      logo: 'w-8 h-8',
      text: 'text-xs',
      dot: 'w-1.5 h-1.5'
    },
    md: {
      logo: 'w-14 h-14',
      text: 'text-sm',
      dot: 'w-2 h-2'
    },
    lg: {
      logo: 'w-20 h-20',
      text: 'text-base',
      dot: 'w-2.5 h-2.5'
    }
  };

  const currentSize = sizes[size] || sizes.md;
  
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Logo */}
      <div className="flex items-center justify-center">
        <img 
          src={logo} 
          alt="Logo" 
          className={`${currentSize.logo} object-contain`} 
        />
      </div>

      {/* Bouncing dots + teks loading */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div 
            className={`${currentSize.dot} bg-[#00685f] rounded-full animate-bounce`} 
            style={{ animationDelay: '0ms', animationDuration: '0.6s' }}
          ></div>
          <div 
            className={`${currentSize.dot} bg-[#00685f] rounded-full animate-bounce`} 
            style={{ animationDelay: '150ms', animationDuration: '0.6s' }}
          ></div>
          <div 
            className={`${currentSize.dot} bg-[#00685f] rounded-full animate-bounce`} 
            style={{ animationDelay: '300ms', animationDuration: '0.6s' }}
          ></div>
        </div>
        <p className={`${currentSize.text} text-gray-500 dark:text-gray-400 font-medium`}>{text}</p>
      </div>
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-50 via-white to-[#f0f7f6] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {content}
      </div>
    );
  }
  
  return content;
};

export default LoadingSpinner;