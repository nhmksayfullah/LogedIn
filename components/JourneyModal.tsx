"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Lock, Image as ImageIcon, Link2 } from 'lucide-react';
import { generateSlug, isValidSlug } from '@/utils/slug';
import { ColorPicker } from '@/components/ColorPicker';
import { PhotoEditor } from '@/components/PhotoEditor';

interface JourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JourneyFormData) => Promise<void>;
  initialData?: JourneyFormData;
  mode: 'create' | 'edit';
  journeyId?: string; // For editing existing journeys
}

export interface JourneyFormData {
  title: string;
  description: string;
  is_public: boolean;
  cover_image_url?: string | null;
  cover_color?: string | null;
  slug?: string;
}

export function JourneyModal({ isOpen, onClose, onSave, initialData, mode, journeyId }: JourneyModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Slug state
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  
  // Cover photo/color states
  const [coverType, setCoverType] = useState<'color' | 'photo'>('color');
  const [coverColor, setCoverColor] = useState('#3B82F6');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // Photo editor states
  const [isCoverEditorOpen, setIsCoverEditorOpen] = useState(false);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setIsPublic(initialData?.is_public || false);
      setSlug(initialData?.slug || '');
      setIsSlugManuallyEdited(false);
      setCoverColor(initialData?.cover_color || '#3B82F6');
      setCoverPhotoPreview(initialData?.cover_image_url || null);
      setCoverType(initialData?.cover_image_url ? 'photo' : 'color');
      setCoverPhoto(null);
      setError(null);
      setSlugError(null);
    }
  }, [isOpen, initialData]);

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited && title) {
      const generatedSlug = generateSlug(title);
      setSlug(generatedSlug);
      setSlugError(null);
    }
  }, [title, isSlugManuallyEdited]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase();
    setSlug(newSlug);
    setIsSlugManuallyEdited(true);
    
    if (newSlug && !isValidSlug(newSlug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
    } else {
      setSlugError(null);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a journey title');
      return;
    }

    if (!slug.trim()) {
      setError('Please enter a journey URL');
      return;
    }

    if (!isValidSlug(slug)) {
      setError('Journey URL can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let coverImageUrl = initialData?.cover_image_url || null;
      const finalCoverColor = coverColor;

      // Handle cover photo/color upload for edit mode
      if (mode === 'edit' && journeyId) {
        if (coverType === 'photo' && coverPhoto) {
          // Upload new cover photo
          setIsUploadingCover(true);
          const photoFormData = new FormData();
          photoFormData.append('file', coverPhoto);
          photoFormData.append('journeyId', journeyId);

          const uploadResponse = await fetch('/api/journey/cover-photo', {
            method: 'POST',
            body: photoFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload cover photo');
          }

          const uploadData = await uploadResponse.json();
          coverImageUrl = uploadData.coverPhotoUrl;
          setIsUploadingCover(false);
        } else if (coverType === 'color') {
          // Update color and remove photo if exists
          const colorFormData = new FormData();
          colorFormData.append('color', coverColor);
          colorFormData.append('journeyId', journeyId);

          await fetch('/api/journey/cover-photo', {
            method: 'POST',
            body: colorFormData,
          });

          if (initialData?.cover_image_url) {
            // Remove old photo
            await fetch('/api/journey/cover-photo', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ journeyId }),
            });
            coverImageUrl = null;
          }
        }
      }

      await onSave({
        title: title.trim(),
        description: description.trim(),
        is_public: isPublic,
        cover_image_url: coverImageUrl,
        cover_color: finalCoverColor,
        slug: slug.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save journey:', err);
      setError(err instanceof Error ? err.message : 'Failed to save journey');
    } finally {
      setIsSaving(false);
      setIsUploadingCover(false);
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Maximum 10MB allowed.');
        return;
      }

      setSelectedCoverFile(file);
      setIsCoverEditorOpen(true);
      setError(null);
    }
  };

  const handleCoverPhotoSave = async (croppedImage: Blob) => {
    setCoverPhoto(new File([croppedImage], 'cover.jpg', { type: 'image/jpeg' }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPhotoPreview(reader.result as string);
      setCoverType('photo');
    };
    reader.readAsDataURL(croppedImage);
  };

  const handleRemoveCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoPreview(null);
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {mode === 'create' ? 'Create New Journey' : 'Edit Journey'}
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSaving}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                {/* Cover Selection */}
                {(
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Journey Cover
                    </label>
                    <div className="flex gap-2">
                      {/* Color Picker */}
                      <ColorPicker
                        value={coverColor}
                        onChange={(color) => {
                          setCoverColor(color);
                          setCoverType('color');
                        }}
                        disabled={isSaving}
                      />
                      
                      {/* Photo Picker */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('journey-cover-upload') as HTMLInputElement;
                            input?.click();
                          }}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {coverPhotoPreview ? (
                            <div 
                              className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-cover bg-center"
                              style={{ backgroundImage: `url(${coverPhotoPreview})` }}
                            />
                          ) : (
                            <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700" />
                          )}
                          <span className="text-sm text-slate-700 dark:text-slate-300">Photo</span>
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                        </button>
                        <input
                          id="journey-cover-upload"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleCoverPhotoChange}
                          disabled={isSaving}
                        />
                      </div>

                      {/* Remove Photo Button */}
                      {coverPhotoPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveCoverPhoto}
                          disabled={isSaving}
                          className="px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Journey Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Body Transformation 2025"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    maxLength={100}
                    disabled={isSaving}
                  />
                </div>

                {/* Slug Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-2">
                    <Link2 className="w-4 h-4" />
                    <span>Journey URL *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="my-journey"
                      className={`w-full px-4 py-3 border ${slugError ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                      maxLength={100}
                      disabled={isSaving}
                    />
                  </div>
                  {slugError ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{slugError}</p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your journey will be accessible at: {isPublic ? `/{'{username}'}/${slug || 'your-journey'}` : `/journey/${slug || 'your-journey'}`}
                    </p>
                  )}
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this journey about? (optional)"
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    maxLength={500}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {description.length}/500 characters
                  </p>
                </div>

                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isPublic ? (
                      <Globe className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {isPublic ? 'Public' : 'Private'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {isPublic 
                          ? 'Anyone can view this journey'
                          : 'Only you can see this journey'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    disabled={isSaving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      isPublic ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
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
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleClose}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isUploadingCover || !title.trim() || !slug.trim() || !!slugError}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingCover ? 'Uploading...' : isSaving ? 'Saving...' : mode === 'create' ? 'Create Journey' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Cover Photo Editor */}
          <PhotoEditor
            isOpen={isCoverEditorOpen}
            onClose={() => {
              setIsCoverEditorOpen(false);
              setSelectedCoverFile(null);
            }}
            onSave={handleCoverPhotoSave}
            aspectRatio={6.2 / 1}
            title="Edit Journey Cover Photo"
            maxWidth={1546}
            maxHeight={423}
            imageFile={selectedCoverFile}
          />
        </>
      )}
    </AnimatePresence>
  );
}
