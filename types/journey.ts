export interface Journey {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
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
  version_number: string;
  date: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  version_id: string;
  url: string;
  caption: string | null;
  created_at: string;
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
  version_number: string;
  date?: string;
  tags?: string[];
}
