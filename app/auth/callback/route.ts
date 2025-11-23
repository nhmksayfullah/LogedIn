import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('AuthCallback: Processing callback');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code) {
    console.log('AuthCallback: Exchanging code for session');
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('AuthCallback: Error:', error);
      return NextResponse.redirect(new URL('/?error=auth-failed', requestUrl.origin));
    }

    // Check if user signed in with OAuth and has a profile picture
    if (sessionData?.user) {
      const user = sessionData.user;
      const provider = user.app_metadata?.provider;
      
      // Extract avatar URL, username, and name from OAuth providers
      let avatarUrl = null;
      let username = null;
      let name = null;
      
      if (provider === 'google') {
        if (user.user_metadata?.avatar_url) {
          avatarUrl = user.user_metadata.avatar_url;
        }
        // Extract name from Google profile
        if (user.user_metadata?.full_name) {
          name = user.user_metadata.full_name;
        } else if (user.user_metadata?.name) {
          name = user.user_metadata.name;
        }
        // Extract username from Gmail address (part before @)
        if (user.email) {
          const emailParts = user.email.split('@');
          if (emailParts.length > 0) {
            username = emailParts[0];
          }
        }
      } else if (provider === 'twitter') {
        if (user.user_metadata?.avatar_url) {
          avatarUrl = user.user_metadata.avatar_url;
        }
        // Extract name from Twitter profile
        if (user.user_metadata?.full_name) {
          name = user.user_metadata.full_name;
        } else if (user.user_metadata?.name) {
          name = user.user_metadata.name;
        }
        // Extract Twitter/X handle (username)
        if (user.user_metadata?.user_name || user.user_metadata?.preferred_username) {
          username = user.user_metadata.user_name || user.user_metadata.preferred_username;
          // Remove @ symbol if present
          if (username && username.startsWith('@')) {
            username = username.substring(1);
          }
        }
      }
      
      // Ensure username is unique by adding suffix if needed
      if (username) {
        let finalUsername = username;
        let suffix = 1;
        let isUnique = false;
        
        while (!isUnique) {
          // Check if username already exists for a different user
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('username', finalUsername)
            .neq('id', user.id)
            .maybeSingle();
          
          if (checkError) {
            console.error('AuthCallback: Error checking username uniqueness:', checkError);
            break;
          }
          
          if (existingUser) {
            // Username exists, try with suffix
            finalUsername = `${username}${suffix}`;
            suffix++;
          } else {
            // Username is unique
            isUnique = true;
          }
          
          // Safety limit to prevent infinite loop
          if (suffix > 100) {
            console.error('AuthCallback: Too many attempts to find unique username');
            finalUsername = `${username}${Date.now()}`;
            break;
          }
        }
        
        username = finalUsername;
      }
      
      // Build update object with available data
      const updateData: { avatar_url?: string; username?: string; name?: string } = {};
      if (avatarUrl) updateData.avatar_url = avatarUrl;
      if (username) updateData.username = username;
      if (name) updateData.name = name;
      
      // Store data in users table if available
      if (Object.keys(updateData).length > 0) {
        console.log('AuthCallback: Storing OAuth data:', updateData);
        
        // First, check if user exists in users table
        const { data: existingUserData } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (existingUserData) {
          // User exists, update the record
          const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);
          
          if (updateError) {
            console.error('AuthCallback: Error updating user data:', updateError);
          } else {
            console.log('AuthCallback: Successfully updated OAuth data');
          }
        } else {
          // User doesn't exist, insert new record
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              ...updateData
            });
          
          if (insertError) {
            console.error('AuthCallback: Error inserting user data:', insertError);
          } else {
            console.log('AuthCallback: Successfully inserted OAuth data');
          }
        }
      }
    }

    // Redirect to the next page if provided, otherwise go to dashboard
    if (next) {
      console.log('AuthCallback: Redirecting to:', next);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    console.log('AuthCallback: Success, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  }

  console.log('AuthCallback: No code present, redirecting to home');
  return NextResponse.redirect(new URL('/', requestUrl.origin));
} 