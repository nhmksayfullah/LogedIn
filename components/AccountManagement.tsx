import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Camera, Trash2, Upload, User, Image as ImageIcon, BadgeCheck } from 'lucide-react';
import { ColorPicker } from '@/components/ColorPicker';

interface AccountManagementProps {
  isVerified?: boolean;
}

export function AccountManagement({ isVerified = false }: AccountManagementProps) {
  const { user, signOut, refreshProfilePicture } = useAuth();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [hasCustomPicture, setHasCustomPicture] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cover photo states
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [coverColor, setCoverColor] = useState<string>('#1DA1F2');
  const [hasCoverPhoto, setHasCoverPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile settings states
  const [isPublic, setIsPublic] = useState(false);
  const [bio, setBio] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Check if user signed in with OAuth
  const isOAuthUser = user?.app_metadata?.provider === 'google' || user?.app_metadata?.provider === 'twitter';
  const isTwitterUser = user?.app_metadata?.provider === 'twitter';
  const isGoogleUser = user?.app_metadata?.provider === 'google';

  // Fetch profile picture on mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/user/profile-picture');
        if (response.ok) {
          const data = await response.json();
          setProfilePictureUrl(data.profilePictureUrl);
          setHasCustomPicture(data.hasCustomPicture);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [user?.id]);

  // Fetch cover photo on mount
  useEffect(() => {
    const fetchCoverPhoto = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/user/cover-photo');
        if (response.ok) {
          const data = await response.json();
          setCoverPhotoUrl(data.coverPhotoUrl);
          setCoverColor(data.coverColor || '#1DA1F2');
          setHasCoverPhoto(data.hasCoverPhoto);
        }
      } catch (error) {
        console.error('Error fetching cover photo:', error);
      }
    };

    fetchCoverPhoto();
  }, [user?.id]);

  // Fetch profile settings on mount
  useEffect(() => {
    const fetchProfileSettings = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/user/username');
        if (response.ok) {
          const data = await response.json();
          setIsPublic(data.isPublic || false);
          setBio(data.bio || '');
          setName(data.name || '');
        }
      } catch (error) {
        console.error('Error fetching profile settings:', error);
      }
    };

    fetchProfileSettings();
  }, [user?.id]);

  // Fetch username from database
  useEffect(() => {
    const fetchUsername = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/user/username`);
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, [user?.id]);

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/user/delete?userId=${user.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', { name: file.name, type: file.type, size: file.size });

    setIsUploadingPicture(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file to /api/user/profile-picture...');

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const data = await response.json();
        console.error('Upload failed:', data);
        throw new Error(data.error || 'Failed to upload profile picture');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      setProfilePictureUrl(data.profilePictureUrl);
      setHasCustomPicture(true);
      
      // Refresh profile picture in AuthContext for other components
      await refreshProfilePicture();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload profile picture');
    } finally {
      setIsUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!hasCustomPicture) return;

    setIsUploadingPicture(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove profile picture');
      }

      // Fetch updated profile picture (will show OAuth avatar if available)
      const getResponse = await fetch('/api/user/profile-picture');
      if (getResponse.ok) {
        const data = await getResponse.json();
        setProfilePictureUrl(data.profilePictureUrl);
        setHasCustomPicture(data.hasCustomPicture);
      } else {
        setProfilePictureUrl(null);
        setHasCustomPicture(false);
      }
      
      // Refresh profile picture in AuthContext for other components
      await refreshProfilePicture();
    } catch (error) {
      console.error('Remove error:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  // Cover photo handlers
  const handleCoverPhotoClick = () => {
    coverFileInputRef.current?.click();
  };

  const handleCoverFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/cover-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload cover photo');
      }

      const data = await response.json();
      setCoverPhotoUrl(data.coverPhotoUrl);
      setHasCoverPhoto(true);
    } catch (error) {
      console.error('Cover upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload cover photo');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = '';
      }
    }
  };

  const handleCoverColorChange = async (color: string) => {
    setIsUploadingCover(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('color', color);

      const response = await fetch('/api/user/cover-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update cover color');
      }

      setCoverColor(color);
    } catch (error) {
      console.error('Color update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update cover color');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleRemoveCoverPhoto = async () => {
    if (!hasCoverPhoto) return;

    setIsUploadingCover(true);
    setError('');

    try {
      const response = await fetch('/api/user/cover-photo', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove cover photo');
      }

      setCoverPhotoUrl(null);
      setHasCoverPhoto(false);
    } catch (error) {
      console.error('Remove cover error:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove cover photo');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleTogglePublic = async (checked: boolean) => {
    setIsUpdatingSettings(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: checked }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile visibility');
      }

      setIsPublic(checked);
    } catch (error) {
      console.error('Update visibility error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile visibility');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleBioSave = async () => {
    setIsUpdatingSettings(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update bio');
      }
    } catch (error) {
      console.error('Update bio error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update bio');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleNameSave = async () => {
    setIsUpdatingSettings(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update name');
      }
    } catch (error) {
      console.error('Update name error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg overflow-visible">
      {/* Cover Photo Section - YouTube ratio 6.2:1 (1546x423) */}
      <div className="relative w-full" style={{ paddingTop: '16.13%' }}>
        {/* Cover background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: coverColor,
            backgroundImage: coverPhotoUrl ? `url(${coverPhotoUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Cover photo controls */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
          <button
            onClick={handleCoverPhotoClick}
            disabled={isUploadingCover}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/50 dark:bg-slate-700/80 hover:bg-black/70 dark:hover:bg-slate-700 backdrop-blur-sm text-white rounded-lg font-medium transition-colors text-xs sm:text-landing-tiny disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload cover photo"
          >
            {isUploadingCover ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="hidden xs:inline">Photo</span>
          </button>
          
          <ColorPicker
            value={coverColor}
            onChange={handleCoverColorChange}
            disabled={isUploadingCover}
            className="[&>button]:bg-black/50 [&>button]:dark:bg-slate-700/80 [&>button]:hover:bg-black/70 [&>button]:dark:hover:bg-slate-700 [&>button]:backdrop-blur-sm [&>button]:text-white [&>button]:border-transparent [&>button]:text-xs [&>button]:sm:text-landing-tiny [&>button]:px-2 [&>button]:sm:px-3 [&>button]:py-1.5 [&>button]:sm:py-2 [&>button_.w-5]:w-3 [&>button_.w-5]:h-3 [&>button_.w-5]:sm:w-4 [&>button_.w-5]:sm:h-4 [&>button_.w-4]:w-3 [&>button_.w-4]:h-3 [&>button_.w-4]:sm:w-4 [&>button_.w-4]:sm:h-4 [&>button>span:not(.hidden)]:hidden [&>button>span:not(.hidden)]:xs:inline"
          />
          
          {hasCoverPhoto && (
            <button
              onClick={handleRemoveCoverPhoto}
              disabled={isUploadingCover}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm text-white rounded-lg font-medium transition-colors text-xs sm:text-landing-tiny disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove cover photo"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Hidden file input for cover photo */}
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleCoverFileChange}
          className="hidden"
        />
      </div>

      {/* Profile section with overlap */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Profile Picture - positioned to overlap cover */}
        <div className="flex flex-col items-center -mt-12 sm:-mt-16 mb-3 sm:mb-4">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white dark:bg-slate-700 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
              {profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={profilePictureUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            
            {/* Upload overlay */}
            <button
              onClick={handleProfilePictureClick}
              disabled={isUploadingPicture}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
            >
              {isUploadingPicture ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload/Remove buttons */}
          <div className="flex gap-2 mt-3 sm:mt-4">
            <button
              onClick={handleProfilePictureClick}
              disabled={isUploadingPicture}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-xs sm:text-landing-small disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{hasCustomPicture ? 'Change' : 'Upload'} Picture</span>
              <span className="xs:hidden">{hasCustomPicture ? 'Change' : 'Upload'}</span>
            </button>
            
            {hasCustomPicture && (
              <button
                onClick={handleRemoveProfilePicture}
                disabled={isUploadingPicture}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-xs sm:text-landing-small disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Remove</span>
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-xs sm:text-landing-small mt-2">{error}</p>
          )}

          <p className="text-xs sm:text-landing-tiny text-slate-500 dark:text-slate-400 mt-2 text-center px-2">
            Profile: Max 5MB • Cover: Max 10MB • JPEG, PNG, WebP, or GIF
          </p>
        </div>

        </div>

        {/* User Information */}
        <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-gray-700 overflow-visible">
          {/* Profile Visibility Toggle */}
          <div className="pb-4 border-b border-slate-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-landing-body font-semibold text-slate-900 dark:text-white">Public Profile</h3>
                <p className="text-landing-tiny text-slate-500 dark:text-slate-400 mt-0.5">
                  {isPublic 
                    ? `Anyone can view your profile at /${username}`
                    : 'Your profile is private'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => handleTogglePublic(e.target.checked)}
                  disabled={isUpdatingSettings}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {/* Name Editor */}
            <div className="mt-3">
              <label className="block text-landing-small font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-landing-small bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name..."
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-landing-tiny text-slate-500 dark:text-slate-400">
                  {name.length}/100 characters
                </span>
                <button
                  onClick={handleNameSave}
                  disabled={isUpdatingSettings}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-landing-tiny disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingSettings ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </div>

            {/* Bio Editor */}
            <div className="mt-3">
              <label className="block text-landing-small font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-landing-small bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell people about yourself..."
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-landing-tiny text-slate-500 dark:text-slate-400">
                  {bio.length}/500 characters
                </span>
                <button
                  onClick={handleBioSave}
                  disabled={isUpdatingSettings}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-landing-tiny disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingSettings ? 'Saving...' : 'Save Bio'}
                </button>
              </div>
            </div>
          </div>
          
          {username && (
          <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-gray-700">
            <span className="text-landing-small text-slate-600 dark:text-slate-400">
              {isTwitterUser ? 'X Handle' : 'Username'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-landing-body font-medium text-slate-900 dark:text-white">
                {isTwitterUser ? `@${username}` : username}
              </span>
              {isVerified && (
                <div className="relative group">
                  <BadgeCheck className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 cursor-help" />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Verified Profile
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-gray-700">
          <span className="text-landing-small text-slate-600 dark:text-slate-400">Email</span>
          <span className="text-landing-body font-medium text-slate-900 dark:text-white">{user?.email}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-gray-700">
          <span className="text-landing-small text-slate-600 dark:text-slate-400">Last Sign In</span>
          <span className="text-landing-body font-medium text-slate-900 dark:text-white">
            {new Date(user?.last_sign_in_at || '').toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-landing-small text-slate-600 dark:text-slate-400">Account Type</span>
          <span className="text-landing-body font-medium text-slate-900 dark:text-white">
            {isTwitterUser ? 'X Account' : isGoogleUser ? 'Google Account' : 'Email Account'}
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        {!isOAuthUser && (
          <button
            onClick={() => router.push(`/reset-password?email=${encodeURIComponent(user?.email || '')}`)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors text-landing-small border border-slate-200 dark:border-gray-600"
          >
            Reset Password
          </button>
        )}

        {/* <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full text-left px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
        >
          Delete Account
        </button> */}
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Delete Account?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            {error && (
              <p className="text-red-500 mb-4">{error}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 