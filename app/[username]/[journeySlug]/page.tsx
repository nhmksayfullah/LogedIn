import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Globe } from 'lucide-react';

type Props = {
  params: Promise<{ username: string; journeySlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, journeySlug } = await params;
  const data = await getPublicJourney(username, journeySlug);
  
  if (!data) {
    return {
      title: 'Journey not found - LogedIn',
    };
  }

  return {
    title: `${data.journey.title} - @${username} - LogedIn`,
    description: data.journey.description || `View ${username}'s journey on LogedIn`,
  };
}

async function getPublicJourney(username: string, journeySlug: string) {
  // Use relative URLs on the server side for internal API calls
  const baseUrl = typeof window === 'undefined' 
    ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    : '';
  
  console.log('[getPublicJourney] Fetching for:', { username, journeySlug, baseUrl, isServer: typeof window === 'undefined' });
  
  try {
    const response = await fetch(`${baseUrl}/api/user/${username}`, {
      cache: 'no-store',
    });

    console.log('[getPublicJourney] User API response status:', response.status);

    if (!response.ok) {
      console.log('[getPublicJourney] User API failed');
      return null;
    }

    const data = await response.json();
    console.log('[getPublicJourney] Found journeys:', data.journeys?.length);
    
    // Find the specific journey by slug
    const journey = data.journeys.find((j: any) => j.slug === journeySlug);
    
    console.log('[getPublicJourney] Journey found:', !!journey, 'is_public:', journey?.is_public);
    
    if (!journey || !journey.is_public) {
      console.log('[getPublicJourney] Journey not found or not public');
      return null;
    }

    // Fetch versions for this journey
    const versionsResponse = await fetch(
      `${baseUrl}/api/journey/${journey.id}/versions`,
      { cache: 'no-store' }
    );

    console.log('[getPublicJourney] Versions API response status:', versionsResponse.status);

    let versions = [];
    if (versionsResponse.ok) {
      versions = await versionsResponse.json();
      console.log('[getPublicJourney] Versions count:', versions.length);
    }

    return {
      profile: data.profile,
      journey,
      versions,
    };
  } catch (error) {
    console.error('[getPublicJourney] Error fetching public journey:', error);
    return null;
  }
}

export default async function PublicJourneyPage({ params }: Props) {
  const { username, journeySlug } = await params;
  const data = await getPublicJourney(username, journeySlug);

  if (!data) {
    notFound();
  }

  const { profile, journey, versions } = data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href={`/${username}`}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to @{username}&apos;s profile</span>
        </Link>

        {/* Journey Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          {/* Cover Section */}
          <div 
            className="h-48 rounded-t-xl relative"
            style={{
              background: journey.cover_image_url 
                ? 'none' 
                : `linear-gradient(135deg, ${journey.cover_color || '#3B82F6'} 0%, ${journey.cover_color ? `${journey.cover_color}dd` : '#2563EB'} 100%)`
            }}
          >
            {journey.cover_image_url && (
              <Image
                src={journey.cover_image_url}
                alt={journey.title}
                fill
                className="object-cover rounded-t-xl"
              />
            )}
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  {journey.title}
                </h1>
                {journey.description && (
                  <p className="text-lg text-slate-600">
                    {journey.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-sm text-slate-500 mb-6">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-blue-600 font-medium">Public</span>
              </div>
              <span>•</span>
              <span>By @{username}</span>
              <span>•</span>
              <span>Updated {formatDate(journey.updated_at)}</span>
            </div>

            {/* Profile Link */}
            <Link
              href={`/${username}`}
              className="inline-flex items-center space-x-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0">
                {profile.profilePictureUrl ? (
                  <Image
                    src={profile.profilePictureUrl}
                    alt={username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">@{username}</p>
                <p className="text-sm text-slate-600">View full profile</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Timeline</h2>

          {versions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No milestones yet
              </h3>
              <p className="text-slate-600">
                This journey doesn&apos;t have any milestones yet.
              </p>
            </div>
          ) : (
            versions.map((version: any, index: number) => (
              <div
                key={version.id}
                className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Cover Photo */}
                {version.cover_photo_url && (
                  <div className="relative w-full h-64 overflow-hidden">
                    <Image
                      src={version.cover_photo_url}
                      alt={version.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-8">
                  {/* Date at the top left */}
                  <div className="mb-4">
                    <time className="text-sm font-medium text-slate-500">
                      {formatDate(version.date)}
                    </time>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                    {version.title}
                  </h3>

                  {/* Description with rich text styling */}
                  {version.description && (
                    <div 
                      className="prose prose-slate max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: version.description }}
                    />
                  )}

                  {/* Tags */}
                  {version.tags && version.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 mt-6 pt-6 border-t border-slate-200">
                      {version.tags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 border-t border-slate-200 pt-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Loged.in</h2>
          <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
            Every journey deserves to be shared. Start documenting your story today.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Share Your Story
          </Link>
        </div>
      </div>
    </div>
  );
}
