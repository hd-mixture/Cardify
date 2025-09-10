
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CardData, defaultCardData, VCardDetails } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { generateVcf } from '@/lib/vcf';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { WelcomeScreen } from '@/components/welcome-screen';
import { OnboardingTour } from '@/components/onboarding-tour';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DesktopApp } from '@/components/desktop-app';
import { MobileApp } from '@/components/mobile-app';
import AuthGuard from '@/components/auth-guard';
import { useAuth } from '@/context/auth-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { debounce } from 'lodash';
import Cookies from 'js-cookie';
import Head from 'next/head';

type AppState = 'loading' | 'welcoming' | 'onboarding' | 'ready';

function HomePageContent() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [cardData, setCardData] = useState<CardData>(defaultCardData);
  const [dataVersion, setDataVersion] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFeedbackPopupOpen, setFeedbackPopupOpen] = useState(false);
  const [isVCardDialogOpen, setVCardDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<false | 'png' | 'pdf'>(false);
  const { toast } = useToast();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { user, loading: authLoading } = useAuth();
  const hasLoadedFirestoreData = useRef(false);
  
  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (dataToSave: CardData, userId: string) => {
      try {
        const cardDocRef = doc(db, 'cards', userId);
        // Create a deep copy and remove undefined fields before saving
        const sanitizedData = JSON.parse(JSON.stringify(dataToSave), (key, value) => 
            value === undefined ? null : value
        );
        await setDoc(cardDocRef, sanitizedData);
      } catch (error) {
        console.error("Error saving card data: ", error);
        toast({
            title: "Save Failed",
            description: "Could not save card changes.",
            variant: "error",
        });
      }
    }, 1000), // 1 second delay
    []
  );

  // Effect to load data from Firestore and determine app state
  useEffect(() => {
    const loadDataAndSetState = async () => {
      if (user) {
        // Mark user as visited if not already
        if (!Cookies.get('cardify_visited')) {
            Cookies.set('cardify_visited', 'true', { expires: 365 });
        }

        // This is a new user if metadata creation and last sign-in times are very close
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
        
        if (isNewUser) {
            const welcomeCompleted = localStorage.getItem('cardify_welcome_completed') === 'true';
            if (!welcomeCompleted) {
                setAppState('welcoming');
                return;
            }

            const onboardingCompleted = localStorage.getItem('cardify_onboarding_completed') === 'true';
            if (!onboardingCompleted) {
                setAppState('onboarding');
                return;
            }
        }
        
        // Existing user or new user who finished onboarding, load their data
        if (!hasLoadedFirestoreData.current) {
            const cardDocRef = doc(db, 'cards', user.uid);
            const docSnap = await getDoc(cardDocRef);
            if (docSnap.exists()) {
                setCardData(docSnap.data() as CardData);
            }
            hasLoadedFirestoreData.current = true;
        }
        setAppState('ready');

      } else {
        // This case should ideally not be hit for this page due to AuthGuard,
        // but as a fallback, we keep it in a loading state.
        setAppState('loading'); 
      }
    };
    
    if (!authLoading) {
      loadDataAndSetState();
    }
  }, [user, authLoading]);
  
  // Effect to save data to Firestore
  useEffect(() => {
    if (user && hasLoadedFirestoreData.current) { // Only save after initial load
        debouncedSave(cardData, user.uid);
    }
    // Cleanup the debounced function on unmount
    return () => debouncedSave.cancel();
  }, [cardData, user, debouncedSave]);

  useEffect(() => {
    const body = document.body;
    if (appState !== 'ready') {
        body.style.overflow = 'hidden';
    } else {
        if (!isDesktop) {
            body.style.overflow = 'auto'; // allow mobile to scroll a bit
        } else {
            body.style.overflow = ''; // default desktop behavior
        }
    }

    return () => {
        body.style.overflow = '';
    };
  }, [appState, isDesktop]);

  useEffect(() => {
    if (cardData.fontFamily && cardData.fontFamily !== 'Inter') {
      const fontId = `font-link-${cardData.fontFamily.replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.href = `https://fonts.googleapis.com/css2?family=${cardData.fontFamily.replace(/ /g, "+")}&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    }
  }, [cardData.fontFamily]);
  
  const handleWelcomeComplete = () => {
    localStorage.setItem('cardify_welcome_completed', 'true');
    setAppState('onboarding');
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('cardify_onboarding_completed', 'true');
    setAppState('ready');
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('cardify_onboarding_completed', 'true');
    setAppState('ready');
  };
  
  const handleVCardSubmit = (details: VCardDetails) => {
    const newCardData = { ...cardData };
    
    newCardData.vCardDetails = details;
    newCardData.contactPersonName = `${details.firstName || ''} ${details.lastName || ''}`.trim() || newCardData.contactPersonName;
    newCardData.designation = details.title || newCardData.designation;
    newCardData.companyName = details.company || newCardData.companyName;
    
    const workContactIndex = newCardData.contactDetails?.findIndex(cd => cd.name === 'Work') ?? -1;
    if (workContactIndex !== -1 && newCardData.contactDetails && details.phoneBusiness) {
        newCardData.contactDetails[workContactIndex].phone = details.phoneBusiness;
    }
    
    newCardData.links.email.value = details.emailBusiness || newCardData.links.email.value;
    newCardData.links.website.value = details.website || newCardData.links.website.value;

    newCardData.address = [details.street, details.city, details.zip, details.country].filter(Boolean).join(', ') || newCardData.address;

    setCardData(newCardData);
    setDataVersion(v => v + 1);
    setVCardDialogOpen(false);
    toast({
        title: 'vCard Updated',
        description: 'The details for your QR code have been saved.',
        variant: 'success'
    });
  };

  const exportCard = async (format: 'png' | 'pdf') => {
    if (!cardData.companyName.trim() && !cardData.contactPersonName.trim()) {
      toast({
        variant: "error",
        title: "Error!",
        description: "Please fill in some details before downloading.",
      });
      return;
    }
    
    if (!cardRef.current) return;

    // Set exporting state and wait for re-render
    setIsExporting(format);
    
    // A short delay to allow the DOM to update before capturing
    await new Promise(resolve => setTimeout(resolve, 50));

    const sanitizedCompanyName = cardData.companyName.trim()
      ? cardData.companyName.trim().toLowerCase().replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')
      : 'visiting_card';
    
    const fileName = `${sanitizedCompanyName}_visiting_card`;

    const cardElement = cardRef.current;
    const canvas = await html2canvas(cardElement, {
      scale: 6,
      useCORS: true,
      backgroundColor: null,
    });

    if (format === 'png') {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = 1050;
      const pdfHeight = 600;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [pdfWidth, pdfHeight],
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const cardRect = cardElement.getBoundingClientRect();
      const scaleX = pdfWidth / cardRect.width;
      const scaleY = pdfHeight / cardRect.height;

      const qrWrapper = cardElement.querySelector<HTMLElement>('[data-qr-code-wrapper="true"]');
      if (qrWrapper && cardData.qrCodeContent === 'vcf') {
          const vcfString = generateVcf(cardData);
          if (vcfString) {
            const vcfDataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcfString)}`;
            const linkRect = qrWrapper.getBoundingClientRect();
            const x = (linkRect.left - cardRect.left) * scaleX;
            const y = (linkRect.top - cardRect.top) * scaleY;
            const w = linkRect.width * scaleX;
            const h = linkRect.height * scaleY;
            pdf.link(x, y, w, h, { url: vcfDataUri });
          }
      }
      
      if (cardData.links.workGallery.enabled && cardData.links.workGallery.images && cardData.links.workGallery.images.length > 0) {
        const galleryTrigger = cardElement.querySelector<HTMLElement>('[data-gallery-trigger="true"]');
        if (galleryTrigger) {
          const imagesParam = cardData.links.workGallery.images.map(img => encodeURIComponent(img)).join(',');
          const logoParam = cardData.companyLogo ? `&logo=${encodeURIComponent(cardData.companyLogo)}` : '';
          const href = `${window.location.origin}/gallery?images=${imagesParam}${logoParam}`;
          const linkRect = galleryTrigger.getBoundingClientRect();
          const x = (linkRect.left - cardRect.left) * scaleX;
          const y = (linkRect.top - cardRect.top) * scaleY;
          const w = linkRect.width * scaleX;
          const h = linkRect.height * scaleY;
          pdf.link(x, y, w, h, { url: href });
        }
      } else if (cardData.links.workGallery.enabled && cardData.links.workGallery.value) {
        const galleryTrigger = cardElement.querySelector<HTMLElement>('[data-gallery-trigger="true"]');
        if (galleryTrigger) {
          const href = cardData.links.workGallery.value;
          const linkRect = galleryTrigger.getBoundingClientRect();
          const x = (linkRect.left - cardRect.left) * scaleX;
          const y = (linkRect.top - cardRect.top) * scaleY;
          const w = linkRect.width * scaleX;
          const h = linkRect.height * scaleY;
          pdf.link(x, y, w, h, { url: href });
        }
      }

      const linkElements: NodeListOf<HTMLAnchorElement> = cardElement.querySelectorAll('a[href]:not([href="#"])');

      linkElements.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
          const linkRect = link.getBoundingClientRect();
          const x = (linkRect.left - cardRect.left) * scaleX;
          const y = (linkRect.top - cardRect.top) * scaleY;
          const w = linkRect.width * scaleX;
          const h = linkRect.height * scaleY;
          pdf.link(x, y, w, h, { url: href });
        }
      });

      pdf.save(`${fileName}.pdf`);
    }

    // Reset exporting state
    setIsExporting(false);
    setFeedbackPopupOpen(true);
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Cardify",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "An AI-powered online visiting card maker that allows you to create and download professional digital business cards for free.",
    "operatingSystem": "Web",
    "softwareVersion": "1.0",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "250"
    }
  };

  const renderContent = () => {
    if (authLoading || appState === 'loading') {
      return <SkeletonLoader />;
    }

    switch (appState) {
      case 'welcoming':
        return <WelcomeScreen onGetStarted={handleWelcomeComplete} />;
      case 'onboarding':
        return <OnboardingTour onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />;
      case 'ready':
        if (isDesktop) {
          return (
            <DesktopApp
              cardData={cardData}
              setCardData={setCardData}
              dataVersion={dataVersion}
              isVCardDialogOpen={isVCardDialogOpen}
              setVCardDialogOpen={setVCardDialogOpen}
              handleVCardSubmit={handleVCardSubmit}
              exportCard={exportCard}
              isFeedbackPopupOpen={isFeedbackPopupOpen}
              setFeedbackPopupOpen={setFeedbackPopupOpen}
              cardRef={cardRef}
              isExporting={isExporting}
            />
          );
        }
        return (
          <MobileApp
            cardData={cardData}
            setCardData={setCardData}
            dataVersion={dataVersion}
            isVCardDialogOpen={isVCardDialogOpen}
            setVCardDialogOpen={setVCardDialogOpen}
            handleVCardSubmit={handleVCardSubmit}
            exportCard={exportCard}
            isFeedbackPopupOpen={isFeedbackPopupOpen}
            setFeedbackPopupOpen={setFeedbackPopupOpen}
            cardRef={cardRef}
            isExporting={isExporting}
          />
        );
      default:
        return <SkeletonLoader />;
    }
  };

  return (
    <>
      <Head>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
      <div className="relative h-screen w-screen bg-secondary">
        <AnimatePresence mode="wait">
          <motion.div
            key={appState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
          >
              {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default function Home() {
    return (
        <AuthGuard>
            <HomePageContent />
        </AuthGuard>
    )
}
