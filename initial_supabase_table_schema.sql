create table public.users (
  id uuid not null,
  email text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  is_deleted boolean null default false,
  deleted_at timestamp with time zone null,
  reactivated_at timestamp with time zone null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;

create table public.user_preferences (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  has_completed_onboarding boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_preferences_pkey primary key (id),
  constraint user_preferences_user_id_key unique (user_id),
  constraint user_preferences_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.purchases (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  stripe_customer_id text null,
  stripe_payment_intent_id text null,
  purchase_type text null default 'lifetime_pro',
  status text null default 'active',
  price_id text null,
  amount_paid integer null,
  currency text null default 'usd',
  coupon_id text null,
  purchased_at timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint purchases_pkey primary key (id),
  constraint purchases_user_id_key unique (user_id),
  constraint purchases_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.journeys (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text null,
  cover_image_url text null,
  cover_color text null default '#3B82F6',
  is_public boolean not null default false,
  slug text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint journeys_pkey primary key (id),
  constraint journeys_user_id_fkey foreign KEY (user_id) references auth.users(id) on delete CASCADE
) TABLESPACE pg_default;

create table public.versions (
  id uuid not null default gen_random_uuid(),
  journey_id uuid not null,
  title text not null,
  description text null,
  cover_photo_url text null,
  date timestamp with time zone not null default now(),
  tags text[] null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint versions_pkey primary key (id),
  constraint versions_journey_id_fkey foreign KEY (journey_id) references journeys(id) on delete CASCADE
) TABLESPACE pg_default;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access to users" ON public.users
  FOR ALL TO service_role USING (true);

-- User preferences policies
CREATE POLICY "Users can read their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to preferences" ON public.user_preferences
  FOR ALL TO service_role USING (true);

-- Purchases policies
CREATE POLICY "Users can read their own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" ON public.purchases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to purchases" ON public.purchases
  FOR ALL TO service_role USING (true);

-- Journeys table policies
CREATE POLICY "Users can read their own journeys" ON public.journeys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read public journeys" ON public.journeys
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own journeys" ON public.journeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys" ON public.journeys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journeys" ON public.journeys
  FOR DELETE USING (auth.uid() = user_id);

-- Versions table policies
CREATE POLICY "Users can read versions of their journeys" ON public.versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journeys
      WHERE journeys.id = versions.journey_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read versions of public journeys" ON public.versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journeys
      WHERE journeys.id = versions.journey_id
      AND journeys.is_public = true
    )
  );

CREATE POLICY "Users can insert versions to their journeys" ON public.versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journeys
      WHERE journeys.id = versions.journey_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update versions of their journeys" ON public.versions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journeys
      WHERE journeys.id = versions.journey_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete versions of their journeys" ON public.versions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journeys
      WHERE journeys.id = versions.journey_id
      AND journeys.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON public.journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_is_public ON public.journeys(is_public);
CREATE INDEX IF NOT EXISTS idx_versions_journey_id ON public.versions(journey_id);
CREATE INDEX IF NOT EXISTS idx_versions_date ON public.versions(date DESC);
