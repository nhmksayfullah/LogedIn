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

// POST - Upload milestone cover photo
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    console.log('POST /api/version/cover-photo - Starting upload');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check:', { hasUser: !!user, authError: authError?.message });
    
    if (authError || !user) {
      console.error('Auth error in milestone cover photo upload:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const versionId = formData.get('versionId') as string;
    const journeyId = formData.get('journeyId') as string;

    if (!file) {
      console.error('No file provided in form data');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!versionId && !journeyId) {
      console.error('No versionId or journeyId provided');
      return NextResponse.json({ error: 'Version ID or Journey ID required' }, { status: 400 });
    }

    console.log('File received:', { name: file.name, type: file.type, size: file.size });

    // If versionId provided, verify ownership through journey
    if (versionId) {
      const { data: version } = await supabase
        .from('versions')
        .select(`
          id,
          journey_id,
          journeys!inner (
            user_id
          )
        `)
        .eq('id', versionId)
        .single();

      if (!version || (version as any).journeys.user_id !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (journeyId) {
      // Verify journey ownership
      const { data: journey } = await supabase
        .from('journeys')
        .select('user_id')
        .eq('id', journeyId)
        .eq('user_id', user.id)
        .single();

      if (!journey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum 10MB allowed.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const targetId = versionId || journeyId;
    const fileName = `${user.id}/milestones/${targetId}/cover-${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log('Uploading file to storage:', { fileName, size: buffer.length });

    // Upload to Supabase Storage (using same 'avatars' bucket)
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

    // If versionId provided, update the version record
    if (versionId) {
      // Delete old cover photo if exists
      const { data: oldVersion } = await supabase
        .from('versions')
        .select('cover_photo_url')
        .eq('id', versionId)
        .single();

      if (oldVersion?.cover_photo_url) {
        const oldPath = oldVersion.cover_photo_url.split('/').slice(-3).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      const { error: updateError } = await supabase
        .from('versions')
        .update({ cover_photo_url: publicUrl })
        .eq('id', versionId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update version' }, { status: 500 });
      }
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
    console.error('Error uploading milestone cover photo:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove milestone cover photo
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body for versionId
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
    }

    // Verify ownership through journey
    const { data: version } = await supabase
      .from('versions')
      .select(`
        id,
        cover_photo_url,
        journey_id,
        journeys!inner (
          user_id
        )
      `)
      .eq('id', versionId)
      .single();

    if (!version || (version as any).journeys.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from storage if cover photo exists
    if (version.cover_photo_url) {
      const filePath = version.cover_photo_url.split('/').slice(-3).join('/');
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
        // Continue anyway to clear the URL from database
      }
    }

    // Clear cover_photo_url from database
    const { error: updateError } = await supabase
      .from('versions')
      .update({ cover_photo_url: null })
      .eq('id', versionId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update version' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Cover photo removed successfully' 
    });
  } catch (error) {
    console.error('Error removing milestone cover photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
