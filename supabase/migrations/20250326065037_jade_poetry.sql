/*
  # Create Storage Buckets for bolt.diy

  1. New Buckets
    - `bolt-diy-projects` - For storing project files
    - `bolt-diy-assets` - For storing static assets

  2. Security
    - Enable RLS on buckets
    - Add policies for authenticated users
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('bolt-diy-projects', 'bolt-diy-projects', false),
  ('bolt-diy-assets', 'bolt-diy-assets', true);

-- Enable RLS on project files bucket
CREATE POLICY "Users can read own project files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'bolt-diy-projects' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload own project files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'bolt-diy-projects' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Enable public read access on assets bucket
CREATE POLICY "Public read access for assets"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'bolt-diy-assets');

CREATE POLICY "Authenticated users can upload assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bolt-diy-assets');