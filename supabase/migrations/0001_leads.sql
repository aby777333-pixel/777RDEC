-- 777 Raptor — lead capture.
--
-- Three tables, RLS enabled, and deliberately NO policies: only the service
-- role reads or writes these, and the service role bypasses RLS. The browser
-- anon key can therefore do nothing here, which is the point — every write
-- goes through a Server Action.

create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  company text,
  role text,
  audience text not null,
  region text,
  interests text[] not null default '{}',
  message text,
  source_path text,
  utm jsonb,
  consent boolean not null default false
);

alter table demo_requests enable row level security;
-- no policies: only service role writes/reads

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  company text,
  role text,
  audience text not null,
  region text,
  interests text[] not null default '{}',
  message text,
  source_path text,
  utm jsonb,
  consent boolean not null default false
);

alter table contact_messages enable row level security;
-- no policies: only service role writes/reads

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  consent boolean not null default false
);

alter table newsletter_subscribers enable row level security;
-- no policies: only service role writes/reads

create index if not exists demo_requests_created_at_idx on demo_requests (created_at desc);
create index if not exists contact_messages_created_at_idx on contact_messages (created_at desc);
