
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Contact, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
    onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
    const [isClicked, setIsClicked] = useState(false);

    // Fade out the main text content
    const contentVariants = {
        initial: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    // Expand the button to fill the screen
    const buttonWrapperVariants = {
        initial: { scale: 1 },
        animate: { 
            scale: 60, // A large value to cover the screen
            transition: { duration: 0.6, ease: [0.7, 0, 0.3, 1] }
        }
    };

    // Fade out the button's text and icon
    const buttonContentVariants = {
        initial: { opacity: 1 },
        animate: { opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } }
    };

    const handleGetStartedClick = () => {
        setIsClicked(true);
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-secondary overflow-hidden">
            <div className="flex flex-col items-center justify-center text-center p-4">
                
                <AnimatePresence>
                    {!isClicked && (
                        <motion.div
                            key="welcome-content"
                            variants={contentVariants}
                            initial="initial"
                            animate="initial"
                            exit="exit"
                            className="flex flex-col items-center"
                        >
                            <div className="mb-8 w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl border border-primary/20">
                                <Contact className="w-8 h-8" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                                Welcome to Cardify
                            </h1>
                            <p className="max-w-md text-base md:text-lg text-muted-foreground mb-10">
                                Start building your professional digital card. Let’s create your first card and grow your connections.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    key="action-button"
                    variants={buttonWrapperVariants}
                    initial="initial"
                    animate={isClicked ? 'animate' : 'initial'}
                    onAnimationComplete={() => {
                        if (isClicked) {
                            // Delay the state change to allow the animation to finish painting smoothly
                            setTimeout(onGetStarted, 50);
                        }
                    }}
                    className="bg-secondary rounded-lg"
                >
                    <Button 
                        size="lg" 
                        variant={isClicked ? 'ghost' : 'outline'}
                        onClick={handleGetStartedClick} 
                        className="group bg-transparent" 
                        disabled={isClicked}
                    >
                        <motion.div
                            className="flex items-center gap-2"
                            variants={buttonContentVariants}
                            animate={isClicked ? 'animate' : 'initial'}
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                        </motion.div>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
