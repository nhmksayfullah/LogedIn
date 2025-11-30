import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { Journey } from '@/types/journey';
import { getPublicProfileByUsername, getPublicJourneysByUserId } from '@/utils/publicProfile';

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} - LogedIn`,
    description: `View ${username}'s public profile on LogedIn`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  
  // Fetch profile data directly from Supabase
  const profileData = await getPublicProfileByUsername(username);
  
  if (!profileData) {
    notFound();
  }

  // Fetch public journeys
  const journeys = await getPublicJourneysByUserId(profileData.userId);
  const profile = profileData.profile;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Container with same width as header */}
      <div className="max-w-6xl mx-auto flex-1 w-full">
        {/* Cover Photo Section */}
        <div className="relative w-full bg-gradient-to-br from-blue-500 to-purple-600 sm:rounded-b-xl overflow-hidden" style={{ paddingTop: '20%' }}>
          {profile.coverPhotoUrl ? (
            <Image
              src={profile.coverPhotoUrl}
              alt="Cover photo"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: profile.coverColor }}
            />
          )}
        </div>

        {/* Profile Content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Profile Header - Centered */}
          <div className="relative -mt-8 sm:-mt-10 mb-4 sm:mb-6">
            <div className="flex flex-col items-center">
              {/* Profile Picture - Centered */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden mb-2 sm:mb-3">
                {profile.profilePictureUrl ? (
                  <Image
                    src={profile.profilePictureUrl}
                    alt={profile.name || profile.username}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(profile.name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Username - Centered */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {profile.name || profile.username}
                  </h1>
                  {profile.isVerified && (
                    <div className="relative group">
                      <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 cursor-help" />
                      <span className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Verified Profile
                      </span>
                    </div>
                  )}
                </div>
                {profile.name && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                    @{profile.username}
                  </p>
                )}
              </div>

              {/* Bio - Centered */}
              {profile.bio && (
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center max-w-2xl whitespace-pre-wrap mt-1 px-4">
                  {profile.bio}
                </p>
              )}

              {/* Social Links - Centered */}
              {(profile.twitterUrl || profile.websiteUrl) && (
                <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      aria-label="Twitter"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      aria-label="Website"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Journeys Section */}
          <div className="pb-8 sm:pb-12 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            {journeys.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {journeys.map((journey: Journey) => (
                  <Link
                    key={journey.id}
                    href={`/${username}/${journey.slug}`}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
                  >
                    {/* Cover Image */}
                    <div 
                      className="h-32 sm:h-40 relative"
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
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                        {journey.title}
                      </h3>
                      
                      {journey.description && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 line-clamp-2">
                          {journey.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-medium">
                          {journey.version_count || 0} milestones
                        </span>
                        <span>
                          {new Date(journey.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <svg
                    className="mx-auto h-10 w-10 sm:h-12 sm:w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1">
                  No public journeys yet
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  @{profile.username} hasn&apos;t shared any journeys publicly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <Image
              src="/logedin_logo.svg"
              alt="Loged.in"
              width={120}
              height={40}
              className="h-8 sm:h-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/logedin_logo_light.svg"
              alt="Loged.in"
              width={120}
              height={40}
              className="h-8 sm:h-10 w-auto hidden dark:block"
              priority
            />
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
            Every journey deserves to be shared. Start documenting your story today.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors"
          >
            Share Your Story
          </Link>
        </div>
      </footer>
    </div>
  );
}
