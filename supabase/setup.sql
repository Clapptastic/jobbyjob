-- IMPORTANT: Run this entire file in the Supabase SQL Editor
-- This will set up all necessary tables, functions, and policies

-- Start transaction
BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS edge;

-- Create access requests table
CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    company TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending'::TEXT,
    approved_at TIMESTAMPTZ,
    approval_token UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    resume_url TEXT,
    resume_content JSONB,
    linkedin_url TEXT,
    personal_website TEXT,
    job_preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT,
    salary TEXT,
    description TEXT,
    requirements TEXT[],
    posted_at TIMESTAMPTZ DEFAULT now(),
    source TEXT NOT NULL,
    source_url TEXT UNIQUE,
    match_score REAL,
    match_reasons JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs ON DELETE CASCADE,
    status TEXT DEFAULT 'applied'::TEXT,
    applied_at TIMESTAMPTZ DEFAULT now(),
    last_contact_at TIMESTAMPTZ,
    customized_resume TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create error reports table
CREATE TABLE IF NOT EXISTS public.error_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    source TEXT NOT NULL,
    error_code TEXT NOT NULL,
    message TEXT,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT now(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_token ON access_requests(approval_token);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON public.jobs(match_score);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON public.error_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_source ON public.error_reports(source);

-- Enable Row Level Security
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('resumes', 'resumes', false, 5242880, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create access approval function
CREATE OR REPLACE FUNCTION approve_access_request(token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request access_requests;
BEGIN
    -- Get and update request
    UPDATE access_requests
    SET status = 'approved',
        approved_at = now()
    WHERE approval_token = token
    AND status = 'pending'
    RETURNING * INTO v_request;

    -- Check if request was found and updated
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Create function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
AS $$
BEGIN
    -- Check if user has approved access
    IF NOT EXISTS (
        SELECT 1 FROM access_requests 
        WHERE email = NEW.email 
        AND status = 'approved'
    ) THEN
        RAISE EXCEPTION 'Access not approved';
    END IF;

    -- Create profile
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create RLS Policies

-- Access Requests policies
CREATE POLICY "Anyone can create access request"
    ON public.access_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own access request"
    ON public.access_requests FOR SELECT
    USING (email = auth.jwt() ->> 'email');

-- Profile policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Users can view own jobs"
    ON public.jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs"
    ON public.jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can view own applications"
    ON public.applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
    ON public.applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
    ON public.applications FOR UPDATE
    USING (auth.uid() = user_id);

-- Error reports policies
CREATE POLICY "Users can create error reports"
    ON public.error_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own error reports"
    ON public.error_reports FOR SELECT
    USING (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Allow public bucket access"
    ON storage.buckets FOR SELECT
    USING (public = true);

CREATE POLICY "Allow authenticated bucket access"
    ON storage.buckets FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can upload own resumes"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'resumes'
        AND auth.role() = 'authenticated'
        AND owner = auth.uid()
    );

CREATE POLICY "Users can view own resumes"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'resumes'
        AND owner = auth.uid()
    );

CREATE POLICY "Public avatar access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );

-- Commit transaction
COMMIT;

-- Verify setup
DO $$
BEGIN
    RAISE NOTICE 'Database setup complete. Verifying...';
    
    -- Verify tables
    IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
        RAISE NOTICE 'Profiles table created successfully';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.jobs LIMIT 1) THEN
        RAISE NOTICE 'Jobs table created successfully';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.applications LIMIT 1) THEN
        RAISE NOTICE 'Applications table created successfully';
    END IF;
    
    -- Verify storage
    IF EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id IN ('resumes', 'avatars')
    ) THEN
        RAISE NOTICE 'Storage buckets created successfully';
    END IF;
    
    -- Verify policies
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public'
    ) THEN
        RAISE NOTICE 'RLS policies created successfully';
    END IF;
    
    RAISE NOTICE 'Setup verification complete!';
END $$;