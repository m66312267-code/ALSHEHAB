-- ============================================
-- إضافة جدول التعليقات لمنصة ALSHEHAB
-- شغّل هذا في Supabase SQL Editor
-- ============================================

create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses on delete cascade,
  user_id uuid references auth.users on delete cascade,
  user_name text default 'طالب',
  text text not null,
  stars integer default 0 check (stars >= 0 and stars <= 5),
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

-- أي حد يقدر يقرأ التعليقات
create policy "comments_select" on public.comments
  for select using (true);

-- المستخدم المسجل يضيف تعليق
create policy "comments_insert" on public.comments
  for insert with check (auth.uid() = user_id);

-- المستخدم يحذف تعليقه بس
create policy "comments_delete" on public.comments
  for delete using (auth.uid() = user_id);

-- الأدمن يحذف أي تعليق
create policy "comments_admin_delete" on public.comments
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
