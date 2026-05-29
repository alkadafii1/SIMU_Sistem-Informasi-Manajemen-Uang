import React from 'react';

const StepIndicator = ({ currentStep, totalSteps, onStepClick }) => {
  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <button
          key={step}
          onClick={() => onStepClick(step)}
          className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
            currentStep === step
              ? 'w-9 bg-[#1E4D4A] shadow-lg shadow-[#1E4D4A]/30'
              : 'w-2.5 bg-slate-200 hover:bg-slate-300'
          }`}
          aria-label={`Step ${step}`}
        />
      ))}
      <span className="text-xs font-semibold text-slate-400 ml-2 tracking-wider">
        {currentStep} / {totalSteps}
      </span>
    </div>
  );
};

export default StepIndicator;