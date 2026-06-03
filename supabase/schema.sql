-- ===========================================================
-- ตาราง activities สำหรับเก็บข้อมูลกิจกรรม
-- รันสคริปต์นี้ใน Supabase: เมนู SQL Editor > New query > วาง > Run
-- ===========================================================

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  activity_type text not null default 'กิจกรรม',
  teacher_name text not null default '',
  activity_date date not null default current_date,
  notes text,
  file_url text,
  file_name text,
  created_at timestamptz not null default now()
);

-- เผื่อกรณีตารางถูกสร้างไว้ก่อนแล้ว (เพิ่มคอลัมน์ใหม่แบบปลอดภัย)
alter table public.activities
  add column if not exists activity_type text not null default 'กิจกรรม';

-- ดัชนีช่วยให้เรียงตามวันที่เร็วขึ้น
create index if not exists activities_date_idx
  on public.activities (activity_date desc);

-- เปิดใช้ Row Level Security
alter table public.activities enable row level security;

-- เนื่องจากแอพนี้ไม่มีระบบล็อกอิน จึงอนุญาตให้ผู้ใช้ทั่วไป (anon)
-- อ่าน/เพิ่ม/แก้/ลบ ได้ทั้งหมด
-- *** หากต้องการความปลอดภัยมากขึ้น ควรเพิ่มระบบล็อกอินภายหลัง ***
drop policy if exists "public access" on public.activities;
create policy "public access"
  on public.activities
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ===========================================================
-- ที่เก็บไฟล์รายงาน (Storage Bucket) ชื่อ "reports"
-- ไฟล์จะถูกแยกเก็บเป็น 2 โฟลเดอร์ตามประเภทงาน:
--   - activity/  = ไฟล์ของประเภท "กิจกรรม"
--   - training/  = ไฟล์ของประเภท "อบรม"
-- ===========================================================
insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do nothing;

-- อนุญาตให้ผู้ใช้ทั่วไปอัปโหลด/อ่าน/ลบไฟล์ใน bucket นี้
drop policy if exists "reports public read" on storage.objects;
create policy "reports public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'reports');

drop policy if exists "reports public insert" on storage.objects;
create policy "reports public insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'reports');

drop policy if exists "reports public delete" on storage.objects;
create policy "reports public delete"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'reports');
