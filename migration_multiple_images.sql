-- Rename 'image' column to 'images' and change type to array
-- First, add the new column
ALTER TABLE public.vehicles ADD COLUMN images text[] DEFAULT '{}';

-- Migrate existing data: move single image to the array
UPDATE public.vehicles SET images = ARRAY[image] WHERE image IS NOT NULL;

-- Drop the old column
ALTER TABLE public.vehicles DROP COLUMN image;
