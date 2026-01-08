import { useState, useEffect } from 'react';
import { copy } from '../constants/copy';
import { getCurrentUser } from '../db';

const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && user) {
      setIsOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const steps = [
    copy.onboarding.step1,
    user?.role === 'teacher' ? copy.onboarding.step2Teacher : copy.onboarding.step2Student,
    copy.onboarding.step3
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="text-6xl mb-4">{currentStepData.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {currentStepData.body}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Don't show again checkbox */}
          {currentStep === 2 && (
            <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-600">{copy.onboarding.dontShowAgain}</span>
            </label>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep < 2 && (
              <button
                onClick={handleSkip}
                className="flex-1 btn btn-secondary"
              >
                {copy.onboarding.skip}
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 btn btn-primary"
            >
              {currentStep === 2 ? copy.onboarding.getStarted : copy.onboarding.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
