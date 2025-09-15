"use client"
import {
  ArrowRight,
  Brain,
  Clock,
  Layers,
  LineChart,
  Shield,
  Users,
  Workflow,
  Zap
} from "lucide-react";
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect, useMemo } from 'react';

// Dynamically import heavy components
const HeroLanding = dynamic(() => import("@/components/shared/animations/HeroLanding"), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
    <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full" />
  </div>
});

const DotLottiePlayer = dynamic(() => import("@lottiefiles/dotlottie-react").then(mod => mod.DotLottieReact), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg w-[200px] h-[200px]" />
});

import { SiteFooter } from "@/components/shared/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Image from "next/image";

// Simple loading screen component - no dynamic import to prevent flash
function SimpleLoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const startTime = Date.now()
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 100)
        
        if (newProgress >= 100) {
          clearInterval(interval)
          
          // Ensure minimum duration
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, 2000 - elapsed)
          
          setTimeout(() => {
            setIsComplete(true)
            setTimeout(onComplete, 500) // Fade out delay
          }, remaining)
        }
        
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [onComplete])

  // Pre-generate particle positions only on client
  const particles = useMemo(() => {
    if (!isClient) return []
    
    return [...Array(10)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
    }))
  }, [isClient])

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-gray-50 via-white to-gray-50 transition-opacity duration-500 ${
      isComplete ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-400/10 to-primary-500/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.05),transparent_50%)] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Zap className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          <span className="text-gray-900">
            BunDefi
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
          Loading cross-chain DeFi protocol...
        </p>

        {/* Progress bar */}
        <div className="w-64 md:w-80 bg-primary-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress text */}
        <p className="text-gray-500 text-sm">
          {Math.round(progress)}% complete
        </p>

        {/* Loading dots */}
        <div className="flex space-x-1 mt-4">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Floating particles - only render on client */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-primary-500/20 rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white">
      {/* Loading Screen - rendered immediately */}
      {isLoading && (
        <SimpleLoadingScreen onComplete={handleLoadingComplete} />
      )}

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600">
          <div className="animate-pulse bg-primary-500 rounded-lg w-full h-full" />
        </div>}>
          <HeroLanding />
        </Suspense>

        {/* Powered By Section */}
        <section className="py-12 bg-slate-700 border-t border-primary-500/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-300 mb-6">
                Powered by industry-leading infrastructure
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
                    <Image
                      src="/chainlink-blue.svg"
                      alt="Chainlink CCIP"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-2xl">
                      Chainlink
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 bg-transparent rounded-lg flex items-center justify-center">
                    <Image
                      src="/enso-multicolor.png"
                      alt="Enso Build"
                      width={56}
                      height={56}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-2xl">
                      Enso
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <Suspense fallback={<div className="animate-pulse bg-primary-500 h-96" />}>
          <section id="features" className="py-20 bg-primary-500">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white">
                  DeFi made simple
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Everything you need assembled in one powerful interface
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>
            </div>
          </section>
        </Suspense>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Frequently asked questions
              </h2>
              <p className="text-4xl font-bold text-primary-500">
                Everything you need to know about BunDefi
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-primary-500/50 bg-primary-500">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to experience cross-chain DeFi?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already navigating DeFi seamlessly
              across all chains.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary-600 hover:bg-gray-50 px-8"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

const features = [
  {
    icon: (
      <Image
        src="/chainlink-white.svg"
        alt="Chainlink CCIP"
        width={24}
        height={24}
      />
    ),
    title: "Cross-Chain Navigation",
    description:
      "Seamlessly move assets and strategies across 15+ blockchains with Chainlink CCIP's secure infrastructure.",
      lottie: "/lotties/network.lottie",
    },
  {
    icon: <Layers className="h-6 w-6 text-primary-600" />,
    title: "Intelligent Routing",
    description:
      "Enso's routing engine finds the best paths across 200+ protocols for optimal yields and lowest fees.",
    lottie: "/lotties/routing.lottie",
    },
  {
    icon: <Shield className="h-6 w-6 text-primary-600" />,
    title: "Non-Custodial Security",
    description:
      "Your funds stay in your wallet. We never have access to your assets, ensuring complete security.",
      lottie: "/lotties/security.lottie",
    },
  {
    icon: <Workflow className="h-6 w-6 text-primary-600" />,
    title: "DeFi Automation",
    description:
      "Set up automated strategies with our visual builder to optimize your yields without constant monitoring.",
  },
  {
    icon: <LineChart className="h-6 w-6 text-primary-600" />,
    title: "Unified Dashboard",
    description:
      "Track all your positions, yields, and transactions across chains from one comprehensive interface.",
  },
  {
    icon: <Users className="h-6 w-6 text-primary-600" />,
    title: "Community Insights",
    description:
      "Access strategies and insights from our community of cross-chain DeFi enthusiasts.",
  },
];

