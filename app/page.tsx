"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthPaymentModal } from '@/components/AuthPaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/hooks/usePurchase';

// Force dynamic rendering - this page cannot be statically generated
export const dynamic = 'force-dynamic';

type ModalIntent = 'signup' | 'login' | 'payment';

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { hasLifetimeAccess } = usePurchase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState<ModalIntent>('signup');

  // Add JSON-LD structured data on client-side only
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Loged.in",
      "url": "https://loged.in",
      "description": "Loged.in helps you track personal milestones, document your transformation, and share your progress with the world. Private by default, powerful when shared.",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "ratingCount": "1"
      },
      "creator": {
        "@type": "Organization",
        "name": "Doddlesoft"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.id = 'json-ld-schema';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('json-ld-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Check if we should open payment modal after OAuth redirect
  useEffect(() => {
    if (searchParams.get('show_payment') === 'true') {
      setModalIntent('payment');
      setIsModalOpen(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  const openAuthModal = (intent: ModalIntent) => {
    setModalIntent(intent);
    setIsModalOpen(true);
  };

  const handleCtaClick = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      openAuthModal('signup');
    }
  };

  const handleGetLifetimeClick = () => {
    // Scroll to pricing section
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePurchaseClick = () => {
    if (user) {
      // User is already authenticated, open payment modal directly
      setModalIntent('payment');
      setIsModalOpen(true);
    } else {
      // User needs to authenticate first
      openAuthModal('payment');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-landing-xl px-4 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-landing-hero md:text-landing-hero-lg font-semibold text-center text-slate-900 dark:text-white leading-tight"
          >
            Your Personal <span className="text-blue-500 dark:text-blue-400">Transformation</span> Portfolio
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-landing-body md:text-landing-body-lg text-slate-600 dark:text-slate-300 text-center max-w-3xl mx-auto"
          >
            Track your journey. Share your milestones. Inspire others.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-landing-lg flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button 
              onClick={handleCtaClick}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-landing-body font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {user ? 'Go to Dashboard' : 'Start for free'}
            </button>
            {!hasLifetimeAccess && (
              <button 
                onClick={handleGetLifetimeClick}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-landing-body font-semibold rounded-lg border-2 border-slate-200 dark:border-slate-600 transition-all"
              >
                Get lifetime access
              </button>
            )}
          </motion.div>

          {/* Reassurance text */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-landing-small text-slate-500 dark:text-slate-400 text-center"
          >
            Document who you&apos;re becoming — and show your progress to the world.
          </motion.p>
        </div>

        {/* Hero Visual - Device Mockups */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-landing-xl max-w-6xl mx-auto relative"
        >
          <div className="flex items-end justify-center gap-4 md:gap-6 relative">
            {/* Left Mobile */}
            <div className="w-52 md:w-72 h-[420px] md:h-[560px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-3 border-4 border-slate-700 relative z-20 translate-y-[168px] md:translate-y-[224px] translate-x-[40px] md:translate-x-[60px]">
              <div className="bg-white rounded-2xl h-full p-4 flex flex-col overflow-hidden">
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-semibold text-slate-900">9:41</div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                    <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                  </div>
                </div>
                
                {/* Milestones List */}
                <div className="flex-1 space-y-3 overflow-hidden">
                  {/* Milestone 1 */}
                  <div className="flex gap-2">
                    <div className="text-[8px] text-slate-600 w-12 text-right pt-1 shrink-0">Jan 2024</div>
                    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-lg p-2">
                      <div className="text-[8px] font-bold text-slate-900 mb-1">Started the journey</div>
                      <div className="text-[6px] text-slate-600 leading-tight">Taking the first step towards my goal. Excited for what&apos;s ahead!</div>
                    </div>
                  </div>

                  {/* Milestone 2 with Image */}
                  <div className="flex gap-2">
                    <div className="text-[8px] text-slate-600 w-12 text-right pt-1 shrink-0">Feb 2024</div>
                    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="h-16 bg-gradient-to-br from-blue-300 to-blue-400"></div>
                      <div className="p-2">
                        <div className="text-[8px] font-bold text-slate-900 mb-1">Major breakthrough</div>
                        <div className="text-[6px] text-slate-600 leading-tight">Achieved my first major milestone. The progress feels real now.</div>
                      </div>
                    </div>
                  </div>

                  {/* Milestone 3 */}
                  <div className="flex gap-2">
                    <div className="text-[8px] text-slate-600 w-12 text-right pt-1 shrink-0">Mar 2024</div>
                    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-lg p-2">
                      <div className="text-[8px] font-bold text-slate-900 mb-1">Staying consistent</div>
                      <div className="text-[6px] text-slate-600 leading-tight">Building momentum. Small steps every day are adding up.</div>
                    </div>
                  </div>

                  {/* Milestone 4 */}
                  <div className="flex gap-2">
                    <div className="text-[8px] text-slate-600 w-12 text-right pt-1 shrink-0">Apr 2024</div>
                    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-lg p-2">
                      <div className="text-[8px] font-bold text-slate-900 mb-1">New level unlocked</div>
                      <div className="text-[6px] text-slate-600 leading-tight">Reached a point I never thought possible. This journey is transforming me.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Mockup - Center */}
            <div className="w-[500px] md:w-[700px] h-[320px] md:h-[440px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-3 border-4 border-slate-700 relative z-10 translate-y-[32px] md:translate-y-[44px]">
              <div className="bg-white rounded-xl h-full flex flex-col overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center px-4 py-2 border-b border-slate-200">
                  <div className="flex gap-2 mr-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 h-5 bg-slate-100 rounded flex items-center px-2">
                    <div className="text-[6px] text-slate-400">loged.in/@username/my-journey</div>
                  </div>
                </div>

                {/* Journey Page Content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Cover Photo and Profile Section */}
                  <div className="relative">
                    {/* Cover Photo */}
                    <div className="w-full bg-gradient-to-br from-blue-400 to-purple-500 h-16"></div>

                    {/* Profile Section - Centered, overlapping cover */}
                    <div className="absolute left-0 right-0 top-10 flex flex-col items-center px-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white mb-2"></div>
                      <div className="text-[9px] font-bold text-slate-900 mb-1">My Fitness Journey</div>
                      <div className="text-[6px] text-slate-500 mb-1">From zero to marathon runner</div>
                      <div className="flex gap-1 text-[5px] text-slate-400">
                        <span>By @alex</span>
                        <span>•</span>
                        <span>12 milestones</span>
                        <span>•</span>
                        <span>Updated Nov 2024</span>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for profile overlap */}
                  <div className="h-16"></div>

                  {/* Timeline Title */}
                  <div className="px-4 mt-2 mb-2">
                    <div className="text-[8px] font-bold text-slate-900 text-center">Timeline</div>
                  </div>

                  {/* Timeline Items */}
                  <div className="px-4 space-y-2">
                    {/* Timeline Item 1 */}
                    <div className="flex gap-2">
                      <div className="text-[6px] text-slate-600 w-12 text-right pt-1">Jan 2024</div>
                      <div className="flex-1 bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-lg p-2">
                        <div className="text-[7px] font-bold text-slate-900 mb-0.5">Day One</div>
                        <div className="text-[5px] text-slate-600 leading-tight">Started running. Could barely do 1km. This is the beginning.</div>
                      </div>
                    </div>

                    {/* Timeline Item 2 with Image */}
                    <div className="flex gap-2">
                      <div className="text-[6px] text-slate-600 w-12 text-right pt-1">Mar 2024</div>
                      <div className="flex-1 bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="h-8 bg-gradient-to-br from-blue-300 to-blue-400"></div>
                        <div className="p-2">
                          <div className="text-[7px] font-bold text-slate-900 mb-0.5">First 5K complete!</div>
                          <div className="text-[5px] text-slate-600 leading-tight">Ran my first 5K race. Felt amazing crossing the finish line.</div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Item 3 */}
                    <div className="flex gap-2">
                      <div className="text-[6px] text-slate-600 w-12 text-right pt-1">Jun 2024</div>
                      <div className="flex-1 bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-lg p-2">
                        <div className="text-[7px] font-bold text-slate-900 mb-0.5">Half marathon</div>
                        <div className="text-[5px] text-slate-600 leading-tight">21km done! Never imagined I&apos;d come this far. The journey continues.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Mobile */}
            <div className="w-52 md:w-72 h-[420px] md:h-[560px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-3 border-4 border-slate-700 relative z-20 translate-y-[168px] md:translate-y-[224px] -translate-x-[40px] md:-translate-x-[60px]">
              <div className="bg-white rounded-2xl h-full p-4 flex flex-col overflow-hidden">
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-semibold text-slate-900">9:41</div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                    <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                  </div>
                </div>

                {/* Header */}
                <div className="mb-4">
                  <div className="text-sm font-bold text-slate-900 mb-1">Analytics</div>
                  <div className="text-[8px] text-slate-500">Track your journey&apos;s impact</div>
                </div>

                {/* Analytics Cards */}
                <div className="flex-1 space-y-3">
                  {/* Total Views Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[8px] text-blue-600 font-medium">Total Views</div>
                      <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center text-[8px]">👁️</div>
                    </div>
                    <div className="text-lg font-bold text-blue-900 mb-1">1,234</div>
                    <div className="text-[7px] text-blue-600">+12% this week</div>
                  </div>

                  {/* Total Reactions Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[8px] text-purple-600 font-medium">Reactions</div>
                      <div className="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center">
                        <div className="text-[6px]">❤️</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-purple-900 mb-1">456</div>
                    <div className="text-[7px] text-purple-600">+8% this week</div>
                  </div>

                  {/* Shares Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[8px] text-green-600 font-medium">Shares</div>
                      <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-[8px]">↗️</div>
                    </div>
                    <div className="text-lg font-bold text-green-900 mb-1">89</div>
                    <div className="text-[7px] text-green-600">+15% this week</div>
                  </div>

                  {/* Followers Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[8px] text-orange-600 font-medium">Followers</div>
                      <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center text-[8px]">👥</div>
                    </div>
                    <div className="text-lg font-bold text-orange-900 mb-1">342</div>
                    <div className="text-[7px] text-orange-600">+5% this week</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 relative -mt-[84px] md:-mt-[112px] pt-[124px] md:pt-[152px] z-30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Your journey, <span className="text-blue-600 dark:text-blue-400">beautifully told</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Document who you&apos;re becoming — and show your progress to the world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 - Turn your growth into a story */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 hover:shadow-2xl dark:hover:shadow-slate-900/50 transition-all cursor-pointer group border dark:border-slate-700"
            >
              <div className="mb-6 relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center p-4">
                <div className="w-full max-w-xs space-y-3">
                  {/* Timeline visualization */}
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform">
                    <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-xs">Jan</div>
                    <div className="flex-1 bg-white dark:bg-slate-700 rounded-lg p-2 shadow">
                      <div className="h-2 w-16 bg-slate-800 dark:bg-slate-300 rounded mb-1"></div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform delay-75">
                    <div className="w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-xs">Mar</div>
                    <div className="flex-1 bg-white dark:bg-slate-700 rounded-lg p-2 shadow">
                      <div className="h-2 w-20 bg-slate-800 dark:bg-slate-300 rounded mb-1"></div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform delay-150">
                    <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-xs">Jun</div>
                    <div className="flex-1 bg-white dark:bg-slate-700 rounded-lg p-2 shadow">
                      <div className="h-2 w-14 bg-slate-800 dark:bg-slate-300 rounded mb-1"></div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Turn your growth into a story</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                A beautiful timeline that captures every step of your journey.
              </p>
            </motion.div>

            {/* Feature 2 - Stay accountable, stay consistent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 hover:shadow-2xl dark:hover:shadow-slate-900/50 transition-all cursor-pointer group border dark:border-slate-700"
            >
              <div className="mb-6 relative h-48 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center p-6 overflow-hidden">
                <div className="w-full max-w-xs bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 group-hover:scale-105 transition-transform">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] font-bold text-slate-900 dark:text-white">Consistency</div>
                    <div className="text-[8px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Active
                    </div>
                  </div>
                  {/* Streak visualization */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {[...Array(28)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-full aspect-square rounded ${i < 23 ? 'bg-green-400 dark:bg-green-500' : 'bg-slate-200 dark:bg-slate-700'} group-hover:scale-110 transition-transform`}
                        style={{ transitionDelay: `${i * 10}ms` }}
                      ></div>
                    ))}
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">23</div>
                    <div className="text-[7px] text-slate-600 dark:text-slate-400">day streak</div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Stay accountable, stay consistent</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                When your progress is public, your discipline becomes effortless.
              </p>
            </motion.div>

            {/* Feature 3 - Inspire others with your transformation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 hover:shadow-2xl dark:hover:shadow-slate-900/50 transition-all cursor-pointer group border dark:border-slate-700"
            >
              <div className="mb-6 relative h-48 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center p-4 overflow-hidden">
                {/* Hearts and reactions floating */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl animate-bounce" style={{ animationDelay: '0ms', animationDuration: '2s' }}>❤️</div>
                  <div className="text-3xl absolute top-8 left-12 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '2.5s' }}>🔥</div>
                  <div className="text-3xl absolute bottom-12 right-16 animate-bounce" style={{ animationDelay: '600ms', animationDuration: '2.2s' }}>💪</div>
                  <div className="text-2xl absolute top-16 right-12 animate-bounce" style={{ animationDelay: '900ms', animationDuration: '2.8s' }}>🌟</div>
                  <div className="text-2xl absolute bottom-8 left-16 animate-bounce" style={{ animationDelay: '1200ms', animationDuration: '2.4s' }}>👏</div>
                </div>
                {/* Stats overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-3 shadow-lg group-hover:scale-105 transition-transform">
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">1.2K</div>
                      <div className="text-[7px] text-slate-600 dark:text-slate-400">Views</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-pink-600 dark:text-pink-400">456</div>
                      <div className="text-[7px] text-slate-600 dark:text-slate-400">Reactions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">89</div>
                      <div className="text-[7px] text-slate-600 dark:text-slate-400">Shares</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Inspire others with your transformation</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Your journey could be someone else&apos;s motivation.
              </p>
            </motion.div>

            {/* Feature 4 - Own your evolution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 hover:shadow-2xl dark:hover:shadow-slate-900/50 transition-all cursor-pointer group border dark:border-slate-700"
            >
              <div className="mb-6 relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-xs bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden group-hover:scale-105 transition-transform border dark:border-slate-700">
                  {/* Cover Photo */}
                  <div className="h-16 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-[6px] font-semibold text-slate-700">Your Portfolio</span>
                    </div>
                  </div>
                  {/* Profile Section */}
                  <div className="px-4 pb-4 -mt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white dark:border-slate-800 mb-2"></div>
                    <div className="h-3 w-28 bg-slate-800 dark:bg-slate-300 rounded mb-2"></div>
                    <div className="h-2 w-20 bg-slate-300 dark:bg-slate-600 rounded mb-3"></div>
                    {/* Journey versions */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-1.5 w-16 bg-slate-700 dark:bg-slate-400 rounded mb-1"></div>
                          <div className="h-1 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-1.5 w-14 bg-slate-700 dark:bg-slate-400 rounded mb-1"></div>
                          <div className="h-1 w-10 bg-slate-300 dark:bg-slate-600 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Own your evolution</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Create a personal portfolio that evolves as you do.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-landing-xl px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-landing-section md:text-landing-section-lg font-bold text-center text-slate-900 dark:text-white mb-3">
              Simple pricing. Grow at your own pace.
            </h2>
            <p className="text-landing-body text-slate-600 dark:text-slate-300 text-center mt-3">
              Start free. Upgrade once and keep your journey forever.
            </p>
          </motion.div>

          <div className="mt-landing-lg grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6"
            >
              <div className="text-landing-small font-semibold text-slate-600 dark:text-slate-400 mb-2">Free</div>
              <div className="text-landing-section font-bold text-slate-900 dark:text-white mb-4">£0</div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">1 transformation journey</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">Unlimited milestones</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">Limited media storage</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">Basic public pages</span>
                </li>
                <li className="flex items-start opacity-50">
                  <svg className="w-5 h-5 text-slate-400 dark:text-slate-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-500 dark:text-slate-500">Verified badge</span>
                </li>
                <li className="flex items-start opacity-50">
                  <svg className="w-5 h-5 text-slate-400 dark:text-slate-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-500 dark:text-slate-500">Hide or show specific milestones</span>
                </li>
              </ul>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Perfect for getting started with your first journey.
              </p>

              <button 
                onClick={handleCtaClick}
                className="w-full px-6 py-3 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg border-2 border-slate-300 dark:border-slate-600 transition-all"
              >
                {user ? 'Go to Dashboard' : 'Start for free'}
              </button>
            </motion.div>

            {/* Lifetime Pro Plan */}
            {!hasLifetimeAccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-blue-50 dark:bg-slate-800 border-2 border-blue-500 dark:border-blue-600 rounded-xl p-6 relative"
              >
                <div className="absolute top-0 right-6 -translate-y-1/2">
                  <span className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-landing-tiny font-semibold rounded-full">
                    60% off · LAUNCHDEAL
                  </span>
                </div>
                
                <div className="text-landing-small font-semibold text-blue-600 dark:text-blue-400 mb-2">Lifetime Pro</div>
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-landing-body text-slate-400 dark:text-slate-500 line-through">$99.99</span>
                  <span className="text-landing-section font-bold text-slate-900 dark:text-white">$39</span>
                </div>
                <div className="text-landing-small text-slate-600 dark:text-slate-400 mb-4">one-time payment</div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">Unlimited transformation journeys</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">Unlimited milestones</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">Extended media storage</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">Custom themes & layouts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">Verified badge</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">Hide or show specific milestones</span>
                  </li>
                </ul>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Limited time launch offer. Use code <span className="font-semibold text-blue-600 dark:text-blue-400">LAUNCHDEAL</span> for 60% off.
                </p>

                <button 
                  onClick={handlePurchaseClick}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Get lifetime access
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-green-50 dark:bg-slate-800 border-2 border-green-500 dark:border-green-600 rounded-xl p-6 relative"
              >
                <div className="absolute top-0 right-6 -translate-y-1/2">
                  <span className="px-3 py-1 bg-green-500 dark:bg-green-600 text-white text-landing-tiny font-semibold rounded-full">
                    ✓ ACTIVE
                  </span>
                </div>
                
                <div className="text-landing-small font-semibold text-green-600 dark:text-green-400 mb-2">Lifetime Pro</div>
                <div className="text-landing-section font-bold text-slate-900 dark:text-white mb-4">You&apos;re all set!</div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">Unlimited transformation journeys</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">Unlimited milestones</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">Extended media storage</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">Custom themes & layouts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">Verified badge</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">Hide or show specific milestones</span>
                  </li>
                </ul>

                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-6">
                  Thank you for your support! Enjoy lifetime access to all Pro features.
                </p>

                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Auth/Payment Modal */}
      <AuthPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        intent={modalIntent}
      />

      {/* Footer */}
      <footer className="py-landing-lg px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-slate-600 dark:text-slate-400 text-landing-small mb-4 md:mb-0">
              © 2025 loged<span className="text-blue-500 dark:text-blue-400">in</span> — a doddlesoft product
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/terms')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-landing-small transition-colors"
              >
                Terms
              </button>
              <button 
                onClick={() => router.push('/privacy-policy')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-landing-small transition-colors"
              >
                Privacy
              </button>
              <a 
                href="mailto:connect@doddle.software"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-landing-small transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

