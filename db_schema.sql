-- Enable UUID extension (just in case)
create extension if not exists "uuid-ossp";

-- Create Vehicles Table
create table public.vehicles (
  id bigint generated always as identity primary key,
  make text not null,
  model text not null,
  version text not null,
  year_model text not null,
  mileage integer not null,
  price numeric not null,
  old_price numeric,
  is_armored boolean default false,
  image text,
  location text,
  status text check (status in ('active', 'reserved', 'sold')) default 'active',
  color text,
  fuel text,
  transmission text,
  plate text,
  options text[],
  description text,
  owner_name text,
  owner_phone text,
  owner_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.vehicles enable row level security;

-- Policy: Allow public read access
create policy "Allow public read access"
on public.vehicles
for select
to public
using (true);

-- Policy: Allow authenticated users to insert/update/delete (Admin)
create policy "Allow authenticated actions"
on public.vehicles
for all
to authenticated
using (true)
with check (true);

-- Create bucket for vehicle images
insert into storage.buckets (id, name, public)
values ('vehicles', 'vehicles', true)
on conflict (id) do nothing;

-- Policy: Public read access to storage
create policy "Give public access to vehicle images"
on storage.objects
for select
to public
using (bucket_id = 'vehicles');

-- Policy: Authenticated upload access
create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'vehicles');