const useCases = [
  {
    icon: <Clock className="h-6 w-6 text-primary-600" />,
    title: "Yield Optimization",
    description:
      "Maximize returns by accessing the best opportunities across all chains.",
    examples: [
      "Cross-chain yield farming",
      "Automated rebalancing",
      "Risk-adjusted strategies",
      "Liquidity provision",
    ],
  },
  {
    icon: <Zap className="h-6 w-6 text-primary-600" />,
    title: "Portfolio Management",
    description:
      "Manage your entire DeFi portfolio from one unified interface.",
    examples: [
      "Multi-chain tracking",
      "Asset allocation",
      "Performance analytics",
      "Risk monitoring",
    ],
  },
  {
    icon: <Brain className="h-6 w-6 text-primary-600" />,
    title: "Protocol Integration",
    description:
      "Interact with hundreds of protocols without switching interfaces.",
    examples: [
      "DEX aggregation",
      "Lending platforms",
      "Staking services",
      "Bridge protocols",
    ],
  },
];

const steps = [
  {
    title: "Connect Wallet",
    description:
      "Link your Web3 wallet to access cross-chain DeFi opportunities.",
  },
  {
    title: "Select Asset",
    description:
      "Select assets to optimize across 5+ networks",
  },
  {
    title: "Explore Protocols",
    description: "Browse and interact with 50+ integrated DeFi protocols.",
  },
  {
    title: "Optimize & Earn",
    description:
      "Let our routing find the best opportunities and start earning.",
  },
];


const faqs = [
  {
    question: "How does cross-chain functionality work?",
    answer:
      "BunDefi uses Chainlink CCIP for secure cross-chain messaging and Enso's routing infrastructure to find optimal paths across chains. This allows you to move assets and execute strategies seamlessly across 15+ blockchains.",
  },
  {
    question: "Is my money safe when moving across chains?",
    answer:
      "Yes, BunDefi is completely non-custodial and uses industry-leading security infrastructure. Chainlink CCIP provides secure cross-chain messaging, and your funds never leave your control.",
  },
  {
    question: "Do I need to understand different blockchains?",
    answer:
      "Not at all! Our unified interface abstracts away the complexity of different chains. You can access opportunities across all supported blockchains through one simple dashboard.",
  },
  {
    question: "What protocols can I access?",
    answer:
      "BunDefi integrates with 200+ DeFi protocols across 15+ chains, including major DEXs, lending platforms, yield farms, and staking services. Our routing engine automatically finds the best opportunities.",
  },
  {
    question: "How do I track my cross-chain positions?",
    answer:
      "Our unified dashboard provides a comprehensive view of all your positions, yields, and transactions across chains. You can monitor performance and manage your entire DeFi portfolio from one interface.",
  },
];

// Feature component with error handling
function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const [lottieError, setLottieError] = useState(false);

  const handleLottieError = () => {
    console.warn(`Lottie animation failed to load for feature: ${feature.title}`);
    setLottieError(true);
  };

  // Safe Lottie component for features
  const SafeLottiePlayer = ({ src, style }: { src: string; style: React.CSSProperties }) => {
    if (lottieError) {
      return null; // Don't show anything if Lottie fails for features
    }

    return (
      <DotLottiePlayer
        autoplay={true}
        loop
        src={src}
        style={style}
        onError={handleLottieError}
      />
    );
  };

  return (
    <div
      className="group relative cursor-pointer rounded-[32px] overflow-hidden min-h-[300px] bg-white/90 backdrop-blur-sm transition-all duration-300 border border-2 border-primary-200 shadow-lg hover:shadow-xl"
    >
      <div className="relative z-10 p-8 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-12 h-12 bg-primary-100 border-2 border-primary-300 rounded-lg flex items-center justify-center">
            {feature.icon}
          </div>
          <span className="text-secondary-900 text-xl font-medium">
            {feature.title}
          </span>
        </div>
        <p className="text-secondary-600 leading-relaxed text-lg">
          {feature.description}
        </p>
        <div className="mt-auto pt-6">
          <div className="flex items-center text-primary-500 transition-opacity duration-300">
            {!feature.lottie && <span className="font-medium">Coming Soon...</span>}
          </div>
        </div>
      </div>
      {feature.lottie && (
        <div className="absolute -bottom-10 -right-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <SafeLottiePlayer
            src={feature.lottie}
            style={{ height: "200px", width: "200px" }}
          />
        </div>
      )}
    </div>
  );
}
