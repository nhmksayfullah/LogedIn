import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Camera, Trash2, Upload, User } from 'lucide-react';

export function AccountManagement() {
  const { user, signOut, refreshProfilePicture } = useAuth();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [hasCustomPicture, setHasCustomPicture] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsUploadingPicture(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload profile picture');
      }

      const data = await response.json();
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

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-200">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-4 border-slate-200">
            {profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={profilePictureUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-slate-400" />
            )}
          </div>
          
          {/* Upload overlay */}
          <button
            onClick={handleProfilePictureClick}
            disabled={isUploadingPicture}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          >
            {isUploadingPicture ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-white" />
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
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleProfilePictureClick}
            disabled={isUploadingPicture}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-landing-small disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {hasCustomPicture ? 'Change' : 'Upload'} Picture
          </button>
          
          {hasCustomPicture && (
            <button
              onClick={handleRemoveProfilePicture}
              disabled={isUploadingPicture}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-landing-small disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-landing-small mt-2">{error}</p>
        )}

        <p className="text-landing-tiny text-slate-500 mt-2 text-center">
          Max 5MB • JPEG, PNG, WebP, or GIF
        </p>
      </div>

      {/* User Information */}
      <div className="space-y-3">
        {username && (
          <div className="flex items-center justify-between py-3 border-b border-slate-200">
            <span className="text-landing-small text-slate-600">
              {isTwitterUser ? 'X Handle' : 'Username'}
            </span>
            <span className="text-landing-body font-medium text-slate-900">
              {isTwitterUser ? `@${username}` : username}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-3 border-b border-slate-200">
          <span className="text-landing-small text-slate-600">Email</span>
          <span className="text-landing-body font-medium text-slate-900">{user?.email}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-slate-200">
          <span className="text-landing-small text-slate-600">Last Sign In</span>
          <span className="text-landing-body font-medium text-slate-900">
            {new Date(user?.last_sign_in_at || '').toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-landing-small text-slate-600">Account Type</span>
          <span className="text-landing-body font-medium text-slate-900">
            {isTwitterUser ? 'X Account' : isGoogleUser ? 'Google Account' : 'Email Account'}
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        {!isOAuthUser && (
          <button
            onClick={() => router.push(`/reset-password?email=${encodeURIComponent(user?.email || '')}`)}
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-lg font-medium transition-colors text-landing-small border border-slate-200"
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-slate-900">Delete Account?</h3>
            <p className="text-slate-600 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            {error && (
              <p className="text-red-500 mb-4">{error}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-slate-600"
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