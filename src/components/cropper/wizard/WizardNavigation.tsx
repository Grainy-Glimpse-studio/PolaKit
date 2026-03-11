import { Button } from '@/components/ui';

interface WizardNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showBack?: boolean;
  showNext?: boolean;
}

export function WizardNavigation({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Continue',
  backDisabled = false,
  nextDisabled = false,
  nextLoading = false,
  showBack = true,
  showNext = true,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
      <div>
        {showBack && onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={backDisabled}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            {backLabel}
          </Button>
        )}
      </div>
      <div>
        {showNext && onNext && (
          <Button
            variant="primary"
            onClick={onNext}
            disabled={nextDisabled}
            loading={nextLoading}
          >
            {nextLabel}
            {!nextLoading && (
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
