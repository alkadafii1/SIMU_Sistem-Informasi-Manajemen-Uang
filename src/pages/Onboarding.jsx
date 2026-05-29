import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepOne from '../components/Onboarding/StepOne';
import StepTwo from '../components/Onboarding/StepTwo';
import StepThree from '../components/Onboarding/StepThree';
import NavigationButtons from '../components/Onboarding/NavigationButtons';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const totalSteps = 3;

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
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
        
        {/* Header */}
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

        {/* Step Content */}
        <div className="flex-1 min-h-[400px] md:min-h-[500px]">
          {stepContent[step]}
        </div>

        {/* Navigation */}
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