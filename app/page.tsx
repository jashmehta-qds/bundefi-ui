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
import { Suspense, useState } from 'react';

// Dynamically import heavy components
const HeroScrollStory = dynamic(() => import("@/components/shared/animations/HeroScrollStory"), {
  loading: () => <div className="min-h-screen flex items-center justify-center">
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <HeroScrollStory />
        </section>

        {/* Powered By Section */}
        <section className="py-12 bg-gray-100 border-t border-gray-200 ">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500  mb-6">
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
                    <div className="font-semibold text-gray-900 text-2xl">
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
                    <div className="font-semibold text-gray-900  text-2xl">
                      Enso
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <Suspense fallback={<div className="animate-pulse bg-gray-100 h-96" />}>
          <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 ">
                  DeFi made simple
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-100 ">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Get started in minutes
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience seamless cross-chain DeFi with our intuitive platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                Start Your DeFi Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        {/* <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Built for every DeFi user
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Whether you're new to DeFi or a seasoned pro, our platform
                adapts to your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {useCases.map((useCase, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      {useCase.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {useCase.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {useCase.examples.map((example, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* FAQ */}
        <section className="py-20 bg-white dark:bg-[#1A1A1A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently asked questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Everything you need to know about BunDefi
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1A1A1A]">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-primary">
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
              className="bg-white text-primary hover:bg-gray-50 px-8"
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
        src="/chainlink-blue.svg"
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
    icon: <Layers className="h-6 w-6 text-indigo-600" />,
    title: "Intelligent Routing",
    description:
      "Enso's routing engine finds the best paths across 200+ protocols for optimal yields and lowest fees.",
    lottie: "/lotties/routing.lottie",
    },
  {
    icon: <Shield className="h-6 w-6 text-indigo-600" />,
    title: "Non-Custodial Security",
    description:
      "Your funds stay in your wallet. We never have access to your assets, ensuring complete security.",
      lottie: "/lotties/security.lottie",
    },
  {
    icon: <Workflow className="h-6 w-6 text-indigo-600" />,
    title: "DeFi Automation",
    description:
      "Set up automated strategies with our visual builder to optimize your yields without constant monitoring.",
  },
  {
    icon: <LineChart className="h-6 w-6 text-indigo-600" />,
    title: "Unified Dashboard",
    description:
      "Track all your positions, yields, and transactions across chains from one comprehensive interface.",
  },
  {
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    title: "Community Insights",
    description:
      "Access strategies and insights from our community of cross-chain DeFi enthusiasts.",
  },
];

const useCases = [
  {
    icon: <Clock className="h-6 w-6 text-indigo-600" />,
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
    icon: <Zap className="h-6 w-6 text-indigo-600" />,
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
    icon: <Brain className="h-6 w-6 text-indigo-600" />,
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
      className="group relative cursor-pointer rounded-[32px] overflow-hidden min-h-[300px] bg-gradient-to-br from-primary/10 to-primary/10 hover:from-primary/20 hover:to-primary/20 transition-all duration-300 border border-gray-200"
    >
      <div className="relative z-10 p-8 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-12 h-12 bg-gray-100 border-2 border-primary rounded-lg flex items-center justify-center">
            {feature.icon}
          </div>
          <span className="text-primary text-xl font-medium">
            {feature.title}
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed text-lg">
          {feature.description}
        </p>
        <div className="mt-auto pt-6">
          <div className="flex items-center text-primary transition-opacity duration-300">
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
