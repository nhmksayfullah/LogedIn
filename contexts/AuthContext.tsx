'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Session, 
  User, 
  SupabaseClient, 
  AuthTokenResponse 
} from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  supabase: SupabaseClient;
  signInWithGoogle: (redirectPath?: string) => Promise<void>;
  signInWithTwitter: (redirectPath?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{
    user: User | null;
    session: Session | null;
  }>;
  signOut: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ 
    data: { user: User | null } | null; 
    error: Error | null;
  }>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasLifetimeAccess: boolean;
  profilePictureUrl: string | null;
  username: string | null;
  refreshProfilePicture: () => Promise<void>;
  coverPhotoUrl: string | null;
  coverColor: string;
  refreshCoverPhoto: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface PurchasePayload {
  new: {
    user_id: string;
    [key: string]: any;
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLifetimeAccess, setHasLifetimeAccess] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [coverColor, setCoverColor] = useState<string>('#1DA1F2');

  const checkPurchase = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) {
        console.error('Purchase check error:', error);
        setHasLifetimeAccess(false);
        return;
      }

      const hasAccess = data?.status === 'active' && data?.purchase_type === 'lifetime_pro';
      setHasLifetimeAccess(!!hasAccess);
      console.log("AuthContext - set hasLifetimeAccess:", hasAccess);
    } catch (error) {
      console.error('Purchase check error:', error);
      setHasLifetimeAccess(false);
    }
  }, []);

  const refreshProfilePicture = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('profile_picture_url, avatar_url, username, cover_photo_url, cover_color')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        const pictureUrl = data.profile_picture_url || data.avatar_url;
        setProfilePictureUrl(pictureUrl);
        setUsername(data.username);
        setCoverPhotoUrl(data.cover_photo_url);
        setCoverColor(data.cover_color || '#1DA1F2');
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  }, [user?.id]);

  const refreshCoverPhoto = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('cover_photo_url, cover_color')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setCoverPhotoUrl(data.cover_photo_url);
        setCoverColor(data.cover_color || '#1DA1F2');
      }
    } catch (error) {
      console.error('Error fetching cover photo:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    console.log("AuthContext - mounted useEffect:", mounted);
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log("AuthContext - Starting Try in InitializeAuth!");

        // // First, get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !mounted) {
          setIsLoading(false);
          return;
        }

        // Update initial state
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await checkPurchase(currentUser.id);
          
          // Fetch profile picture and username
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('profile_picture_url, avatar_url, username')
              .eq('id', currentUser.id)
              .maybeSingle();

            if (userData) {
              const pictureUrl = userData.profile_picture_url || userData.avatar_url;
              setProfilePictureUrl(pictureUrl);
              setUsername(userData.username);
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
          }
        }
        
        // Then set up listener for future changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (!mounted) return;
            
            const newUser = newSession?.user ?? null;
            setSession(newSession);
            setUser(newUser);
            
            if (newUser) {
              await checkPurchase(newUser.id);
              
              // Fetch profile picture and username
              try {
                const { data: userData } = await supabase
                  .from('users')
                  .select('profile_picture_url, avatar_url, username')
                  .eq('id', newUser.id)
                  .maybeSingle();

                if (userData) {
                  const pictureUrl = userData.profile_picture_url || userData.avatar_url;
                  setProfilePictureUrl(pictureUrl);
                  setUsername(userData.username);
                }
              } catch (err) {
                console.error('Error fetching user data:', err);
              }
            } else {
              setHasLifetimeAccess(false);
              setProfilePictureUrl(null);
              setUsername(null);
            }
          }
        );

        // Only set loading to false after everything is initialized
        if (mounted) setIsLoading(false);
        
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();
  }, [checkPurchase]);

  const value = {
    user,
    session,
    isLoading,
    supabase,
    signInWithGoogle: async (redirectPath = '/dashboard') => {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
    },
    signInWithTwitter: async (redirectPath = '/dashboard') => {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;
      await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl
        }
      });
    },
    signInWithEmail: async (email: string, password: string) => {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;

      // Check if user was previously soft-deleted
      const { data: profile } = await supabase
        .from('users')
        .select('is_deleted, deleted_at')
        .eq('id', authData.user?.id)
        .single();

      if (profile?.is_deleted) {
        // Reactivate the account
        await supabase
          .from('users')
          .update({ 
            is_deleted: false, 
            deleted_at: null,
            reactivated_at: new Date().toISOString() 
          })
          .eq('id', authData.user?.id);

        // You could trigger a welcome back notification here
      }

      return authData;
    },
    signOut: async () => {
      try {
        // First cleanup all active connections/states
        window.dispatchEvent(new Event('cleanup-before-logout'));
        
        // Wait a small amount of time for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then perform the actual signout
        await supabase.auth.signOut();
        
        // Clear local state immediately
        setUser(null);
        setSession(null);
        setHasLifetimeAccess(false);
        setProfilePictureUrl(null);
        setUsername(null);
        
        // Only redirect if not already on landing page
        if (window.location.pathname !== '/') {
          window.location.assign('/');
        } else {
          // If already on landing page, just reload to ensure clean state
          window.location.reload();
        }
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    signUpWithEmail: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return { data, error };
    },
    updatePassword: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    },
    updateEmail: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      if (error) throw error;
    },
    resetPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });
      if (error) throw error;
    },
    deleteAccount: async () => {
      // First delete user data from any related tables
      const { error: dataError } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id);
      
      if (dataError) throw dataError;

      // Then delete the user's purchase if it exists
      const { error: purchaseError } = await supabase
        .from('purchases')
        .delete()
        .eq('user_id', user?.id);

      if (purchaseError) throw purchaseError;

      // Finally delete the user's auth account
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user?.id as string
      );

      if (authError) throw authError;

      // Sign out after successful deletion
      await supabase.auth.signOut();
    },
    hasLifetimeAccess,
    profilePictureUrl,
    username,
    refreshProfilePicture,
    coverPhotoUrl,
    coverColor,
    refreshCoverPhoto,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 