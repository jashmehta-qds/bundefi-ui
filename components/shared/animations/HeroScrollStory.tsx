"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChartArea, LucideBlocks, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const storySteps = [
  {
    text: (
      <>
        We've felt the{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          friction of DeFi
        </span>{" "}
        firsthand. <br />
        Chasing yields across chains, protocols, and tools shouldn't be such a
        pain.
      </>
    ),
  },
  {
    text: (
      <>
        <div className="pb-20 text-4xl">
          <span className="font-semibold text-gray-900 dark:text-white">
            BunDefi{" "}
          </span>
          works for you
        </div>
        <div className="text-xl">
          We help you find the best yields across chains, 
          <br />
          using automation, AI and most importantly, <br />
          <span className="font-semibold text-gray-900 dark:text-white">
            a f***king simple process
          </span>
        </div>
        <div className="flex flex-row items-center justify-center gap-4 mt-12">
                <div className="inline-flex items-center gap-2 px-2 py-2 rounded-lg bg-[#1A1A1A] border border-[#333333] text-sm font-medium text-white">
                  <ChartArea className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xl text-primary">3x</span>
                  yields
                </div>
                <div className="inline-flex items-center gap-2 px-2 py-2 rounded-lg bg-[#1A1A1A] border border-[#333333] text-sm font-medium text-white">
                  <LucideBlocks className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xl text-primary">50+</span> protocols
                </div>
                <div className="inline-flex items-center gap-2 px-2 py-2 rounded-lg bg-[#1A1A1A] border border-[#333333] text-sm font-medium text-white">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xl text-primary">+45%</span> APY
                  
                </div>
              </div>
      </>
    ),
  },
];

// Safe Lottie component with error boundary
function SafeLottieAnimation({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center`} style={style}>
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <p className="text-primary font-medium">DeFi Made Simple</p>
        </div>
      </div>
    );
  }

  return (
    <DotLottieReact
      src={src}
      autoplay={true}
      loop={true}
      className={className}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

export default function HeroScrollStory() {
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll event to change text steps only
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { top, height } = containerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      // Calculate progress (0 to 1) through the hero section
      const progress = Math.min(
        1,
        Math.max(
          0,
          (scrollY + windowHeight / 2 - containerRef.current.offsetTop) / height
        )
      );
      
      // Divide into steps
      const newStep = Math.min(
        storySteps.length - 1,
        Math.floor(progress * storySteps.length)
      );
      setStep(newStep);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #000 0%, rgba(0,4,51,0.9) 60%, #0a202e 100%)",
      }}
    >
      {/* Gradient overlay for vignette effect */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-transparent via-transparent to-gray-200/50 dark:from-transparent dark:via-transparent dark:to-gray-900/80" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-[60vh] max-w-6xl mx-auto px-4">
        {/* Text Content */}
        <div className="flex-1 flex items-center justify-center w-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center lg:text-left text-gray-600 dark:text-gray-300 text-2xl md:text-3xl font-normal max-w-2xl"
            >
              {storySteps[step].text}

             
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Lottie Animation */}
        <div className="flex-1 flex items-center justify-center lg:mt-0">
          <div className="w-full max-w-lg lg:max-w-xl">
            <SafeLottieAnimation
              src="/coins-wallet.lottie"
              className="w-full h-auto"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 tracking-widest animate-bounce">
          SCROLL ↓ DOWN
        </span>
      </div>
    </div>
  );
}
