-- Create indexes for performance
begin;

create index if not exists idx_jobs_user_id on public.jobs(user_id);
create index if not exists idx_jobs_match_score on public.jobs(match_score);
create index if not exists idx_jobs_posted_at on public.jobs(posted_at);
create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_applications_job_id on public.applications(job_id);
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_access_requests_email on public.access_requests(email);
create index if not exists idx_access_requests_status on public.access_requests(status);
create index if not exists idx_access_requests_token on public.access_requests(approval_token);

commit;