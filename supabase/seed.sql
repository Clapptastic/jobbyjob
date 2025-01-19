-- Add job sync queue table
CREATE TABLE IF NOT EXISTS job_sync_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error TEXT
);

-- Add indexes for job sync queue
CREATE INDEX idx_job_sync_queue_status ON job_sync_queue(status);
CREATE INDEX idx_job_sync_queue_user_id ON job_sync_queue(user_id);

-- Add RLS policies for job sync queue
ALTER TABLE job_sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync queue"
    ON job_sync_queue FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create sync requests"
    ON job_sync_queue FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add match score to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS match_score FLOAT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS match_reasons JSONB;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);