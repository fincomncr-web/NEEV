-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

-- Research / disclosure document registry.
-- Create it when bootstrapping a fresh Supabase project; retain existing rows
-- when upgrading an existing project.
create table if not exists reports (
  id uuid primary key,
  title text not null,
  sector text not null,
  summary text not null,
  date date not null,
  authors text not null,
  file_name text not null,
  file_url text not null,
  file_size_bytes bigint not null default 0,
  uploaded_at timestamptz not null default now(),
  type text not null default 'industry_report',
  issue_number integer,
  version integer not null default 1,
  publication_status text not null default 'IN_REVIEW',
  data_cutoff date
);
alter table reports add column if not exists type text not null default 'industry_report';
alter table reports add column if not exists issue_number integer;
alter table reports add column if not exists version integer not null default 1;
alter table reports add column if not exists publication_status text not null default 'IN_REVIEW';
alter table reports add column if not exists data_cutoff date;

-- Fund NAV history, logged periodically by the Portfolio Manager.
create table if not exists nav_history (
  id uuid primary key,
  date date not null unique,
  nav numeric not null,
  note text,
  created_at timestamptz not null default now()
);
alter table nav_history enable row level security;

-- Current and historical portfolio holdings.
create table if not exists holdings (
  id uuid primary key,
  symbol text not null,
  company_name text not null,
  sector text not null,
  quantity numeric not null,
  avg_cost numeric not null,
  entry_date date not null,
  status text not null default 'active',
  exit_date date,
  exit_price numeric,
  created_at timestamptz not null default now()
);
alter table holdings enable row level security;

-- Investment Committee Decision Register.
create table if not exists decisions (
  id uuid primary key,
  date date not null,
  sector text not null,
  company_name text,
  symbol text,
  decision text not null,
  rationale text not null,
  vote_count text,
  created_at timestamptz not null default now()
);
alter table decisions enable row level security;

-- Per-industry, per-layer written content (the 8-layer monthly roadmap).
create table if not exists industry_content (
  id uuid primary key,
  sector_slug text not null,
  layer text not null,
  title text not null,
  content text not null,
  updated_at timestamptz not null default now(),
  unique (sector_slug, layer)
);
alter table industry_content enable row level security;
