"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Globe, Lock, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Journey } from '@/hooks/useJourneys';

interface JourneyCardProps {
  journey: Journey;
  index: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function JourneyCard({ journey, index, onClick, onEdit, onDelete }: JourneyCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    onDelete();
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden group relative"
        onClick={onClick}
      >
        {/* Cover Image */}
        <div 
          className="h-40 flex items-center justify-center relative"
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
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Action Menu Button */}
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all"
            >
              <MoreVertical className="w-4 h-4 text-slate-700" />
            </button>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50"
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-500 transition-colors line-clamp-1 flex-1">
              {journey.title}
            </h3>
            {journey.is_public ? (
              <Globe className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
            ) : (
              <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
            )}
          </div>

          {journey.description && (
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {journey.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-slate-500">
              <span className="font-medium">{journey.version_count || 0} versions</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(journey.updated_at)}</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelDelete}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Delete Journey?
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Are you sure you want to delete &quot;{journey.title}&quot;? This will also delete all versions and photos. This action cannot be undone.
                  </p>
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                    >
                      Delete Journey
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
