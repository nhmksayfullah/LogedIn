"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useVersions } from '@/hooks/useVersions';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Calendar, Hash, Tag, X, /* Edit2, */ Trash2, Globe, Lock } from 'lucide-react';

interface Journey {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function JourneyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const journeyId = params.id as string;
  
  const { versions, isLoading: isLoadingVersions, createVersion, deleteVersion, refetch } = useVersions(journeyId);
  
  // Version modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [newVersionDate, setNewVersionDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVersionTags, setNewVersionTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourney = async () => {
      if (!journeyId || !user?.id) return;

      try {
        const { data, error } = await supabase
          .from('journeys')
          .select('*')
          .eq('id', journeyId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setJourney(data);
      } catch (err) {
        console.error('Error fetching journey:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJourney();
  }, [journeyId, user?.id]);

  const handleCreateVersion = async () => {
    if (!newVersionTitle.trim()) {
      setCreateError('Please enter a version title');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      // Parse tags from comma-separated string
      const tags = newVersionTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await createVersion({
        title: newVersionTitle,
        description: newVersionDescription || undefined,
        date: new Date(newVersionDate).toISOString(),
        tags: tags.length > 0 ? tags : undefined,
      });

      // Reset form and close modal
      setNewVersionTitle('');
      setNewVersionDescription('');
      setNewVersionDate(new Date().toISOString().split('T')[0]);
      setNewVersionTags('');
      setIsModalOpen(false);

      // Refetch versions
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (err) {
      console.error('Failed to create version:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to create version');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version?')) return;

    try {
      await deleteVersion(versionId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Failed to delete version');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const togglePublic = async () => {
    if (!journey) return;

    try {
      const { error } = await supabase
        .from('journeys')
        .update({ is_public: !journey.is_public })
        .eq('id', journey.id);

      if (error) throw error;

      setJourney({ ...journey, is_public: !journey.is_public });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Failed to update privacy setting');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Journey not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-500 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journeys</span>
        </button>

        {/* Journey Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                {journey.title}
              </h1>
              {journey.description && (
                <p className="text-lg text-slate-600">
                  {journey.description}
                </p>
              )}
            </div>
            
            {/* Privacy Toggle */}
            <button
              onClick={togglePublic}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                journey.is_public
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {journey.is_public ? (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </>
              )}
            </button>
          </div>

          {/* Add Version Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Version</span>
          </button>
        </div>

        {/* Versions Timeline */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Timeline</h2>

          {isLoadingVersions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No versions yet
              </h3>
              <p className="text-slate-600 mb-6">
                Start documenting your transformation by adding your first version
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add First Version</span>
              </button>
            </div>
          ) : (
            versions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                        {version.version_number}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        {version.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(version.date)}</span>
                    </div>
                    {version.description && (
                      <p className="text-slate-600 whitespace-pre-wrap">
                        {version.description}
                      </p>
                    )}
                    {version.tags && version.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2 mt-4">
                        <Tag className="w-4 h-4 text-slate-400" />
                        {version.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteVersion(version.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create Version Modal */}
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
                    Add New Version
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
                      Version Title *
                    </label>
                    <input
                      type="text"
                      value={newVersionTitle}
                      onChange={(e) => setNewVersionTitle(e.target.value)}
                      placeholder="e.g., Hit my first milestone"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      maxLength={100}
                    />
                  </div>

                  {/* Date Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newVersionDate}
                      onChange={(e) => setNewVersionDate(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newVersionDescription}
                      onChange={(e) => setNewVersionDescription(e.target.value)}
                      placeholder="What changed? How do you feel? (optional)"
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                      maxLength={2000}
                    />
                  </div>

                  {/* Tags Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newVersionTags}
                      onChange={(e) => setNewVersionTags(e.target.value)}
                      placeholder="e.g., milestone, fitness, diet"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
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
                    onClick={handleCreateVersion}
                    disabled={isCreating || !newVersionTitle.trim()}
                    className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Version'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
