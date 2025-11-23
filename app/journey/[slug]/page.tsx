"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering - this page cannot be statically generated
export const dynamic = 'force-dynamic';
import { useVersions } from '@/hooks/useVersions';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Hash, X, Trash2, Globe, Lock, Settings, Upload } from 'lucide-react';
import { JourneyModal, JourneyFormData } from '@/components/JourneyModal';

interface Journey {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  cover_color: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function JourneyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const journeySlug = params.slug as string;
  
  const { versions, isLoading: isLoadingVersions, createVersion, deleteVersion, refetch } = useVersions(journey?.id || '');
  
  // Journey edit modal state
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  
  // Version modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [newVersionCoverPhoto, setNewVersionCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [newVersionDate, setNewVersionDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVersionTags, setNewVersionTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourney = async () => {
      if (!journeySlug || !user?.id) return;

      try {
        const { data, error } = await supabase
          .from('journeys')
          .select('*')
          .eq('slug', journeySlug)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeySlug, user?.id]);

  const handleEditJourney = async (data: JourneyFormData) => {
    if (!journey) return;
    
    try {
      const { error } = await supabase
        .from('journeys')
        .update({
          title: data.title,
          description: data.description || null,
          is_public: data.is_public,
          slug: data.slug,
          cover_image_url: data.cover_image_url !== undefined ? data.cover_image_url : journey.cover_image_url,
          cover_color: data.cover_color || journey.cover_color,
        })
        .eq('id', journey.id);

      if (error) throw error;

      // Update local state
      const updatedJourney = {
        ...journey,
        title: data.title,
        description: data.description || null,
        is_public: data.is_public,
        slug: data.slug || journey.slug,
        cover_image_url: data.cover_image_url !== undefined ? data.cover_image_url : journey.cover_image_url,
        cover_color: data.cover_color || journey.cover_color,
      };
      setJourney(updatedJourney);
      
      // If slug changed, redirect to new URL
      if (data.slug && data.slug !== journey.slug) {
        router.push(`/journey/${data.slug}`);
      }
      
      setIsJourneyModalOpen(false);
    } catch (err) {
      console.error('Failed to update journey:', err);
      throw err;
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionTitle.trim()) {
      setCreateError('Please enter a version title');
      return;
    }

    if (!journey) {
      setCreateError('Journey not found');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      let coverPhotoUrl: string | undefined = undefined;

      // Upload cover photo first if provided
      if (newVersionCoverPhoto) {
        setIsUploadingPhoto(true);
        const photoFormData = new FormData();
        photoFormData.append('file', newVersionCoverPhoto);
        photoFormData.append('journeyId', journey.id);

        const uploadResponse = await fetch('/api/version/cover-photo', {
          method: 'POST',
          body: photoFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload cover photo');
        }

        const uploadData = await uploadResponse.json();
        coverPhotoUrl = uploadData.coverPhotoUrl;
        setIsUploadingPhoto(false);
      }

      // Parse tags from comma-separated string
      const tags = newVersionTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await createVersion({
        title: newVersionTitle,
        description: newVersionDescription || undefined,
        cover_photo_url: coverPhotoUrl,
        date: new Date(newVersionDate).toISOString(),
        tags: tags.length > 0 ? tags : undefined,
      });

      // Reset form and close modal
      setNewVersionTitle('');
      setNewVersionDescription('');
      setNewVersionCoverPhoto(null);
      setCoverPhotoPreview(null);
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
      setIsUploadingPhoto(false);
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setCreateError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setCreateError('File size too large. Maximum 10MB allowed.');
        return;
      }

      setNewVersionCoverPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setCreateError(null);
    }
  };

  const handleRemoveCoverPhoto = () => {
    setNewVersionCoverPhoto(null);
    setCoverPhotoPreview(null);
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
      month: 'short', 
      day: 'numeric' 
    });
  };

  // const togglePublic = async () => {
  //   if (!journey) return;

  //   try {
  //     const { error } = await supabase
  //       .from('journeys')
  //       .update({ is_public: !journey.is_public })
  //       .eq('id', journey.id);

  //     if (error) throw error;

  //     setJourney({ ...journey, is_public: !journey.is_public });
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (err) {
  //     alert('Failed to update privacy setting');
  //   }
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Journey Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          {/* Cover Section */}
          <div 
            className="h-48 rounded-t-xl flex items-center justify-center relative"
            style={{
              background: journey.cover_image_url 
                ? 'none' 
                : `linear-gradient(135deg, ${journey.cover_color || '#3B82F6'} 0%, ${journey.cover_color ? `${journey.cover_color}dd` : '#2563EB'} 100%)`
            }}
          >
            {journey.cover_image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={journey.cover_image_url} 
                alt={journey.title}
                className="w-full h-full object-cover rounded-t-xl"
              />
            )}
            
            {/* Settings Button */}
            <button
              onClick={() => setIsJourneyModalOpen(true)}
              className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all backdrop-blur-sm"
            >
              <Settings className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  {journey.title}
                </h1>
                {journey.description && (
                  <p className="text-lg text-slate-600">
                    {journey.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-sm text-slate-500 mb-6">
              <div className="flex items-center space-x-2">
                {journey.is_public ? (
                  <>
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 font-medium">Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </>
                )}
              </div>
              <span>•</span>
              <span>Created {formatDate(journey.created_at)}</span>
            </div>

            {/* Add Version Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Add Milestone</span>
            </button>
          </div>
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
                No milestones yet
              </h3>
              <p className="text-slate-600 mb-6">
                Start documenting your journey by adding your first milestone
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add First Milestone</span>
              </button>
            </div>
          ) : (
            versions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Cover Photo */}
                {version.cover_photo_url && (
                  <div className="relative w-full h-64 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={version.cover_photo_url} 
                      alt={version.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-8">
                  {/* Date at the top left */}
                  <div className="mb-4">
                    <time className="text-sm font-medium text-slate-500">
                      {formatDate(version.date)}
                    </time>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                    {version.title}
                  </h3>

                  {/* Description with rich text styling */}
                  {version.description && (
                    <div 
                      className="prose prose-slate max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: version.description }}
                    />
                  )}

                  {/* Tags */}
                  {version.tags && version.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 mt-6 pt-6 border-t border-slate-200">
                      {version.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete Button - appears on hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteVersion(version.id)}
                    className="p-2.5 bg-white/95 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg shadow-lg backdrop-blur-sm transition-all"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Edit Journey Modal */}
      <JourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        onSave={handleEditJourney}
        journeyId={journey?.id}
        initialData={{
          title: journey?.title || '',
          description: journey?.description || '',
          is_public: journey?.is_public || false,
          slug: journey?.slug || '',
          cover_image_url: journey?.cover_image_url,
          cover_color: journey?.cover_color,
        }}
        mode="edit"
      />

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
                    Add New Milestone
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
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newVersionTitle}
                      onChange={(e) => setNewVersionTitle(e.target.value)}
                      placeholder="e.g., Launched my first Business"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      maxLength={100}
                    />
                  </div>

                  {/* Date Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newVersionDate}
                      onChange={(e) => setNewVersionDate(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Cover Photo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Cover Photo (optional)
                    </label>
                    
                    {coverPhotoPreview ? (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={coverPhotoPreview} 
                          alt="Cover preview" 
                          className="w-full h-48 object-cover rounded-lg border border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveCoverPhoto}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 text-slate-400 mb-3" />
                          <p className="mb-2 text-sm text-slate-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-slate-500">
                            PNG, JPG, WebP or GIF (max 10MB)
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleCoverPhotoChange}
                        />
                      </label>
                    )}
                  </div>

                  {/* Description Input with Rich Text Support */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newVersionDescription}
                      onChange={(e) => setNewVersionDescription(e.target.value)}
                      placeholder="Share your story, achievements, and reflections..."
                      rows={8}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all font-mono text-sm"
                      maxLength={5000}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      You can use bullet points (•) and formatting. HTML is supported.
                    </p>
                  </div>

                  {/* Tags Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tags (optional, comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newVersionTags}
                      onChange={(e) => setNewVersionTags(e.target.value)}
                      placeholder="e.g., milestone, business, achievement"
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
                    disabled={isCreating || isUploadingPhoto || !newVersionTitle.trim()}
                    className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingPhoto ? 'Uploading photo...' : isCreating ? 'Creating...' : 'Create Milestone'}
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
