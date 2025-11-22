import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function AccountManagement() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user signed in with OAuth
  const isOAuthUser = user?.app_metadata?.provider === 'google';

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
      router.push('/login');
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {/* User Information */}
      <div className="space-y-3">
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
            {isOAuthUser ? 'Google Account' : 'Email Account'}
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