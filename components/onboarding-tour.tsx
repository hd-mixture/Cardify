
"use client";

import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperCore } from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, QrCode, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

const onboardingSlides = [
    {
        icon: Palette,
        title: "Design Your Perfect Card",
        description: "Effortlessly customize colors, layouts, and logos to match your brand's unique identity.",
    },
    {
        icon: QrCode,
        title: "Instant QR Code Generation",
        description: "Create a scannable QR code that links directly to your contact details, website, or more.",
    },
    {
        icon: Share2,
        title: "Export & Share with Ease",
        description: "Download your card as a high-quality PNG or an interactive PDF, ready to impress.",
    }
];

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const swiperRef = useRef<SwiperCore | null>(null);

    const buttonWrapperVariants = {
        initial: { scale: 1 },
        animate: { 
            scale: 60,
            transition: { duration: 0.6, ease: [0.7, 0, 0.3, 1] }
        }
    };

    const buttonContentVariants = {
        initial: { opacity: 1 },
        animate: { opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } }
    };

    const handleCompleteClick = () => {
        setIsCompleting(true);
    };

    return (
        <div className="relative h-screen w-screen bg-secondary flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md h-full flex flex-col">
                {/* Swiper Container */}
                <div className="flex-grow flex items-center">
                    <Swiper
                        modules={[Pagination]}
                        spaceBetween={50}
                        slidesPerView={1}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        className="w-full"
                    >
                        {onboardingSlides.map((slide, index) => (
                            <SwiperSlide key={index} className="self-center">
                                <div className="text-center p-6">
                                    <div className="flex justify-center mb-8">
                                        <div className="w-24 h-24 bg-background rounded-3xl flex items-center justify-center shadow-lg">
                                            <slide.icon className="w-12 h-12 text-primary" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground mb-3">{slide.title}</h2>
                                    <p className="text-muted-foreground">
                                        {slide.description}
                                    </p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
                
                {/* Footer Controls */}
                <div className="py-8">
                    <div className="flex justify-center mb-6">
                        <div className="flex space-x-2">
                             {onboardingSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => swiperRef.current?.slideTo(index)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300 ease-in-out",
                                        activeIndex === index ? "w-6 bg-primary" : "w-2 bg-muted"
                                    )}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                       <AnimatePresence mode="wait">
                            {activeIndex === onboardingSlides.length - 1 ? (
                                <motion.div
                                    key="get-started"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full flex justify-center"
                                >
                                    <motion.div
                                        variants={buttonWrapperVariants}
                                        animate={isCompleting ? 'animate' : 'initial'}
                                        onAnimationComplete={() => {
                                            if (isCompleting) {
                                                setTimeout(onComplete, 50);
                                            }
                                        }}
                                        className="bg-secondary rounded-lg"
                                    >
                                        <Button
                                            size="lg"
                                            variant={isCompleting ? 'ghost' : 'default'}
                                            className="w-full max-w-xs group"
                                            onClick={handleCompleteClick}
                                            disabled={isCompleting}
                                        >
                                            <motion.div
                                                className="flex items-center gap-2"
                                                variants={buttonContentVariants}
                                                animate={isCompleting ? 'animate' : 'initial'}
                                            >
                                                Get Started
                                                <ArrowRight className="h-5 w-5 ml-2" />
                                            </motion.div>
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="next"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full flex justify-center"
                                >
                                    <Button
                                        size="lg"
                                        className="w-full max-w-xs group"
                                        onClick={() => swiperRef.current?.slideNext()}
                                    >
                                        Next
                                        <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <div className="h-10">
                            <AnimatePresence>
                                {activeIndex < onboardingSlides.length - 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="w-full max-w-xs text-muted-foreground"
                                            onClick={onSkip}
                                        >
                                            Skip for now
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
