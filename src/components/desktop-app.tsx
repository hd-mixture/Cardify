
"use client";

import React, { useRef, useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Smartphone } from 'lucide-react';
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
const AppHeader = dynamic(() => import('@/components/header').then(mod => mod.AppHeader));


interface DesktopAppProps {
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

export function DesktopApp({
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
}: DesktopAppProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [confettiSource, setConfettiSource] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isFormInteracted, setIsFormInteracted] = useState(false);

  useEffect(() => {
    const calculateDimensions = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        if (previewContainerRef.current) {
            const rect = previewContainerRef.current.getBoundingClientRect();
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
    
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculateDimensions);
    };
  }, []);

  const handleStepChange = (step: number) => {
    if (step === 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    }
    setCurrentStep(step);
  };

  const handleFormChange = (data: CardData) => {
    setCardData(data);
    if (!isFormInteracted) {
        setIsFormInteracted(true);
    }
  };

  return (
    <>
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
      <main className="min-h-screen bg-secondary lg:grid lg:grid-cols-5 lg:h-screen">
        <div className="bg-background lg:col-span-2 lg:flex lg:flex-col lg:h-screen">
          <Suspense>
            <AppHeader />
          </Suspense>

          <div className="flex-grow min-h-0 relative">
            <Suspense fallback={<Skeleton className="w-full h-full p-6 space-y-4">
              <Skeleton className="h-8 w-1/3" /> <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-1/3" /> <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-1/3" /> <Skeleton className="h-24 w-full" />
            </Skeleton>}>
              <CardForm
                isMobile={false}
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
          </div>
        </div>

        <div className="hidden lg:col-span-3 lg:flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 overflow-hidden bg-secondary">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            <p className="text-muted-foreground mb-4 flex items-center gap-2">
              <Smartphone size={16} />
              Live Preview
            </p>
            <motion.div
              ref={previewContainerRef}
              className="relative w-full shadow-2xl rounded-2xl overflow-hidden"
              animate={{ scale: currentStep === 5 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={cn(
                "absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl",
                "transition-opacity duration-700",
                (isFormInteracted) ? "opacity-100" : "opacity-0",
                currentStep === 5 && 'hidden'
              )}>
                <div className="absolute inset-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent skew-y-[-45deg]" />
              </div>

              {currentStep === 5 && (
                <div className="absolute inset-0 z-20 rounded-2xl pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-white/10" />
              )}
              <Suspense fallback={<Skeleton className="w-full aspect-[1050/600]" />}>
                <CardPreview cardData={cardData} ref={cardRef} isExporting={isExporting} />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </main>
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
    </>
  );
}
