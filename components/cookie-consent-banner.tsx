
"use client";

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cardify_cookie_consent');
    if (!consent) {
      // Use a timeout to ensure it doesn't appear jarringly on load
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Set consent cookie, expires in 1 year
    Cookies.set('cardify_cookie_consent', 'true', { expires: 365 });
    setShowBanner(false);
  };
  
  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto p-4 bg-background/80 backdrop-blur-lg rounded-xl shadow-2xl border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground text-center sm:text-left">
              🍪 This website uses cookies to enhance your experience.
            </p>
            <Button onClick={handleAccept} size="sm" className="shrink-0">
              Accept
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
