-- Add expertise column to profiles
ALTER TABLE public.profiles 
ADD COLUMN expertise text[] DEFAULT '{}'::text[];

-- Allow users to update their own expertise
-- (existing update policy already covers this since it allows updating own profile)