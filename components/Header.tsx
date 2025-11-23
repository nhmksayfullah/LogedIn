'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPaymentModal } from './AuthPaymentModal';
import Image from 'next/image';

type ModalIntent = 'signup' | 'login' | 'payment';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, profilePictureUrl } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState<ModalIntent>('login');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Don't show header on public profile or journey pages
  const pathSegments = pathname.split('/').filter(Boolean);
  const isPublicProfileOrJourneyPage = pathname.startsWith('/') && 
    (pathSegments.length === 1 || pathSegments.length === 2) &&
    pathname !== '/' &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/profile') &&
    !pathname.startsWith('/journey/') &&
    !pathname.startsWith('/auth/') &&
    !pathname.startsWith('/terms') &&
    !pathname.startsWith('/privacy-policy') &&
    !pathname.startsWith('/reset-password') &&
    !pathname.startsWith('/update-password') &&
    !pathname.startsWith('/verify-email');

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const openAuthModal = (intent: ModalIntent) => {
    setModalIntent(intent);
    setIsModalOpen(true);
  };

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

  // Don't render header on public profile or journey pages
  if (isPublicProfileOrJourneyPage) {
    return null;
  }

  return (
    <>
      {/* Spacer div to push content down when header is fixed */}
      <div className="h-20" />
      <header className="fixed top-0 w-full z-50 pt-4 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => router.push('/')}
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logedin_logo.svg"
                alt="Loged.in"
                width={78}
                height={32}
                priority
              />
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
                    onClick={() => openAuthModal('login')}
                    className="text-landing-small text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => openAuthModal('payment')}
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
                  
                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                        {profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={profilePictureUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.email?.[0].toUpperCase()
                        )}
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                        <button
                          onClick={() => {
                            router.push('/profile');
                            setIsUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          Profile & Plan
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Auth/Payment Modal */}
      <AuthPaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        intent={modalIntent}
      />
    </>
  );
}
