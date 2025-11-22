'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LoginFormProps {
  onGoogleSignIn: () => Promise<void>;
  onTwitterSignIn: () => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function LoginForm({ 
  onGoogleSignIn,
  onTwitterSignIn,
  isLoading, 
  error 
}: LoginFormProps) {

  return (
    <div className="w-full space-y-8 p-8 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-subtle border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">🎬</span>
          <h2 className="text-2xl font-medium text-text dark:text-text-dark">
            NextTemp
          </h2>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <button
          onClick={onGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-full shadow-subtle text-text dark:text-text-dark bg-surface-light dark:bg-surface-dark hover:bg-neutral dark:hover:bg-neutral-dark transition-all flex items-center justify-center disabled:opacity-50"
        >
          <Image
            src="/Google-Logo.png"
            alt="Google Logo"
            width={20}
            height={20}
            className="mr-2"
          />
          Sign in with Google
        </button>

        <button
          onClick={onTwitterSignIn}
          disabled={isLoading}
          className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-full shadow-subtle text-text dark:text-text-dark bg-surface-light dark:bg-surface-dark hover:bg-neutral dark:hover:bg-neutral-dark transition-all flex items-center justify-center disabled:opacity-50"
        >
          <svg
            className="mr-2"
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
    </div>
  );
}