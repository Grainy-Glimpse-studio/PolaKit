import type { WizardStep } from '@/types';

interface WizardStepperProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  canNavigate?: (step: WizardStep) => boolean;
}

const steps = [
  { number: 1 as WizardStep, label: 'Upload' },
  { number: 2 as WizardStep, label: 'Settings' },
  { number: 3 as WizardStep, label: 'Rename' },
  { number: 4 as WizardStep, label: 'Process' },
];

export function WizardStepper({
  currentStep,
  onStepClick,
  canNavigate = () => true,
}: WizardStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isClickable = onStepClick && canNavigate(step.number);

        return (
          <div key={step.number} className="flex items-center">
            {/* Step indicator */}
            <button
              onClick={() => isClickable && onStepClick?.(step.number)}
              disabled={!isClickable}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
                ${isActive
                  ? 'bg-rose-500 text-white shadow-md'
                  : isCompleted
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    : 'bg-gray-100 text-gray-400'
                }
                ${isClickable && !isActive ? 'cursor-pointer' : ''}
                ${!isClickable ? 'cursor-default' : ''}
              `}
            >
              <span
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium
                  ${isActive
                    ? 'bg-white/20'
                    : isCompleted
                      ? 'bg-rose-200 text-rose-700'
                      : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </span>
              <span className="text-sm font-medium hidden sm:inline">
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-colors
                  ${currentStep > step.number ? 'bg-rose-300' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
