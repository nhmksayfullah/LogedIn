"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usePurchase } from '@/hooks/usePurchase';
import { useJourneys, Journey } from '@/hooks/useJourneys';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import { AuthPaymentModal } from '@/components/AuthPaymentModal';
import { JourneyModal, JourneyFormData } from '@/components/JourneyModal';
import { JourneyCard } from '@/components/JourneyCard';

// Force dynamic rendering - this page cannot be statically generated
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { refetch: refetchPurchase } = usePurchase();
  const { journeys, isLoading: isLoadingJourneys, journeyLimits, createJourney, updateJourney, deleteJourney } = useJourneys();
  
  // Journey modal state
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Refresh purchase data when user changes
  useEffect(() => {
    if (user?.id) {
      refetchPurchase();
    }
  }, [user?.id, refetchPurchase]);

  // Update the loading check
  if (isAuthLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400 mb-4 mx-auto"></div>
          <p className="text-slate-900 dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading completes, redirect
  if (!isAuthLoading && !user) {
    router.replace('/');
    return null;
  }

  const handleCreateJourney = async (data: JourneyFormData) => {
    // The limit check is now handled in the useJourneys hook
    // Just call createJourney and let it handle the validation
    await createJourney(data);
  };

  const handleEditJourney = async (data: JourneyFormData) => {
    if (!editingJourney) return;
    
    await updateJourney(editingJourney.id, data);
    // No need to refetch - updateJourney already refreshes the list
  };

  const handleDeleteJourney = async (journeyId: string) => {
    await deleteJourney(journeyId);
    // No need to refetch - deleteJourney already refreshes the list
  };

  const openCreateModal = () => {
    // Check if user can create more journeys
    if (journeyLimits && !journeyLimits.canCreate) {
      // Show upgrade prompt instead
      setIsPaymentModalOpen(true);
      return;
    }
    
    setModalMode('create');
    setEditingJourney(null);
    setIsJourneyModalOpen(true);
  };

  const openEditModal = (journey: Journey) => {
    setModalMode('edit');
    setEditingJourney(journey);
    setIsJourneyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 mt-2 sm:mt-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">My Journeys</h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-1 md:mt-2">
              Track your transformations, one version at a time
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Start New Journey</span>
          </button>
        </div>

        {/* Journeys Grid */}
        {isLoadingJourneys ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
          </div>
        ) : journeys.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-20 px-4"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Start Your First Journey
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-6 md:mb-8 max-w-md mx-auto">
              Create a journey to document your transformation. Track progress, add versions, and share your story.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Start New Journey</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey, index) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                index={index}
                onClick={() => router.push(`/journey/${journey.slug}`)}
                onEdit={() => openEditModal(journey)}
                onDelete={() => handleDeleteJourney(journey.id)}
              />
            ))}
          </div>
        )}

        {/* Free Plan Notice */}
        {journeyLimits && !journeyLimits.isLifetimePro && journeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 md:mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-6 text-center"
          >
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200">
              You&apos;re on the <span className="font-semibold">Free Plan</span> ({journeyLimits.currentCount}/{journeyLimits.limit} journey used).{' '}
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Upgrade to Lifetime Pro
              </button>{' '}
              for unlimited journeys and more features.
            </p>
          </motion.div>
        )}
        
        {/* Upgrade Banner when limit reached */}
        {journeyLimits && !journeyLimits.canCreate && !journeyLimits.isLifetimePro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 md:mt-8 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white rounded-xl p-6 md:p-8 text-center shadow-lg"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-2">Journey Limit Reached</h3>
            <p className="text-sm md:text-base mb-4 md:mb-6 text-blue-50 dark:text-blue-100">
              You&apos;ve reached your limit of {journeyLimits.limit} journey on the Free plan. 
              Upgrade to Lifetime Pro for unlimited journeys, custom themes, and more!
            </p>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
            >
              Upgrade to Lifetime Pro - $39 (60% off)
            </button>
          </motion.div>
        )}
      </div>

      {/* Journey Modal */}
      <JourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        onSave={modalMode === 'create' ? handleCreateJourney : handleEditJourney}
        journeyId={editingJourney?.id}
        initialData={editingJourney ? {
          title: editingJourney.title,
          description: editingJourney.description || '',
          is_public: editingJourney.is_public,
          slug: editingJourney.slug || '',
          cover_image_url: editingJourney.cover_image_url,
          cover_color: editingJourney.cover_color,
        } : undefined}
        mode={modalMode}
      />
      
      {/* Payment Modal */}
      <AuthPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        intent="payment"
      />
    </div>
  );
}