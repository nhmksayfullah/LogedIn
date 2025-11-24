import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { getPublicJourneyBySlug, getVersionsByJourneyId } from '@/utils/publicProfile';

type Props = {
  params: Promise<{ username: string; journeySlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, journeySlug } = await params;
  const data = await getPublicJourneyBySlug(username, journeySlug);
  
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

export default async function PublicJourneyPage({ params }: Props) {
  const { username, journeySlug } = await params;
  
  // Fetch journey data directly from Supabase
  const data = await getPublicJourneyBySlug(username, journeySlug);

  if (!data) {
    notFound();
  }

  const { profile, journey } = data;
  
  // Fetch versions for this journey
  const versions = await getVersionsByJourneyId(journey.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Container with same width as header */}
      <div className="max-w-6xl mx-auto flex-1 w-full">
        {/* Cover Photo Section */}
        <div className="relative w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-b-xl overflow-hidden" style={{ paddingTop: '16.13%' }}>
          {journey.cover_image_url ? (
            <Image
              src={journey.cover_image_url}
              alt={journey.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(135deg, ${journey.cover_color || '#3B82F6'} 0%, ${journey.cover_color ? `${journey.cover_color}dd` : '#2563EB'} 100%)`
              }}
            />
          )}
        </div>

        {/* Journey Content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Journey Header - Centered */}
          <div className="relative -mt-10 mb-4">
            <div className="flex flex-col items-center">
              {/* Profile Picture - Centered */}
              <Link
                href={`/${username}`}
                className="relative w-20 h-20 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden mb-2 hover:opacity-90 transition-opacity"
              >
                {profile.profilePictureUrl ? (
                  <Image
                    src={profile.profilePictureUrl}
                    alt={profile.name || username}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(profile.name || username).charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Journey Title and Info - Centered */}
              <div className="text-center max-w-3xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {journey.title}
                </h1>
                {journey.description && (
                  <p className="text-base text-gray-600 mb-3">
                    {journey.description}
                  </p>
                )}

                {/* Meta Info - Centered */}
                <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                  <Link
                    href={`/${username}`}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>By</span>
                    <span className="font-medium text-gray-900">
                      {profile.name || `@${username}`}
                    </span>
                  </Link>
                  <span>•</span>
                  <span>{versions.length} {versions.length === 1 ? 'milestone' : 'milestones'}</span>
                  <span>•</span>
                  <span>Last updated {formatDate(journey.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Timeline */}
          <div className="pb-12 pt-6 border-t border-gray-200">
            {versions.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No milestones yet
                </h3>
                <p className="text-gray-600">
                  This journey doesn&apos;t have any milestones yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    {/* Date - Left side */}
                    <div className="flex-shrink-0 sm:w-32 sm:text-right">
                      <time className="text-sm sm:text-base font-medium text-gray-900">
                        {formatDate(version.date)}
                      </time>
                    </div>

                    {/* Card - Right side */}
                    <div className="flex-1 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                      {/* Cover Photo */}
                      {version.cover_photo_url && (
                        <div className="relative w-full h-32 overflow-hidden">
                          <Image
                            src={version.cover_photo_url}
                            alt={version.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                          {version.title}
                        </h3>

                        {/* Description with rich text styling */}
                        {version.description && (
                          <div 
                            className="prose prose-sm prose-slate max-w-none mb-3 text-gray-700"
                            dangerouslySetInnerHTML={{ __html: version.description }}
                          />
                        )}

                        {/* Tags */}
                        {version.tags && version.tags.length > 0 && (
                          <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logedin_logo.svg"
              alt="Loged.in"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Every journey deserves to be shared. Start documenting your story today.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Share Your Story
          </Link>
        </div>
      </footer>
    </div>
  );
}
