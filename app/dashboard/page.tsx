"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usePurchase } from '@/hooks/usePurchase';
import { useJourneys } from '@/hooks/useJourneys';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Calendar, Lock, Globe, X } from 'lucide-react';
import { AuthPaymentModal } from '@/components/AuthPaymentModal';

const AUTH_TIMEOUT = 15000; // 15 seconds

export default function Dashboard() {
  const { user, hasLifetimeAccess, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { refetch: refetchPurchase } = usePurchase();
  const [hasCheckedPurchase, setHasCheckedPurchase] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  const { journeys, isLoading: isLoadingJourneys, createJourney, refetch } = useJourneys();
  
  // New journey modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJourneyTitle, setNewJourneyTitle] = useState('');
  const [newJourneyDescription, setNewJourneyDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Access check - Only redirect if no access AND initial check is complete
  // DISABLED: This was causing navigation issues. Users can manually visit profile anytime.
  // The profile page itself will show upgrade options if needed.
  // useEffect(() => {
  //   if (isPurchaseLoading || isTrialLoading || isAuthLoading) return;
  //   
  //   const hasValidPurchase = purchase?.status === 'active' && purchase?.purchase_type === 'lifetime_pro';
  //   
  //   // Only redirect if we've checked everything and user has no access
  //   if (hasCheckedPurchase && !hasValidPurchase && !isInTrial && !hasLifetimeAccess) {
  //     router.replace('/profile');
  //   }
  // }, [purchase, isPurchaseLoading, isTrialLoading, isAuthLoading, router, isInTrial, hasLifetimeAccess, hasCheckedPurchase]);

  // Add refresh effect
  useEffect(() => {
    const refreshPurchase = async () => {
      await refetchPurchase();
      setHasCheckedPurchase(true);
    };
    
    if (user?.id) {
      refreshPurchase();
    }
  }, [user?.id, refetchPurchase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && isAuthLoading) {
        setAuthTimeout(true);
      }
    }, AUTH_TIMEOUT);
    
    return () => clearTimeout(timer);
  }, [user, isAuthLoading]);

  // Update the loading check
  if (!user && isAuthLoading && !hasCheckedPurchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4 mx-auto"></div>
          <p className="text-foreground">
            {authTimeout ? 
              "Taking longer than usual? Try refreshing the page 😊." :
              "Verifying access..."}
          </p>
        </div>
      </div>
    );
  }

  const handleCreateJourney = async () => {
    if (!newJourneyTitle.trim()) {
      setCreateError('Please enter a journey title');
      return;
    }

    // Check journey limit for free users
    if (!hasLifetimeAccess && journeys.length >= 1) {
      setCreateError('Free plan allows only 1 journey. Upgrade to create more!');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await createJourney({
        title: newJourneyTitle,
        description: newJourneyDescription,
        is_public: isPublic,
      });

      // Reset form and close modal
      setNewJourneyTitle('');
      setNewJourneyDescription('');
      setIsPublic(false);
      setIsModalOpen(false);
      
      // Manually trigger a refetch after a short delay
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (err) {
      console.error('Failed to create journey:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create journey';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 mt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Journeys</h1>
            <p className="text-slate-600 mt-2">
              Track your transformations, one version at a time
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>New Journey</span>
          </button>
        </div>

        {/* Journeys Grid */}
        {isLoadingJourneys ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : journeys.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Start Your First Journey
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Create a journey to document your transformation. Track progress, add versions, and share your story.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Journey</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey, index) => (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                onClick={() => router.push(`/journey/${journey.id}`)}
              >
                {/* Cover Image */}
                <div className="h-40 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                  {journey.cover_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={journey.cover_image_url} 
                      alt={journey.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-500 transition-colors">
                      {journey.title}
                    </h3>
                    {journey.is_public ? (
                      <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>

                  {journey.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {journey.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-slate-500">
                      <span>{journey.version_count || 0} versions</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(journey.updated_at)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Free Plan Notice */}
        {!hasLifetimeAccess && journeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
          >
            <p className="text-slate-700">
              You&apos;re on the <span className="font-semibold">Free Plan</span> (1 journey limit).{' '}
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Upgrade to Lifetime Pro
              </button>{' '}
              for unlimited journeys.
            </p>
          </motion.div>
        )}
      </div>

      {/* Create Journey Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Create New Journey
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-5">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Journey Title *
                    </label>
                    <input
                      type="text"
                      value={newJourneyTitle}
                      onChange={(e) => setNewJourneyTitle(e.target.value)}
                      placeholder="e.g., Body Transformation 2025"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      maxLength={100}
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newJourneyDescription}
                      onChange={(e) => setNewJourneyDescription(e.target.value)}
                      placeholder="What is this journey about? (optional)"
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                      maxLength={500}
                    />
                  </div>

                  {/* Privacy Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {isPublic ? (
                        <Globe className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">
                          {isPublic ? 'Public' : 'Private'}
                        </p>
                        <p className="text-xs text-slate-600">
                          {isPublic 
                            ? 'Anyone can view this journey'
                            : 'Only you can see this journey'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPublic(!isPublic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isPublic ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isPublic ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Error Message */}
                  {createError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{createError}</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateJourney}
                    disabled={isCreating || !newJourneyTitle.trim()}
                    className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Journey'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      
      {/* Payment Modal */}
      <AuthPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        intent="payment"
      />
    </div>
  );
}