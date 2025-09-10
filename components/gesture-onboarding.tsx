
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { cn } from '@/lib/utils';

const Hint = ({
    children,
    className,
    delay = 0.2
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay } }}
        exit={{ opacity: 0, y: 10 }}
        className={cn("absolute flex flex-col items-center gap-2 text-white font-medium text-center drop-shadow-lg text-sm", className)}
    >
        {children}
    </motion.div>
);

interface GestureOnboardingProps {
  show: boolean;
  onDismiss: () => void;
}

export function GestureOnboarding({ show, onDismiss }: GestureOnboardingProps) {
  return (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onDismiss}
                className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm cursor-pointer"
            >
                {/* Swipe Right Hint */}
                <Hint
                    className="top-1/3 left-4 -translate-y-1/2"
                    delay={0.3}
                >
                    <div className="w-24 h-24 filter invert">
                        <DotLottieReact
                          src="https://lottie.host/4808c351-147b-40c7-ae75-1d404f0cea4a/jsNjUWe8Ey.lottie"
                          loop
                          autoplay
                        />
                    </div>
                    <p className="leading-tight">Swipe Right<br />for Previous</p>
                </Hint>

                {/* Swipe Left Hint */}
                <Hint
                    className="top-1/3 right-4 -translate-y-1/2"
                    delay={0.4}
                >
                     <div className="w-24 h-24 filter invert">
                         <DotLottieReact
                            src="https://lottie.host/aa602448-c09d-402d-9c1b-49231ec99437/zbGGgLsBBL.lottie"
                            loop
                            autoplay
                        />
                    </div>
                    <p className="leading-tight">Swipe Left<br />for Next</p>
                </Hint>

                {/* Tap to toggle Hint */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-28 inset-x-0 flex justify-center"
                >
                    <div className="flex flex-col items-center gap-2 text-white font-medium text-center drop-shadow-lg text-sm">
                        <div className="w-24 h-24 filter invert">
                            <DotLottieReact
                                src="https://lottie.host/bf256ea9-36a8-433f-a888-7763eab229d1/5QXqDQM4Qy.lottie"
                                loop
                                autoplay
                            />
                        </div>
                        <p className="leading-tight">Tap to toggle<br />Form / Preview</p>
                    </div>
                </motion.div>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.6 } }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs"
                >
                    Tap anywhere to continue
                </motion.p>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
