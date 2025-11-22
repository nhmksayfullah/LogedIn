"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Lock } from 'lucide-react';

interface JourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JourneyFormData) => Promise<void>;
  initialData?: JourneyFormData;
  mode: 'create' | 'edit';
}

export interface JourneyFormData {
  title: string;
  description: string;
  is_public: boolean;
}

export function JourneyModal({ isOpen, onClose, onSave, initialData, mode }: JourneyModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setIsPublic(initialData?.is_public || false);
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a journey title');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        is_public: isPublic,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save journey:', err);
      setError(err instanceof Error ? err.message : 'Failed to save journey');
    } finally {
      setIsSaving(false);
    }
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
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Journey Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Body Transformation 2025"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    maxLength={100}
                    disabled={isSaving}
                  />
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
                  disabled={isSaving || !title.trim()}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : mode === 'create' ? 'Create Journey' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
