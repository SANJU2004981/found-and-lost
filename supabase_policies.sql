-- Enable Row Level Security
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- LOST ITEMS POLICIES
-- Allow anyone to read lost items (publicly browse)
DROP POLICY IF EXISTS "Allow public read access for lost items" ON lost_items;
CREATE POLICY "Allow public read access for lost items" 
ON lost_items FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own lost items
DROP POLICY IF EXISTS "Allow authenticated insert for lost items" ON lost_items;
CREATE POLICY "Allow authenticated insert for lost items" 
ON lost_items FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own lost items
DROP POLICY IF EXISTS "Allow individual update for lost items" ON lost_items;
CREATE POLICY "Allow individual update for lost items" 
ON lost_items FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own lost items
DROP POLICY IF EXISTS "Allow individual delete for lost items" ON lost_items;
CREATE POLICY "Allow individual delete for lost items" 
ON lost_items FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);


-- FOUND ITEMS POLICIES
-- Allow anyone to read found items
DROP POLICY IF EXISTS "Allow public read access for found items" ON found_items;
CREATE POLICY "Allow public read access for found items" 
ON found_items FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own found items
DROP POLICY IF EXISTS "Allow authenticated insert for found items" ON found_items;
CREATE POLICY "Allow authenticated insert for found items" 
ON found_items FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own found items
DROP POLICY IF EXISTS "Allow individual update for found items" ON found_items;
CREATE POLICY "Allow individual update for found items" 
ON found_items FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own found items
DROP POLICY IF EXISTS "Allow individual delete for found items" ON found_items;
CREATE POLICY "Allow individual delete for found items" 
ON found_items FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);


-- MESSAGES POLICIES
-- Allow users to read messages where they are either the sender or the receiver
DROP POLICY IF EXISTS "Allow users to read their own messages" ON messages;
CREATE POLICY "Allow users to read their own messages" 
ON messages FOR SELECT 
TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to insert messages where they are the sender
DROP POLICY IF EXISTS "Allow users to send messages" ON messages;
CREATE POLICY "Allow users to send messages" 
ON messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sender_id);
