import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Get current user's profile picture
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with picture URLs
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('profile_picture_url, avatar_url')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch profile picture' }, { status: 500 });
    }

    // Return custom profile picture if available, otherwise OAuth avatar
    const profilePictureUrl = userData?.profile_picture_url || userData?.avatar_url;

    return NextResponse.json({ 
      profilePictureUrl,
      hasCustomPicture: !!userData?.profile_picture_url,
      hasOAuthAvatar: !!userData?.avatar_url
    });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Upload new profile picture
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum 5MB allowed.' 
      }, { status: 400 });
    }

    // Delete old profile picture if exists
    const { data: oldUserData } = await supabase
      .from('users')
      .select('profile_picture_url')
      .eq('id', user.id)
      .single();

    if (oldUserData?.profile_picture_url) {
      const oldPath = oldUserData.profile_picture_url.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile with new picture URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_picture_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      profilePictureUrl: publicUrl,
      message: 'Profile picture uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove profile picture
export async function DELETE() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current profile picture URL
    const { data: userData } = await supabase
      .from('users')
      .select('profile_picture_url')
      .eq('id', user.id)
      .single();

    // Delete from storage if custom profile picture exists
    if (userData?.profile_picture_url) {
      const filePath = userData.profile_picture_url.split('/').slice(-2).join('/');
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
        // Continue anyway to clear the URL from database
      }
    }

    // Clear profile_picture_url from database (keep avatar_url for OAuth)
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_picture_url: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Profile picture removed successfully' 
    });
  } catch (error) {
    console.error('Error removing profile picture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
