"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Image, Share2, Lock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Smooth scroll handler
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-bold text-slate-900">
              Loged.in
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => router.push('/pay')}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
              >
                Get lifetime access
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-center text-slate-900 leading-tight"
          >
            Log every <span className="text-blue-500">version</span> of yourself.
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-slate-600 text-center max-w-3xl mx-auto"
          >
            Turn your journey into a beautiful timeline — track progress, write your story, and inspire the world with your evolution.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Start for free
            </button>
            <button 
              onClick={() => router.push('/pay')}
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-900 text-lg font-semibold rounded-lg border-2 border-slate-200 transition-all"
            >
              Get lifetime access
            </button>
          </motion.div>

          {/* Reassurance text */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-sm text-slate-500 text-center"
          >
            No credit card needed · Your journey stays private until you choose to share it
          </motion.p>
        </div>

        {/* Hero Visual - Phone Mockups */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <div className="flex items-end justify-center gap-4 md:gap-6">
            {/* Left Phone */}
            <div className="w-64 md:w-80 h-[480px] md:h-[560px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-2xl p-6 border border-slate-200">
              <div className="bg-white rounded-2xl h-full p-4 flex flex-col">
                <div className="text-sm font-semibold text-slate-700 mb-4">Progress</div>
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <div className="h-8 bg-blue-100 rounded" style={{ width: '80%' }}></div>
                  <div className="h-8 bg-blue-200 rounded" style={{ width: '60%' }}></div>
                  <div className="h-8 bg-blue-300 rounded" style={{ width: '90%' }}></div>
                  <div className="h-8 bg-blue-400 rounded" style={{ width: '70%' }}></div>
                </div>
                <div className="text-xs text-slate-500 mt-4">Your evolution over time</div>
              </div>
            </div>

            {/* Middle Phone - Elevated */}
            <div className="w-72 md:w-96 h-[520px] md:h-[600px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-2xl p-6 border border-blue-200 -mb-4">
              <div className="bg-white rounded-2xl h-full p-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-4"></div>
                <div className="text-lg font-bold text-slate-900 mb-1">Your Journey</div>
                <div className="text-sm text-slate-500 mb-6">Version 2.0</div>
                <div className="w-full space-y-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Day 1</div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="text-xs font-semibold text-blue-600 mb-1">Month 3</div>
                    <div className="h-2 bg-blue-300 rounded"></div>
                  </div>
                  <div className="bg-blue-100 rounded-xl p-3">
                    <div className="text-xs font-semibold text-blue-700 mb-1">Today</div>
                    <div className="h-2 bg-blue-400 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Phone */}
            <div className="w-64 md:w-80 h-[480px] md:h-[560px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-2xl p-6 border border-slate-200">
              <div className="bg-white rounded-2xl h-full p-4">
                <div className="text-sm font-semibold text-slate-700 mb-4">Milestones</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square bg-slate-100 rounded-lg"></div>
                  <div className="aspect-square bg-blue-100 rounded-lg"></div>
                  <div className="aspect-square bg-blue-200 rounded-lg"></div>
                  <div className="aspect-square bg-slate-100 rounded-lg"></div>
                  <div className="aspect-square bg-blue-300 rounded-lg"></div>
                  <div className="aspect-square bg-slate-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-4">
              Everything you need to document your transformation
            </h2>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onHoverStart={() => setHoveredCard(1)}
              onHoverEnd={() => setHoveredCard(null)}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6 transition-all ${hoveredCard === 1 ? 'scale-110' : ''}`}>
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Timeline of your evolution</h3>
              <p className="text-slate-600 leading-relaxed">
                Create versions of yourself over time — from "Day 1" to "Version 2.0". Add notes, photos, and milestones that show how far you've come.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onHoverStart={() => setHoveredCard(2)}
              onHoverEnd={() => setHoveredCard(null)}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6 transition-all ${hoveredCard === 2 ? 'scale-110' : ''}`}>
                <Image className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tell the story behind each change</h3>
              <p className="text-slate-600 leading-relaxed">
                Attach progress photos, write what really happened, and capture the emotions behind each shift — not just numbers.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onHoverStart={() => setHoveredCard(3)}
              onHoverEnd={() => setHoveredCard(null)}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6 transition-all ${hoveredCard === 3 ? 'scale-110' : ''}`}>
                <Share2 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Shareable journey page</h3>
              <p className="text-slate-600 leading-relaxed">
                Turn your transformation into a clean, shareable page. Keep it private for yourself or share it with friends, followers, or clients.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onHoverStart={() => setHoveredCard(4)}
              onHoverEnd={() => setHoveredCard(null)}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6 transition-all ${hoveredCard === 4 ? 'scale-110' : ''}`}>
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Built to stay</h3>
              <p className="text-slate-600 leading-relaxed">
                Loged.in is made for years, not weeks. A simple place to keep your evolution in one timeline, forever.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-4">
              Simple pricing. Grow at your own pace.
            </h2>
            <p className="text-lg text-slate-600 text-center mt-4">
              Start free. Upgrade once and keep your journey forever.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-200 rounded-2xl p-8"
            >
              <div className="text-sm font-semibold text-slate-600 mb-2">Free</div>
              <div className="text-4xl font-bold text-slate-900 mb-6">£0</div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-700">1 transformation journey</span>
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
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-lg border-2 border-slate-300 transition-all"
              >
                Start for free
              </button>
            </motion.div>

            {/* Lifetime Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-8 relative"
            >
              <div className="absolute top-0 right-8 -translate-y-1/2">
                <span className="px-4 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                  One-time payment · Lifetime access
                </span>
              </div>
              
              <div className="text-sm font-semibold text-blue-600 mb-2">Lifetime Pro</div>
              <div className="text-4xl font-bold text-slate-900 mb-1">£39</div>
              <div className="text-sm text-slate-600 mb-6">one-time</div>
              
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
                Early bird launch price. Prices may increase in the future.
              </p>

              <button 
                onClick={() => router.push('/pay')}
                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Get lifetime access
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-slate-600 text-sm mb-4 md:mb-0">
              © 2025 Loged.in — A DoddleSoft project
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                Terms
              </button>
              <button className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                Privacy
              </button>
              <button className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

