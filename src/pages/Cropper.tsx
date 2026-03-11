import { useState } from 'react';
import type { WizardStep } from '@/types';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { useExport } from '@/hooks/useExport';
import { PageLayout } from '@/components/ui';
import {
  WizardStepper,
  StepUpload,
  StepSettings,
  StepRename,
  StepProcess,
  CropperTemplateBar,
  CropperTemplateProvider,
} from '@/components/cropper/wizard';

export function Cropper() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);

  const {
    cvReady,
    images,
    settings,
    isProcessing,
    progress,
    addImages,
    removeImage,
    clearImages,
    updateSettings,
    updateImageName,
    processAllImages,
  } = useImageProcessor();

  const { exportAsZip, downloadSingle, exporting } = useExport();

  // 判断是否可以导航到某个步骤
  const canNavigateToStep = (step: WizardStep): boolean => {
    if (step === 1) return true;
    if (step > 1 && images.length === 0) return false;
    return step <= currentStep;
  };

  const goToStep = (step: WizardStep) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
    }
  };

  const handleClearAll = () => {
    clearImages();
    setCurrentStep(1);
  };

  return (
    <PageLayout
      title="Polaroid Cropper"
      subtitle="Remove borders & fix perspective"
      accentColor="rose"
      headerActions={
        images.length > 0 ? (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear All
          </button>
        ) : null
      }
    >
      {/* Wizard Stepper */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <WizardStepper
          currentStep={currentStep}
          onStepClick={goToStep}
          canNavigate={canNavigateToStep}
        />
        <CropperTemplateBar
          settings={settings}
          showDetails={showTemplateDetails}
          onToggleDetails={() => setShowTemplateDetails(!showTemplateDetails)}
        />
      </div>

      {/* Step Content */}
      <CropperTemplateProvider showDetails={showTemplateDetails}>
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <StepUpload
              images={images}
              onFilesSelect={addImages}
              onRemoveImage={removeImage}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <StepRename
              images={images}
              settings={settings}
              onUpdateSettings={updateSettings}
              onUpdateImageName={updateImageName}
              onBack={() => setCurrentStep(2)}
              onNext={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <StepProcess
              images={images}
              isProcessing={isProcessing}
              progress={progress}
              cvReady={cvReady}
              exporting={exporting}
              onBack={() => setCurrentStep(3)}
              onProcess={processAllImages}
              onDownloadSingle={downloadSingle}
              onDownloadAll={exportAsZip}
              onRemoveImage={removeImage}
            />
          )}
        </div>
      </CropperTemplateProvider>
    </PageLayout>
  );
}
