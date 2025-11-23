"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthPaymentModal } from '@/components/AuthPaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/hooks/usePurchase';

type ModalIntent = 'signup' | 'login' | 'payment';

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { hasLifetimeAccess } = usePurchase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState<ModalIntent>('signup');

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-landing-xl px-4">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-landing-hero md:text-landing-hero-lg font-semibold text-center text-slate-900 leading-tight"
          >
            Log every <span className="text-blue-500">version</span> of yourself.
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-landing-body md:text-landing-body-lg text-slate-600 text-center max-w-3xl mx-auto"
          >
            Turn your journey into a beautiful timeline — track progress, write your story, and inspire the world with your evolution.
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
                className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-900 text-landing-body font-semibold rounded-lg border-2 border-slate-200 transition-all"
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
            className="mt-4 text-landing-small text-slate-500 text-center"
          >
            Your journey stays private until you choose to share it
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
                      <div className="text-[6px] text-slate-600 leading-tight">Taking the first step towards my goal. Excited for what's ahead!</div>
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
                        <div className="text-[5px] text-slate-600 leading-tight">21km done! Never imagined I'd come this far. The journey continues.</div>
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
                  <div className="text-[8px] text-slate-500">Track your journey's impact</div>
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
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative -mt-[84px] md:-mt-[112px] pt-[124px] md:pt-[152px] z-30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Become the person your <span className="text-blue-600">future self</span> will thank you for.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 - Showcase Your Best */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="mb-6 relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-56 h-72 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl transform -rotate-3 scale-90 group-hover:scale-95 transition-transform">
                    <div className="p-4 h-full flex flex-col">
                      <div className="w-full h-12 bg-blue-500/20 rounded-lg mb-3"></div>
                      <div className="flex-1 bg-slate-700/30 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Transform in Private — or Inspire the World</h3>
              <p className="text-slate-600 leading-relaxed">
                Grow quietly or share boldly. Keep your journey private, or publish it when you&apos;re ready to inspire someone who needs your story.
              </p>
            </motion.div>

            {/* Feature 2 - Automatic Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="mb-6 relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform delay-75"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform delay-100"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform delay-150"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg group-hover:rotate-180 transition-transform delay-200 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform delay-75"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Capture the Milestones That Changed You</h3>
              <p className="text-slate-600 leading-relaxed">
                Record every meaningful step — big or small. Your milestones become a timeline of who you were, who you are, and who you&apos;re becoming.
              </p>
            </motion.div>

            {/* Feature 3 - Customize Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="mb-6 relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl p-6 group-hover:scale-105 transition-transform">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full mb-3"></div>
                    <div className="h-3 w-32 bg-slate-200 rounded mb-2"></div>
                    <div className="h-2 w-24 bg-slate-100 rounded mb-4"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="w-6 h-6 bg-slate-200 rounded"></div>
                      <div className="w-6 h-6 bg-slate-200 rounded"></div>
                      <div className="w-6 h-6 bg-slate-200 rounded"></div>
                      <div className="w-6 h-6 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Turn Your Journey Into a Story</h3>
              <p className="text-slate-600 leading-relaxed">
                Not just before-and-after. Create a beautiful, shareable timeline that shows the real moments behind your transformation.
              </p>
            </motion.div>

            {/* Feature 4 - Track Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="mb-6 relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center p-6">
                <div className="w-full h-full bg-white rounded-xl shadow-lg p-4 group-hover:scale-105 transition-transform">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-2 w-20 bg-slate-200 rounded"></div>
                    <div className="h-4 w-12 bg-slate-900 rounded"></div>
                  </div>
                  <div className="h-2 w-16 bg-slate-100 rounded mb-4"></div>
                  <div className="flex items-end justify-between h-24 gap-2">
                    <div className="w-full bg-blue-200 rounded-t" style={{ height: '60%' }}></div>
                    <div className="w-full bg-blue-300 rounded-t" style={{ height: '45%' }}></div>
                    <div className="w-full bg-blue-300 rounded-t" style={{ height: '50%' }}></div>
                    <div className="w-full bg-blue-400 rounded-t" style={{ height: '75%' }}></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Built for Long-Term Growth</h3>
              <p className="text-slate-600 leading-relaxed">
                Come back anytime. Your milestones stay organized, safe, and waiting for your next breakthrough.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-landing-xl px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-landing-section md:text-landing-section-lg font-bold text-center text-slate-900 mb-3">
              Simple pricing. Grow at your own pace.
            </h2>
            <p className="text-landing-body text-slate-600 text-center mt-3">
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
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="text-landing-small font-semibold text-slate-600 mb-2">Free</div>
              <div className="text-landing-section font-bold text-slate-900 mb-4">£0</div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-landing-small text-slate-700">1 transformation journey</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700">Up to 10 versions</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700">Add photos & notes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700">Basic public page</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700">Loged.in branding</span>
                </li>
              </ul>

              <p className="text-sm text-slate-500 mb-6">
                Best for trying Loged.in or logging a single transformation.
              </p>

              <button 
                onClick={handleCtaClick}
                className="w-full px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-lg border-2 border-slate-300 transition-all"
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
                className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6 relative"
              >
                <div className="absolute top-0 right-6 -translate-y-1/2">
                  <span className="px-3 py-1 bg-blue-500 text-white text-landing-tiny font-semibold rounded-full">
                    60% off · LAUNCHDEAL
                  </span>
                </div>
                
                <div className="text-landing-small font-semibold text-blue-600 mb-2">Lifetime Pro</div>
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-landing-body text-slate-400 line-through">$99.99</span>
                  <span className="text-landing-section font-bold text-slate-900">$39</span>
                </div>
                <div className="text-landing-small text-slate-600 mb-4">one-time payment</div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 font-semibold">Unlimited journeys</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 font-semibold">Unlimited versions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">No Loged.in watermark</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">Custom themes & layouts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">Before/after comparison view</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">Hide or show specific versions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">Priority support</span>
                  </li>
                </ul>

                <p className="text-sm text-slate-600 mb-6">
                  Limited time launch offer. Use code <span className="font-semibold text-blue-600">LAUNCHDEAL</span> for 60% off.
                </p>

                <button 
                  onClick={handleGetLifetimeClick}
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
                className="bg-green-50 border-2 border-green-500 rounded-xl p-6 relative"
              >
                <div className="absolute top-0 right-6 -translate-y-1/2">
                  <span className="px-3 py-1 bg-green-500 text-white text-landing-tiny font-semibold rounded-full">
                    ✓ ACTIVE
                  </span>
                </div>
                
                <div className="text-landing-small font-semibold text-green-600 mb-2">Lifetime Pro</div>
                <div className="text-landing-section font-bold text-slate-900 mb-4">You&apos;re all set!</div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 font-semibold">Unlimited journeys</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700 font-semibold">Unlimited versions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">No Loged.in watermark</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">Custom themes & layouts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">Before/after comparison view</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">Hide or show specific versions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-slate-700">Priority support</span>
                  </li>
                </ul>

                <p className="text-sm text-green-600 font-medium mb-6">
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
      <footer className="py-landing-lg px-4 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-slate-600 text-landing-small mb-4 md:mb-0">
              © 2025 Loged.in — A DoddleSoft project
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/terms')}
                className="text-slate-600 hover:text-slate-900 text-landing-small transition-colors"
              >
                Terms
              </button>
              <button 
                onClick={() => router.push('/privacy-policy')}
                className="text-slate-600 hover:text-slate-900 text-landing-small transition-colors"
              >
                Privacy
              </button>
              <a 
                href="mailto:contact@doddle.software"
                className="text-slate-600 hover:text-slate-900 text-landing-small transition-colors"
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

