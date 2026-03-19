-- ============================================================
-- Found & Lost — Production Stability Migration v2
-- Run in Supabase Dashboard: SQL Editor
-- ============================================================


-- ============================================================
-- SECTION 1: public.users table — ensure it exists with RLS
-- ============================================================

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read ANY user row (needed for chat email lookups)
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.users;
CREATE POLICY "Allow authenticated users to read profiles"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Allow users to update only their own profile
DROP POLICY IF EXISTS "Allow individual update for users" ON public.users;
CREATE POLICY "Allow individual update for users"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow insert only for own row (backend uses service key or user JWT)
DROP POLICY IF EXISTS "Allow authenticated insert for users" ON public.users;
CREATE POLICY "Allow authenticated insert for users"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);


-- ============================================================
-- SECTION 2: Auto-sync trigger — auth.users → public.users
-- Creates a public.users row whenever a new auth user registers
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Attach trigger to auth.users (after insert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- SECTION 3: Backfill public.users for existing auth users
-- Run only if you have users already registered
-- ============================================================

INSERT INTO public.users (id, email, name, role)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', ''),
    'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 4: lost_items RLS (re-apply for clarity)
-- ============================================================

ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for lost items" ON lost_items;
CREATE POLICY "Allow public read access for lost items"
ON lost_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert for lost items" ON lost_items;
CREATE POLICY "Allow authenticated insert for lost items"
ON lost_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual update for lost items" ON lost_items;
CREATE POLICY "Allow individual update for lost items"
ON lost_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual delete for lost items" ON lost_items;
CREATE POLICY "Allow individual delete for lost items"
ON lost_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ============================================================
-- SECTION 5: found_items RLS (re-apply for clarity)
-- ============================================================

ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for found items" ON found_items;
CREATE POLICY "Allow public read access for found items"
ON found_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert for found items" ON found_items;
CREATE POLICY "Allow authenticated insert for found items"
ON found_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual update for found items" ON found_items;
CREATE POLICY "Allow individual update for found items"
ON found_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual delete for found items" ON found_items;
CREATE POLICY "Allow individual delete for found items"
ON found_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ============================================================
-- SECTION 6: messages RLS
-- ============================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Both sender and receiver can read their messages
DROP POLICY IF EXISTS "Allow users to read their own messages" ON messages;
CREATE POLICY "Allow users to read their own messages"
ON messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Only the sender can insert (auth.uid() must match sender_id in the row)
DROP POLICY IF EXISTS "Allow users to send messages" ON messages;
CREATE POLICY "Allow users to send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);


-- ============================================================
-- SECTION 7: Storage bucket — images
-- ============================================================
-- DO THIS IN SUPABASE DASHBOARD → Storage → Create Bucket:
--
--   Bucket name : images
--   Public      : YES (tick "Public bucket")
--
-- Then add these Storage policies from SQL Editor:

-- Allow authenticated users to upload images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: authenticated users can upload
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Storage Policy: anyone can read/download (public bucket)
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Storage Policy: users can update/delete their own uploads
DROP POLICY IF EXISTS "Users can manage their own images" ON storage.objects;
CREATE POLICY "Users can manage their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
