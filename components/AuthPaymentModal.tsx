'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { StripeBuyButton } from './StripeBuyButton';

type ModalIntent = 'signup' | 'login' | 'payment';

interface AuthPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent: ModalIntent;
}

export function AuthPaymentModal({ isOpen, onClose, intent }: AuthPaymentModalProps) {
  const { user, signInWithGoogle, signInWithTwitter } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [wasUserNull, setWasUserNull] = useState(!user);

  // Track if user was null when modal opened
  useEffect(() => {
    if (isOpen && !user) {
      setWasUserNull(true);
      setShowPayment(false);
    } else if (isOpen && user && intent === 'payment') {
      // User is already authenticated and intent is payment, show payment directly
      setShowPayment(true);
      setWasUserNull(false);
    }
  }, [isOpen, user, intent]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPayment(false);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle navigation after authentication based on intent
  useEffect(() => {
    if (user && wasUserNull && isOpen) {
      if (intent === 'payment') {
        // Show payment step for lifetime access intent
        setShowPayment(true);
        setWasUserNull(false);
      } else {
        // For signup/login intent, navigate to dashboard
        onClose();
        router.push('/dashboard');
        setWasUserNull(false);
      }
    }
  }, [user, wasUserNull, isOpen, intent, router, onClose]);

  useEffect(() => {
    // Close modal on escape key press
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      // For login/signup intent: redirect to dashboard
      // For payment intent: redirect back to landing page with a flag to show payment modal
      const redirectPath = intent === 'payment' ? '/?show_payment=true' : '/dashboard';
      await signInWithGoogle(redirectPath);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      // For login/signup intent: redirect to dashboard
      // For payment intent: redirect back to landing page with a flag to show payment modal
      const redirectPath = intent === 'payment' ? '/?show_payment=true' : '/dashboard';
      await signInWithTwitter(redirectPath);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleSkipPayment = () => {
    onClose();
    router.push('/dashboard');
  };

  if (!isOpen) return null;

  // Show payment step if user is authenticated and intent was payment
  if (showPayment && user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Get Lifetime Pro Access
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Pay once, own forever. Unlock unlimited journeys.
            </p>
          </div>

          {/* Pricing highlight */}
          <div className="bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-blue-600 rounded-xl p-4 mb-6">
            <div className="flex items-baseline justify-center space-x-2 mb-2">
              <span className="text-lg text-slate-400 dark:text-slate-500 line-through">$99.99</span>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">$39</span>
            </div>
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs font-semibold rounded-full">
                60% OFF · LAUNCHDEAL
              </span>
            </div>
          </div>

          {/* Stripe Buy Button */}
          <div className="mb-4">
            <StripeBuyButton
              className="flex justify-center"
              buttonText="Get Lifetime Access · $39"
            />
          </div>

          {/* Skip option */}
          <button
            onClick={handleSkipPayment}
            className="w-full py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            Skip for now, take me to dashboard →
          </button>

          {/* Footer note */}
          <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    );
  }

  // Show authentication step
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          {intent === 'payment' ? (
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Sign in to purchase
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Welcome to loged<span className="text-blue-500 dark:text-blue-400">in</span>
            </h2>
          )}
          <p className="text-slate-600 dark:text-slate-300">
            {intent === 'payment' 
              ? 'Create an account or sign in to get lifetime access'
              : 'Sign in to start documenting your journey'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Auth buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src="/Google-Logo.png"
              alt="Google Logo"
              width={20}
              height={20}
              className="mr-3"
            />
            Continue with Google
          </button>

          <button
            onClick={handleTwitterSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="mr-3"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Continue with X
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-center text-slate-500 dark:text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
