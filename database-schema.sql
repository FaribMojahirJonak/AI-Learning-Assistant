-- Complete Database Schema for Learning App

-- 1. user_profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table user_profiles enable row level security;
create policy "Users can view their profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can insert their profile" on user_profiles for insert with check (auth.uid() = id);
create policy "Users can update their profile" on user_profiles for update using (auth.uid() = id);

-- 2. lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  topic text,
  created_by uuid references user_profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table lessons enable row level security;
create policy "Anyone can view lessons" on lessons for select using (true);
create policy "Only creator can insert lessons" on lessons for insert with check (auth.uid() = created_by);
create policy "Only creator can update lessons" on lessons for update using (auth.uid() = created_by);
create policy "Only creator can delete lessons" on lessons for delete using (auth.uid() = created_by);

-- 3. quizzes
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  title text not null,
  questions jsonb not null, -- Array of questions with options and correct answers
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table quizzes enable row level security;
create policy "Anyone can view quizzes" on quizzes for select using (true);
create policy "Only lesson creator can insert quizzes" on quizzes for insert with check (
  auth.uid() = (select created_by from lessons where lessons.id = lesson_id)
);
create policy "Only lesson creator can update quizzes" on quizzes for update using (
  auth.uid() = (select created_by from lessons where lessons.id = lesson_id)
);
create policy "Only lesson creator can delete quizzes" on quizzes for delete using (
  auth.uid() = (select created_by from lessons where lessons.id = lesson_id)
);

-- 4. results
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  quiz_id uuid references quizzes(id) on delete cascade,
  answers jsonb not null, -- User's answers
  score int,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table results enable row level security;
create policy "Users can view their results" on results for select using (auth.uid() = user_id);
create policy "Users can insert their results" on results for insert with check (auth.uid() = user_id);
create policy "Users can update their results" on results for update using (auth.uid() = user_id);
create policy "Users can delete their results" on results for delete using (auth.uid() = user_id);

-- 5. pdfs
create table if not exists public.pdfs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  quiz_id uuid references quizzes(id) on delete cascade,
  pdf_url text not null,
  filename text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table pdfs enable row level security;
create policy "Users can view their PDFs" on pdfs for select using (auth.uid() = user_id);
create policy "Users can insert their PDFs" on pdfs for insert with check (auth.uid() = user_id);
create policy "Users can update their PDFs" on pdfs for update using (auth.uid() = user_id);
create policy "Users can delete their PDFs" on pdfs for delete using (auth.uid() = user_id); 