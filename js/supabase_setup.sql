-- ============================================
-- ALSHHAB Platform — Supabase SQL Setup
-- الصق الكود ده في SQL Editor في Supabase
-- ============================================

-- 1) جدول البروفايل
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  xp integer default 0,
  streak integer default 0,
  role text default 'student',
  last_active date,
  created_at timestamptz default now()
);

-- 2) جدول الإشعارات
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  body text default '',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 3) جدول التسجيل في الكورسات
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  course_id uuid,
  progress integer default 0,
  completed boolean default false,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- 4) جدول الكورسات
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  category text default 'other',
  price numeric default 0,
  emoji text default '📚',
  hours numeric default 0,
  lessons_count integer default 0,
  lessons jsonb default '[]'::jsonb,   -- ← الدروس كاملة (عنوان + youtubeId)
  instructor text default '',
  students integer default 0,
  rating numeric default 5,
  status text default 'active',        -- 'active' | 'soon'
  is_new boolean default false,
  is_hot boolean default false,
  created_at timestamptz default now()
);

-- 5) جدول المفضلة
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, course_id)
);

-- 6) جدول الشهادات
create table if not exists public.certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  issued_at timestamptz default now(),
  unique(user_id, course_id)
);

-- 7) جدول طلبات الدفع اليدوي
create table if not exists public.payment_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  course_title text default '',
  amount numeric not null,
  method text default 'vodafone',
  phone text default '',
  receipt_url text default '',
  status text default 'pending',       -- 'pending' | 'approved' | 'rejected'
  admin_note text default '',
  created_at timestamptz default now()
);

-- 8) جدول المدفوعات المؤكدة (Paymob webhook)
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  txn_id text,
  amount numeric,
  status text default 'paid',
  created_at timestamptz default now()
);

-- ============================================
-- تفعيل RLS
-- ============================================
alter table public.profiles enable row level security;
alter table public.notifications enable row level security;
alter table public.enrollments enable row level security;
alter table public.courses enable row level security;
alter table public.favorites enable row level security;
alter table public.certificates enable row level security;
alter table public.payment_requests enable row level security;
alter table public.payments enable row level security;

-- ============================================
-- Policies — profiles
-- ============================================
drop policy if exists "profile_select" on public.profiles;
drop policy if exists "profile_all_select" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- ============================================
-- Policies — notifications
-- ============================================
create policy "notif_select" on public.notifications for select using (auth.uid() = user_id);
create policy "notif_insert" on public.notifications for insert with check (auth.uid() = user_id);
create policy "notif_update" on public.notifications for update using (auth.uid() = user_id);
-- الأدمن يقدر يبعت إشعارات لأي حد
create policy "notif_admin_insert" on public.notifications for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- Policies — enrollments
-- ============================================
create policy "enroll_select" on public.enrollments for select using (auth.uid() = user_id);
create policy "enroll_insert" on public.enrollments for insert with check (auth.uid() = user_id);
create policy "enroll_update" on public.enrollments for update using (auth.uid() = user_id);
-- الأدمن يسجّل طالب في كورس
create policy "enroll_admin_insert" on public.enrollments for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "enroll_admin_update" on public.enrollments for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- Policies — courses
-- ============================================
create policy "courses_select_all" on public.courses for select using (true);
create policy "courses_admin_insert" on public.courses for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "courses_admin_update" on public.courses for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "courses_admin_delete" on public.courses for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- Policies — favorites
-- ============================================
create policy "favorites_select" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_insert" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete" on public.favorites for delete using (auth.uid() = user_id);

-- ============================================
-- Policies — certificates
-- ============================================
create policy "certs_select" on public.certificates for select using (auth.uid() = user_id);
create policy "certs_admin_insert" on public.certificates for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- Policies — payment_requests
-- ============================================
create policy "payreq_select_own" on public.payment_requests for select using (auth.uid() = user_id);
create policy "payreq_insert" on public.payment_requests for insert with check (auth.uid() = user_id);
-- الأدمن يشوف كل الطلبات ويعدّلها
create policy "payreq_admin_select" on public.payment_requests for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "payreq_admin_update" on public.payment_requests for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- Policies — payments
-- ============================================
create policy "payments_admin" on public.payments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- Function: بروفايل أوتوماتيك عند التسجيل
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;

  insert into public.notifications (user_id, title, body)
  values (new.id, 'مرحباً بك في ALSHEHAB! 🎉', 'ابدأ رحلتك التعليمية الآن واكسب أول 10 XP');

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Function: شهادة أوتوماتيك عند إكمال الكورس
-- ============================================
create or replace function public.handle_enrollment_complete()
returns trigger as $$
begin
  if new.completed = true and (old.completed = false or old.completed is null) then
    insert into public.certificates (user_id, course_id)
    values (new.user_id, new.course_id)
    on conflict (user_id, course_id) do nothing;

    insert into public.notifications (user_id, title, body)
    values (new.user_id, '🎓 تهانينا! حصلت على شهادة', 'أكملت الكورس بنجاح واستحقت شهادتك');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_enrollment_complete on public.enrollments;
create trigger on_enrollment_complete
  after update on public.enrollments
  for each row execute procedure public.handle_enrollment_complete();

-- ============================================
-- ⚡ عشان تعمل حساب أدمن — شغّل السطر ده:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';
-- ============================================
