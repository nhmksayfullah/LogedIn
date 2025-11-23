export interface Journey {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  cover_color: string | null;
  is_public: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
  version_count?: number;
}

export interface Version {
  id: string;
  journey_id: string;
  title: string;
  description: string | null;
  cover_photo_url: string | null;
  date: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJourneyInput {
  title: string;
  description?: string;
  is_public?: boolean;
}

export interface CreateVersionInput {
  journey_id: string;
  title: string;
  description?: string;
  cover_photo_url?: string;
  date?: string;
  tags?: string[];
}
