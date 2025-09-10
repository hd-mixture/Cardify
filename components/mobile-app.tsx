
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Eye } from 'lucide-react';
import Confetti from 'react-confetti';
import type { CardData, VCardDetails } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

const CardForm = dynamic(() => import('@/components/card-form'), { 
  loading: () => <Skeleton className="w-full h-full" />,
  ssr: false
});
const CardPreview = dynamic(() => import('@/components/card-preview'));
const VCardDialog = dynamic(() => import('@/components/vcard-dialog').then(mod => mod.VCardDialog));
const FeedbackPopup = dynamic(() => import('@/components/feedback-popup').then(mod => mod.FeedbackPopup));
const AppHeader = dynamic(() => import('./header').then(mod => mod.AppHeader));
const GestureOnboarding = dynamic(() => import('./gesture-onboarding').then(mod => mod.GestureOnboarding));


type MobileView = 'form' | 'preview';

interface MobileAppProps {
  cardData: CardData;
  setCardData: (data: CardData) => void;
  dataVersion: number;
  isVCardDialogOpen: boolean;
  setVCardDialogOpen: (isOpen: boolean) => void;
  handleVCardSubmit: (details: VCardDetails) => void;
  exportCard: (format: 'png' | 'pdf') => void;
  isFeedbackPopupOpen: boolean;
  setFeedbackPopupOpen: (isOpen: boolean) => void;
  cardRef: React.RefObject<HTMLDivElement>;
  isExporting: false | 'png' | 'pdf';
}

