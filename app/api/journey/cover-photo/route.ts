import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// POST - Upload journey cover photo or update color
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    console.log('POST /api/journey/cover-photo - Starting');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check:', { hasUser: !!user, authError: authError?.message });
    
    if (authError || !user) {
      console.error('Auth error in journey cover photo upload:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const color = formData.get('color') as string | null;
    const journeyId = formData.get('journeyId') as string;

    if (!journeyId) {
      return NextResponse.json({ error: 'Journey ID required' }, { status: 400 });
    }

    // Verify journey ownership
    const { data: journey } = await supabase
      .from('journeys')
      .select('user_id, cover_image_url')
      .eq('id', journeyId)
      .single();

    if (!journey || journey.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If color is provided, just update the color
    if (color && !file) {
      console.log('Updating journey cover color:', color);
      
      const { error: updateError } = await supabase
        .from('journeys')
        .update({ cover_color: color })
        .eq('id', journeyId);

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
    if (journey.cover_image_url) {
      const oldPath = journey.cover_image_url.split('/').slice(-3).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/journeys/${journeyId}/cover-${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log('Uploading journey cover photo to storage:', { fileName, size: buffer.length });

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

    // Update journey with new cover photo URL
    const { error: updateError } = await supabase
      .from('journeys')
      .update({ cover_image_url: publicUrl })
      .eq('id', journeyId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update journey' }, { status: 500 });
    }

    return NextResponse.json({ 
      coverPhotoUrl: publicUrl,
      message: 'Cover photo uploaded successfully' 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Error uploading journey cover photo:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove journey cover photo
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body for journeyId
    const { journeyId } = await request.json();

    if (!journeyId) {
      return NextResponse.json({ error: 'Journey ID required' }, { status: 400 });
    }

    // Verify journey ownership
    const { data: journey } = await supabase
      .from('journeys')
      .select('user_id, cover_image_url')
      .eq('id', journeyId)
      .single();

    if (!journey || journey.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from storage if cover photo exists
    if (journey.cover_image_url) {
      const filePath = journey.cover_image_url.split('/').slice(-3).join('/');
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
        // Continue anyway to clear the URL from database
      }
    }

    // Clear cover_image_url from database (keep cover_color)
    const { error: updateError } = await supabase
      .from('journeys')
      .update({ cover_image_url: null })
      .eq('id', journeyId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update journey' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Cover photo removed successfully' 
    });
  } catch (error) {
    console.error('Error removing journey cover photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
