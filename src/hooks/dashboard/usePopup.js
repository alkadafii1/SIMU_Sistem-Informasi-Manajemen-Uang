import { useState, useEffect, useRef } from 'react';

export const usePopup = (location, duration = 10000) => {
  const [showPopup, setShowPopup] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (location.state?.fromSetup) {
      setShowPopup(true);
      setProgress(100);
      
      const startTime = Date.now();
      
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
        }
      }, 16);
      
      timerRef.current = setTimeout(() => {
        setShowPopup(false);
        setProgress(0);
        clearInterval(intervalRef.current);
      }, duration);
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.state, duration]);

  const closePopup = () => {
    setShowPopup(false);
    setProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return { showPopup, progress, closePopup };
};