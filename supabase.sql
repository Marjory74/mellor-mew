-- Optional persistence for the Vercel API routes.
create table if not exists site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;
-- The service-role key used by the API bypasses RLS. No public policy is needed.
