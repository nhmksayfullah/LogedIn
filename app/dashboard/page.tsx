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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4 mx-auto"></div>
          <p className="text-foreground">Loading...</p>
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
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 mt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Journeys</h1>
            <p className="text-slate-600 mt-2">
              Track your transformations, one version at a time
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Start New Journey</span>
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
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
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
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
          >
            <p className="text-slate-700">
              You&apos;re on the <span className="font-semibold">Free Plan</span> ({journeyLimits.currentCount}/{journeyLimits.limit} journey used).{' '}
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-blue-600 font-semibold hover:underline"
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
            className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 text-center shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-2">Journey Limit Reached</h3>
            <p className="mb-6 text-blue-50">
              You&apos;ve reached your limit of {journeyLimits.limit} journey on the Free plan. 
              Upgrade to Lifetime Pro for unlimited journeys, custom themes, and more!
            </p>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
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