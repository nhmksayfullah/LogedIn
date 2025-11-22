"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Image, Share2, Lock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-landing-body font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Start for free
            </button>
            <button 
              onClick={() => router.push('/pay')}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-900 text-landing-body font-semibold rounded-lg border-2 border-slate-200 transition-all"
            >
              Get lifetime access
            </button>
          </motion.div>

          {/* Reassurance text */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-landing-small text-slate-500 text-center"
          >
            No credit card needed · Your journey stays private until you choose to share it
          </motion.p>
        </div>

        {/* Hero Visual - Phone Mockups */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-landing-xl max-w-5xl mx-auto"
        >
          <div className="flex items-end justify-center gap-3 md:gap-4">
            {/* Left Phone */}
            <div className="w-48 md:w-64 h-[360px] md:h-[440px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-2xl p-4 border border-slate-200">
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
            <div className="w-56 md:w-80 h-[400px] md:h-[480px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-2xl p-4 border border-blue-200 -mb-3">
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
            <div className="w-48 md:w-64 h-[360px] md:h-[440px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-2xl p-4 border border-slate-200">
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
      <section id="features" className="py-landing-xl px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-landing-section md:text-landing-section-lg font-bold text-center text-slate-900 mb-3">
              Everything you need to document your transformation
            </h2>
          </motion.div>

          <div className="mt-landing-lg grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onHoverStart={() => setHoveredCard(1)}
              onHoverEnd={() => setHoveredCard(null)}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-all ${hoveredCard === 1 ? 'scale-110' : ''}`}>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-landing-card-title font-bold text-slate-900 mb-2">Timeline of your evolution</h3>
              <p className="text-landing-small text-slate-600 leading-relaxed">
                Create versions of yourself over time — from &quot;Day 1&quot; to &quot;Version 2.0&quot;. Add notes, photos, and milestones that show how far you&apos;ve come.
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
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-all ${hoveredCard === 2 ? 'scale-110' : ''}`}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-landing-card-title font-bold text-slate-900 mb-2">Tell the story behind each change</h3>
              <p className="text-landing-small text-slate-600 leading-relaxed">
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
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-all ${hoveredCard === 3 ? 'scale-110' : ''}`}>
                <Share2 className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-landing-card-title font-bold text-slate-900 mb-2">Shareable journey page</h3>
              <p className="text-landing-small text-slate-600 leading-relaxed">
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
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-all ${hoveredCard === 4 ? 'scale-110' : ''}`}>
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-landing-card-title font-bold text-slate-900 mb-2">Built to stay</h3>
              <p className="text-landing-small text-slate-600 leading-relaxed">
                Loged.in is made for years, not weeks. A simple place to keep your evolution in one timeline, forever.
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
              className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6 relative"
            >
              <div className="absolute top-0 right-6 -translate-y-1/2">
                <span className="px-3 py-1 bg-blue-500 text-white text-landing-tiny font-semibold rounded-full">
                  One-time payment · Lifetime access
                </span>
              </div>
              
              <div className="text-landing-small font-semibold text-blue-600 mb-2">Lifetime Pro</div>
              <div className="text-landing-section font-bold text-slate-900 mb-1">£39</div>
              <div className="text-landing-small text-slate-600 mb-4">one-time</div>
              
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

