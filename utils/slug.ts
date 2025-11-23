/**
 * Generate a URL-friendly slug from a title
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Check if a slug is valid (only lowercase letters, numbers, and hyphens)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Ensure slug is unique for a user by checking against existing journeys
 * If slug exists, append a number
 */
export async function ensureUniqueSlug(
  slug: string,
  userId: string,
  supabaseClient: any,
  excludeJourneyId?: string
): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const query = supabaseClient
      .from('journeys')
      .select('id')
      .eq('user_id', userId)
      .eq('slug', uniqueSlug);

    if (excludeJourneyId) {
      query.neq('id', excludeJourneyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking slug uniqueness:', error);
      break;
    }

    // If no existing journey with this slug, we're good
    if (!data || data.length === 0) {
      break;
    }

    // Try next number
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
}
