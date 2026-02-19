-- ===========================================
-- XRage Schema - Using Supabase Auth
-- ===========================================

-- Weapons table (public reference data)
CREATE TABLE IF NOT EXISTS weapons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  damage_rate INTEGER NOT NULL DEFAULT 0,
  damage_type TEXT NOT NULL CHECK (damage_type IN ('hold', 'click')),
  cursor_idle TEXT,
  cursor_active TEXT,
  cursor_size INTEGER,
  cursor_offset_x INTEGER,
  cursor_offset_y INTEGER,
  sound_active TEXT,
  sound_destroy TEXT,
  destroy_emoji TEXT,
  destroy_message TEXT,
  destroy_bg_class TEXT,
  destroy_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
-- This stores additional Twitter profile data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  twitter_username TEXT,
  twitter_display_name TEXT,
  twitter_avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Destroyed tweets table
CREATE TABLE IF NOT EXISTS destroyed_tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id TEXT NOT NULL,
  tweet_url TEXT,
  tweet_content TEXT,
  tweet_author_username TEXT,
  tweet_author_display_name TEXT,
  tweet_author_avatar_url TEXT,
  weapon_id TEXT NOT NULL REFERENCES weapons(id),
  destroyed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gif_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- Indexes for performance
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_destroyed_tweets_weapon_id ON destroyed_tweets(weapon_id);
CREATE INDEX IF NOT EXISTS idx_destroyed_tweets_user_id ON destroyed_tweets(destroyed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_destroyed_tweets_tweet_id ON destroyed_tweets(tweet_id);
CREATE INDEX IF NOT EXISTS idx_destroyed_tweets_created_at ON destroyed_tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_twitter_username ON profiles(twitter_username);

-- ===========================================
-- Updated_at trigger function
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Auto-create profile on user signup
-- ===========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, twitter_username, twitter_display_name, twitter_avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- Enable Row Level Security
-- ===========================================
ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE destroyed_tweets ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS Policies - Weapons (public read-only)
-- ===========================================
DROP POLICY IF EXISTS "Weapons are viewable by everyone" ON weapons;
CREATE POLICY "Weapons are viewable by everyone" ON weapons
  FOR SELECT USING (true);

-- ===========================================
-- RLS Policies - Profiles
-- ===========================================
-- Anyone can view profiles (for leaderboards, etc.)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profile insert is handled by trigger, but allow service role
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- RLS Policies - Destroyed Tweets
-- ===========================================
-- Anyone can view destroyed tweets (public feed)
DROP POLICY IF EXISTS "Destroyed tweets are viewable by everyone" ON destroyed_tweets;
CREATE POLICY "Destroyed tweets are viewable by everyone" ON destroyed_tweets
  FOR SELECT USING (true);

-- Authenticated users can insert destroyed tweets (linked to their account)
DROP POLICY IF EXISTS "Authenticated users can insert destroyed tweets" ON destroyed_tweets;
CREATE POLICY "Authenticated users can insert destroyed tweets" ON destroyed_tweets
  FOR INSERT WITH CHECK (
    -- Either anonymous (no user_id) or the user_id matches the authenticated user
    destroyed_by_user_id IS NULL OR destroyed_by_user_id = auth.uid()
  );

-- Users can update their own destroyed tweets (e.g., to add gif_url)
DROP POLICY IF EXISTS "Users can update own destroyed tweets" ON destroyed_tweets;
CREATE POLICY "Users can update own destroyed tweets" ON destroyed_tweets
  FOR UPDATE USING (destroyed_by_user_id = auth.uid());

-- ===========================================
-- Storage bucket for GIFs
-- ===========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('destruction-gifs', 'destruction-gifs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for GIFs bucket
DROP POLICY IF EXISTS "Anyone can view destruction gifs" ON storage.objects;
CREATE POLICY "Anyone can view destruction gifs" ON storage.objects
  FOR SELECT USING (bucket_id = 'destruction-gifs');

DROP POLICY IF EXISTS "Authenticated users can upload destruction gifs" ON storage.objects;
CREATE POLICY "Authenticated users can upload destruction gifs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'destruction-gifs'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update own destruction gifs" ON storage.objects;
CREATE POLICY "Users can update own destruction gifs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'destruction-gifs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own destruction gifs" ON storage.objects;
CREATE POLICY "Users can delete own destruction gifs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'destruction-gifs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ===========================================
-- Seed initial weapons data
-- ===========================================
INSERT INTO weapons (id, name, icon, damage_rate, damage_type, cursor_idle, cursor_active, cursor_size, cursor_offset_x, cursor_offset_y, sound_active, destroy_emoji, destroy_message, destroy_bg_class, destroy_image)
VALUES
  ('cursor', 'Cursor', '🖱️', 0, 'hold', NULL, NULL, NULL, NULL, NULL, NULL, '🖱️', 'Nothing happened', NULL, NULL),
  ('flamethrower', 'Flamethrower', '🔥', 4, 'hold', '/1.png', '/2.png', 400, 200, 200, '/flame.mp3', '', '', 'bg-transparent', '/ashes.png'),
  ('hammer', 'Ban Hammer', '🔨', 8, 'click', '/hammer1.png', '/hammer2.png', 300, 150, 50, '/hammer.mp3', '🔨', 'BANNED!', 'bg-red-900', NULL),
  ('laser', 'Laser Beam', '⚡', 3, 'hold', '/laser1.png', '/laser2.png', 350, 175, 175, '/laser.mp3', '⚡', 'Vaporized!', 'bg-gradient-to-t from-cyan-900 to-transparent', NULL),
  ('nuke', 'Nuke', '☢️', 15, 'hold', '/nuke1.png', '/nuke2.png', 400, 200, 200, '/nuke.mp3', '☢️', 'OBLITERATED!', 'bg-white', NULL),
  ('freeze', 'Freeze Ray', '❄️', 1, 'hold', '/freeze1.png', '/freeze2.png', 350, 175, 175, '/freeze.mp3', '❄️', 'Frozen solid!', 'bg-gradient-to-t from-blue-900 to-transparent', NULL),
  ('boxing', 'Boxing Glove', '🥊', 12, 'click', '/boxing.png', '/boxing.png', 200, 100, 100, '/pow.mp3', '🥊', 'Knocked out!', 'bg-gradient-to-t from-purple-900 via-blue-900 to-transparent', NULL),
  ('volcano', 'Volcano', '🌋', 0, 'hold', NULL, NULL, NULL, NULL, NULL, NULL, '🌋', 'Thrown into the volcano!', 'bg-gradient-to-t from-orange-900 via-red-800 to-transparent', NULL)
ON CONFLICT (id) DO NOTHING;
