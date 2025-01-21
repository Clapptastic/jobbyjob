-- Create parsed_resumes table
CREATE TABLE IF NOT EXISTS parsed_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  parsed_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE parsed_resumes ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own parsed resumes
CREATE POLICY "Users can view their own parsed resumes"
  ON parsed_resumes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own parsed resumes
CREATE POLICY "Users can insert their own parsed resumes"
  ON parsed_resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own parsed resumes
CREATE POLICY "Users can update their own parsed resumes"
  ON parsed_resumes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own parsed resumes
CREATE POLICY "Users can delete their own parsed resumes"
  ON parsed_resumes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_parsed_resumes_updated_at
  BEFORE UPDATE ON parsed_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 