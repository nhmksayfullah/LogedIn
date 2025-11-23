"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Lock, Upload, Image as ImageIcon, Palette, Link2 } from 'lucide-react';
import { generateSlug, isValidSlug } from '@/utils/slug';

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
      let finalCoverColor = coverColor;

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

      setCoverPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
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
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">
                  {mode === 'create' ? 'Create New Journey' : 'Edit Journey'}
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSaving}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                {/* Cover Type Selection (only in edit mode) */}
                {mode === 'edit' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Journey Cover
                    </label>
                    <div className="flex space-x-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setCoverType('color')}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          coverType === 'color'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-300 hover:border-slate-400 text-slate-600'
                        }`}
                        disabled={isSaving}
                      >
                        <Palette className="w-4 h-4" />
                        <span className="font-medium">Color</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverType('photo')}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          coverType === 'photo'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-300 hover:border-slate-400 text-slate-600'
                        }`}
                        disabled={isSaving}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-medium">Photo</span>
                      </button>
                    </div>

                    {/* Color Picker */}
                    {coverType === 'color' && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={coverColor}
                            onChange={(e) => setCoverColor(e.target.value)}
                            className="w-16 h-16 rounded-lg border-2 border-slate-300 cursor-pointer"
                            disabled={isSaving}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">Selected Color</p>
                            <p className="text-xs text-slate-500 font-mono">{coverColor}</p>
                          </div>
                        </div>
                        <div 
                          className="w-full h-32 rounded-lg border border-slate-300"
                          style={{ backgroundColor: coverColor }}
                        />
                      </div>
                    )}

                    {/* Photo Upload */}
                    {coverType === 'photo' && (
                      <div>
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
                              disabled={isSaving}
                              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors disabled:opacity-50"
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
                              disabled={isSaving}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Journey Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Body Transformation 2025"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    maxLength={100}
                    disabled={isSaving}
                  />
                </div>

                {/* Slug Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                    <Link2 className="w-4 h-4" />
                    <span>Journey URL *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="my-journey"
                      className={`w-full px-4 py-3 border ${slugError ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                      maxLength={100}
                      disabled={isSaving}
                    />
                  </div>
                  {slugError ? (
                    <p className="text-xs text-red-600 mt-1">{slugError}</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">
                      Your journey will be accessible at: {isPublic ? `/{'{username}'}/${slug || 'your-journey'}` : `/journey/${slug || 'your-journey'}`}
                    </p>
                  )}
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this journey about? (optional)"
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                    maxLength={500}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {description.length}/500 characters
                  </p>
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
                    disabled={isSaving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
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
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
                <button
                  onClick={handleClose}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50"
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
        </>
      )}
    </AnimatePresence>
  );
}
