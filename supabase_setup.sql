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
  course_id text not null,
  progress integer default 0,
  completed boolean default false,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- 4) تفعيل RLS على الجداول
alter table public.profiles enable row level security;
alter table public.notifications enable row level security;
alter table public.enrollments enable row level security;

-- 5) Policies للـ profiles
create policy "profile_select" on public.profiles for select using (auth.uid() = id);
create policy "profile_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profile_update" on public.profiles for update using (auth.uid() = id);

-- للـ leaderboard: كل الناس تشوف الـ xp والاسم
create policy "profile_leaderboard" on public.profiles for select using (true);

-- 6) Policies للـ notifications
create policy "notif_select" on public.notifications for select using (auth.uid() = user_id);
create policy "notif_insert" on public.notifications for insert with check (auth.uid() = user_id);
create policy "notif_update" on public.notifications for update using (auth.uid() = user_id);

-- 7) Policies للـ enrollments
create policy "enroll_select" on public.enrollments for select using (auth.uid() = user_id);
create policy "enroll_insert" on public.enrollments for insert with check (auth.uid() = user_id);
create policy "enroll_update" on public.enrollments for update using (auth.uid() = user_id);

-- 8) Function: بتعمل profile أوتوماتيك لما حد يسجل
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  -- إشعار ترحيب
  insert into public.notifications (user_id, title, body)
  values (new.id, 'مرحباً بك في ALSHHAB! 🎉', 'ابدأ رحلتك التعليمية الآن واكسب أول 10 XP');

  return new;
end;
$$ language plpgsql security definer;

-- 9) Trigger على التسجيل
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
