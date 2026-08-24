-- ============================================================
-- VU Helping Desk — Supabase Database Schema
-- Agar aapne PEHLE se koi Supabase project banaya hua hai jisme
-- ye SQL Run kar chuke hain (content_items table already hai),
-- to ye dobara chalane ki ZAROORAT NAHI — same project reuse
-- kar sakte hain, sirf naya repo ke supabase-config.js mein
-- wahi purani URL/key daal dein.
--
-- Sirf tab chalayen jab BILKUL NAYA Supabase project bana ho.
-- ============================================================

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  data jsonb not null default '{}'::jsonb,
  file_url text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists content_items_category_idx on content_items(category);

alter table content_items enable row level security;

create policy "Public can read content_items"
on content_items for select
to anon, authenticated
using (true);

create policy "Authenticated can insert content_items"
on content_items for insert
to authenticated
with check (true);

create policy "Authenticated can update content_items"
on content_items for update
to authenticated
using (true);

create policy "Authenticated can delete content_items"
on content_items for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "Public can view uploaded files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'uploads');

create policy "Authenticated can upload files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'uploads');

create policy "Authenticated can delete files"
on storage.objects for delete
to authenticated
using (bucket_id = 'uploads');