export function MobileApp({
  cardData,
  setCardData,
  dataVersion,
  isVCardDialogOpen,
  setVCardDialogOpen,
  handleVCardSubmit,
  exportCard,
  isFeedbackPopupOpen,
  setFeedbackPopupOpen,
  cardRef,
  isExporting,
}: MobileAppProps) {
  const [currentView, setCurrentView] = useState<MobileView>('form');
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormInteracted, setIsFormInteracted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [confettiSource, setConfettiSource] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [showGestureOnboarding, setShowGestureOnboarding] = useState(false);

  useEffect(() => {
      const onboardingShown = localStorage.getItem('cardify_gesture_onboarding_shown') === 'true';
      const onboardingCompleted = localStorage.getItem('cardify_onboarding_completed') === 'true';

      if (!onboardingShown && onboardingCompleted) {
        // Show onboarding if the main tour is done but gestures haven't been shown
        setTimeout(() => setShowGestureOnboarding(true), 500);
      }
  }, []);

  const handleDismissGestureOnboarding = () => {
      setShowGestureOnboarding(false);
      localStorage.setItem('cardify_gesture_onboarding_shown', 'true');
  };

  useEffect(() => {
    const calculateDimensions = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        // The ref for the final card preview is inside CardForm, so we target it when step is 5
        const finalPreviewCard = document.getElementById('final-preview-card');
        if (finalPreviewCard) {
            const rect = finalPreviewCard.getBoundingClientRect();
            setConfettiSource({
                x: rect.left,
                y: rect.top,
                w: rect.width,
                h: rect.height,
            });
        }
    };

    const timer = setTimeout(calculateDimensions, 100);
    window.addEventListener('resize', calculateDimensions);
    
    // Recalculate when step changes to 5
    if (currentStep === 5) {
      setTimeout(calculateDimensions, 100); // give it time to render
    }
    
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculateDimensions);
    };
  }, [currentStep]);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    if (step === 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    }
  };
  
  const handleFormChange = (data: CardData) => {
    setCardData(data);
    if (!isFormInteracted) {
        setIsFormInteracted(true);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const direction = currentView === 'form' ? -1 : 1;

  return (
    <>
      <Suspense>
        <GestureOnboarding show={showGestureOnboarding} onDismiss={handleDismissGestureOnboarding} />
      </Suspense>
      {showConfetti && confettiSource && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          initialVelocityX={{ min: -15, max: 15 }}
          initialVelocityY={{ min: -20, max: -10 }}
          confettiSource={confettiSource}
        />
      )}
      <div className="h-screen w-screen bg-background flex flex-col">
        <Suspense>
          <AppHeader />
        </Suspense>

        <div className="flex-grow min-h-0 relative overflow-hidden">
          <AnimatePresence initial={false}>
              <motion.div
                  key="form-view-wrapper"
                  initial={{ y: 0 }}
                  animate={{ y: 0 }}
                  className="h-full w-full"
              >
                  <AnimatePresence initial={false} custom={direction}>
                      <motion.div
                          key={currentView}
                          custom={direction}
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                          className="absolute inset-0"
                      >
                          {currentView === 'form' ? (
                            <Suspense fallback={<Skeleton className="w-full h-full p-4 space-y-4">
                              <Skeleton className="h-8 w-1/3" /> <Skeleton className="h-10 w-full" />
                              <Skeleton className="h-8 w-1/3" /> <Skeleton className="h-10 w-full" />
                            </Skeleton>}>
                              <CardForm
                                  isMobile={true}
                                  data={cardData}
                                  onFormChange={handleFormChange}
                                  onOpenVCardDialog={() => setVCardDialogOpen(true)}
                                  onDownload={exportCard}
                                  currentStep={currentStep}
                                  onStepChange={handleStepChange}
                                  cardRef={cardRef}
                                  dataVersion={dataVersion}
                              />
                            </Suspense>
                          ) : (
                          <div className="h-full flex flex-col items-center justify-center p-4 bg-secondary">
                               <p className="text-muted-foreground mb-4 flex items-center gap-2">
                                  <Eye size={16} />
                                  Live Preview
                              </p>
                              <div ref={previewContainerRef} className="relative w-full max-w-md shadow-2xl rounded-2xl overflow-hidden">
                                  <div className={cn(
                                      "absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl",
                                      "transition-opacity duration-700",
                                      isFormInteracted ? "opacity-100" : "opacity-0"
                                  )}>
                                      <div className="absolute inset-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent skew-y-[-45deg]" />
                                  </div>
                                  <Suspense fallback={<Skeleton className="w-full aspect-[1050/600]" />}>
                                    <CardPreview cardData={cardData} ref={cardRef} isExporting={isExporting} />
                                  </Suspense>
                              </div>
                          </div>
                          )}
                      </motion.div>
                  </AnimatePresence>
              </motion.div>
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
        {currentStep !== 5 && (
          <div className="fixed bottom-8 inset-x-0 z-50 flex justify-center pointer-events-none">
            <motion.div
              className="pointer-events-auto"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
                <div className="flex items-center p-1 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border">
                    {/* Form Button */}
                    <button
                        onClick={() => setCurrentView('form')}
                        className="relative flex items-center justify-center gap-2 px-6 py-2 rounded-full transition-colors"
                    >
                        {currentView === 'form' && (
                            <motion.div
                                layoutId="mobile-nav-indicator"
                                className="absolute inset-0 bg-muted rounded-full"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <Edit className={cn("relative z-10 h-5 w-5", currentView === 'form' ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn("relative z-10 text-sm font-semibold", currentView === 'form' ? 'text-primary' : 'text-muted-foreground')}>
                            Form
                        </span>
                    </button>
                    {/* Preview Button */}
                    <button
                        onClick={() => setCurrentView('preview')}
                        className="relative flex items-center justify-center gap-2 px-6 py-2 rounded-full transition-colors"
                    >
                        {currentView === 'preview' && (
                            <motion.div
                                layoutId="mobile-nav-indicator"
                                className="absolute inset-0 bg-muted rounded-full"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <Eye className={cn("relative z-10 h-5 w-5", currentView === 'preview' ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn("relative z-10 text-sm font-semibold", currentView === 'preview' ? 'text-primary' : 'text-muted-foreground')}>
                            Preview
                        </span>
                    </button>
                </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>
        
        <Suspense>
          <FeedbackPopup
            isOpen={isFeedbackPopupOpen}
            onClose={() => setFeedbackPopupOpen(false)}
            cardData={cardData}
            serviceId={process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID}
            templateId={process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID}
            publicKey={process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY}
          />
        </Suspense>
        <Suspense>
          <VCardDialog
            isOpen={isVCardDialogOpen}
            onClose={() => setVCardDialogOpen(false)}
            onSubmit={handleVCardSubmit}
            initialData={cardData.vCardDetails}
          />
        </Suspense>
      </div>
    </>
  );
}
