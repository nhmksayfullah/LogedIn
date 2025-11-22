import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET - Get current user's cover photo
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user cover photo
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('cover_photo_url, cover_color')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch cover photo' }, { status: 500 });
    }

    return NextResponse.json({ 
      coverPhotoUrl: userData?.cover_photo_url,
      coverColor: userData?.cover_color || '#1DA1F2',
      hasCoverPhoto: !!userData?.cover_photo_url
    });
  } catch (error) {
    console.error('Error fetching cover photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Upload new cover photo or update color
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    console.log('POST /api/user/cover-photo - Starting');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check:', { hasUser: !!user, authError: authError?.message });
    
    if (authError || !user) {
      console.error('Auth error in cover photo upload:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const color = formData.get('color') as string | null;

    // If color is provided, just update the color
    if (color && !file) {
      console.log('Updating cover color:', color);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ cover_color: color })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update cover color' }, { status: 500 });
      }

      return NextResponse.json({ 
        coverColor: color,
        message: 'Cover color updated successfully' 
      });
    }

    // If file is provided, upload it
    if (!file) {
      return NextResponse.json({ error: 'No file or color provided' }, { status: 400 });
    }

    console.log('File received:', { name: file.name, type: file.type, size: file.size });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (10MB max for cover photos)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum 10MB allowed.' 
      }, { status: 400 });
    }

    // Delete old cover photo if exists
    const { data: oldUserData } = await supabase
      .from('users')
      .select('cover_photo_url')
      .eq('id', user.id)
      .single();

    if (oldUserData?.cover_photo_url) {
      const oldPath = oldUserData.cover_photo_url.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/cover-${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log('Uploading cover photo to storage:', { fileName, size: buffer.length });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    console.log('Upload result:', { uploadData, uploadError });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile with new cover photo URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ cover_photo_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      coverPhotoUrl: publicUrl,
      message: 'Cover photo uploaded successfully' 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove cover photo
export async function DELETE() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current cover photo URL
    const { data: userData } = await supabase
      .from('users')
      .select('cover_photo_url')
      .eq('id', user.id)
      .single();

    // Delete from storage if cover photo exists
    if (userData?.cover_photo_url) {
      const filePath = userData.cover_photo_url.split('/').slice(-2).join('/');
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
        // Continue anyway to clear the URL from database
      }
    }

    // Clear cover_photo_url from database (keep cover_color)
    const { error: updateError } = await supabase
      .from('users')
      .update({ cover_photo_url: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Cover photo removed successfully' 
    });
  } catch (error) {
    console.error('Error removing cover photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
