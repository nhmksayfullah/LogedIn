'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Upload, X, RotateCcw, Check, Move, ZoomIn } from 'lucide-react';

interface PhotoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImage: Blob) => void;
  aspectRatio?: number; // e.g., 1 for profile picture (square), 6.2/1 for cover photo
  title?: string;
  maxWidth?: number;
  maxHeight?: number;
  imageFile?: File | null;
  initialImageUrl?: string | null;
}

export function PhotoEditor({
  isOpen,
  onClose,
  onSave,
  aspectRatio = 1,
  title = 'Edit Photo',
  maxWidth = 1200,
  maxHeight = 1200,
  imageFile: externalImageFile,
  initialImageUrl,
}: PhotoEditorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageUrl || null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [blur, setBlur] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update when external file changes
  useEffect(() => {
    if (externalImageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(externalImageFile);
    }
  }, [externalImageFile]);

  // Load initial image URL if provided
  useEffect(() => {
    if (initialImageUrl && !externalImageFile) {
      setImageSrc(initialImageUrl);
    }
  }, [initialImageUrl, externalImageFile]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Maximum 10MB allowed.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        // Reset adjustments
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setBlur(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    blur = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    // Apply blur if needed
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(canvas, 0, 0);
    }

    // Resize to max dimensions while maintaining aspect ratio
    let finalWidth = pixelCrop.width;
    let finalHeight = pixelCrop.height;

    if (finalWidth > maxWidth || finalHeight > maxHeight) {
      const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
      finalWidth = Math.round(finalWidth * ratio);
      finalHeight = Math.round(finalHeight * ratio);

      const resizeCanvas = document.createElement('canvas');
      resizeCanvas.width = finalWidth;
      resizeCanvas.height = finalHeight;
      const resizeCtx = resizeCanvas.getContext('2d');
      
      if (resizeCtx) {
        resizeCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);
        return new Promise((resolve) => {
          resizeCanvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/jpeg', 0.95);
        });
      }
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        blur
      );
      onSave(croppedImage);
      handleClose();
    } catch (e) {
      console.error('Error cropping image:', e);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setBlur(0);
    onClose();
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setBlur(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {!imageSrc ? (
            // Upload area
            <div className="flex items-center justify-center h-full min-h-[400px] p-8">
              <div className="text-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      Upload a photo
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      JPEG, PNG, WebP, or GIF (max 10MB)
                    </p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row h-full min-h-[400px]">
              {/* Cropper area */}
              <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 min-h-[300px] lg:min-h-0">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  style={{
                    containerStyle: {
                      filter: blur > 0 ? `blur(${blur}px)` : 'none',
                    },
                  }}
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Drag to reposition
                </div>
              </div>

              {/* Controls */}
              <div className="w-full lg:w-80 p-6 space-y-6 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700">
                {/* Zoom */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <ZoomIn className="w-4 h-4" />
                      Zoom
                    </label>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Rotation
                    </label>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {rotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Blur */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">
                      Blur
                    </label>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {blur}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Reset button */}
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </button>

                {/* Change photo button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Change Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {imageSrc && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Photo
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
