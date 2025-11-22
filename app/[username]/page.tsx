import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { Journey } from '@/types/journey';

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

async function getPublicProfile(username: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/user/${username}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return null;
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const data = await getPublicProfile(username);

  if (!data) {
    notFound();
  }

  const { profile, journeys } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container with same width as header */}
      <div className="max-w-6xl mx-auto bg-white">
        {/* Cover Photo Section */}
        <div className="relative w-full bg-gradient-to-br from-blue-500 to-purple-600" style={{ paddingTop: '33.33%' }}>
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
          {/* Profile Header */}
          <div className="relative -mt-16 mb-4">
            <div className="flex items-end space-x-5">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
                  {profile.profilePictureUrl ? (
                    <Image
                      src={profile.profilePictureUrl}
                      alt={profile.username}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="flex-1 min-w-0 pb-2">
                <h1 className="text-3xl font-bold text-gray-900 truncate">
                  @{profile.username}
                </h1>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Journeys Section */}
          <div className="pb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Public Journeys
              {journeys.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({journeys.length})
                </span>
              )}
            </h2>

            {journeys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {journeys.map((journey: Journey) => (
                  <div
                    key={journey.id}
                    className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Cover Image */}
                    <div className="h-40 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center relative">
                      {journey.cover_image_url ? (
                        <Image
                          src={journey.cover_image_url}
                          alt={journey.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-slate-300" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                        {journey.title}
                      </h3>
                      
                      {journey.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {journey.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span className="font-medium">
                          {journey.version_count || 0} versions
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="mx-auto h-12 w-12"
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
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No public journeys yet
                </h3>
                <p className="text-gray-500">
                  @{profile.username} hasn&apos;t shared any journeys publicly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
