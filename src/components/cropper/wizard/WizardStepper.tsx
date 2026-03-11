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
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isClickable = onStepClick && canNavigate(step.number);

        return (
          <div key={step.number} className="flex items-center">
            {/* Step indicator - pixel style */}
            <button
              onClick={() => isClickable && onStepClick?.(step.number)}
              disabled={!isClickable}
              className={`
                flex items-center gap-2 px-3 py-1.5
                border-2 border-pixel-border
                transition-all
                ${isActive
                  ? 'text-pixel-text shadow-[3px_3px_0px_rgba(0,0,0,0.3)]'
                  : isCompleted
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]'
                    : 'bg-gray-100 text-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                }
                ${isClickable && !isActive ? 'cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px]' : ''}
                ${!isClickable ? 'cursor-default' : ''}
              `}
              style={isActive ? { backgroundColor: 'var(--theme-color, #fdc800)' } : undefined}
            >
              {/* Step number - pixel style */}
              <span
                className={`
                  w-5 h-5 flex items-center justify-center pixel-body text-sm font-bold
                  border border-current
                  ${isActive
                    ? 'bg-white/20 border-pixel-border/30'
                    : isCompleted
                      ? 'bg-amber-200 border-amber-600'
                      : 'bg-gray-200 border-gray-300'
                  }
                `}
              >
                {isCompleted ? (
                  // Pixel checkmark
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                    <rect x="2" y="5" width="2" height="2" />
                    <rect x="4" y="7" width="2" height="2" />
                    <rect x="6" y="5" width="2" height="2" />
                    <rect x="8" y="3" width="2" height="2" />
                  </svg>
                ) : (
                  step.number
                )}
              </span>
              <span className="pixel-body text-sm hidden sm:inline">
                {step.label}
              </span>
            </button>

            {/* Connector line - pixel dashed style */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-6 sm:w-10 h-0 mx-1 sm:mx-2
                  border-t-2 border-dashed
                  ${currentStep > step.number ? 'border-amber-500' : 'border-gray-300'}
                `}
                style={currentStep > step.number ? { borderColor: 'var(--theme-color, #fdc800)' } : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
