'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isLandingPage = pathname === '/';

  // Smooth scroll handler for landing page
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

  const handleNavigation = (path: string) => {
    if (path.startsWith('#') && isLandingPage) {
      scrollToSection(path.substring(1));
    } else if (path.startsWith('#')) {
      router.push('/' + path);
    } else {
      router.push(path);
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-4 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => router.push('/')}
              className="text-xl font-bold text-slate-900 hover:opacity-80 transition-opacity"
            >
              Loged.in
            </button>
            
            {/* Center Navigation - Only show on landing page */}
            {isLandingPage && (
              <nav className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-landing-small text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-landing-small text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Pricing
                </button>
              </nav>
            )}

            {/* Right Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {!user ? (
                <>
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-landing-small text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => handleNavigation('/pay')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-landing-small rounded-lg font-medium transition-all"
                  >
                    Get lifetime access
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="text-landing-small text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => router.push('/profile')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-landing-small rounded-lg font-medium transition-all"
                  >
                    Profile
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => {
                // Toggle mobile menu - you can implement this later if needed
              }}
            >
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}
