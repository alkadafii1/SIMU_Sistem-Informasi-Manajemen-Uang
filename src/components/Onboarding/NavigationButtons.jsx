import React from 'react';
import StepIndicator from './StepIndicator';

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

export default NavigationButtons;