# 🗄️ Supabase Database Setup for OBTASK AI

## 🎯 Quick Setup Instructions

### Step 1: Access Your Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Find your project: **esgoiucahvofyonfsexn**
3. Click on your project to open it

### Step 2: Run the Database Schema
1. **Click "SQL Editor"** in the left sidebar
2. **Copy the corrected schema** below
3. **Paste it** into the SQL Editor
4. **Click "Run"** to execute

## 📋 Corrected Database Schema

Copy and paste this **exact** SQL into your Supabase SQL Editor:

```sql
-- Create profiles table (auth.users is already managed by Supabase)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  status text check (status in ('active', 'completed', 'paused')) default 'active',
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  due_date timestamp with time zone
);

-- Create project_members table
create table public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text check (status in ('todo', 'in_progress', 'completed')) default 'todo',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  due_date timestamp with time zone
);

-- Create meetings table
create table public.meetings (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  recording_url text,
  transcript text,
  ai_summary text,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create meeting_attendees table
create table public.meeting_attendees (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references public.meetings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(meeting_id, user_id)
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_attendees enable row level security;

-- Create RLS policies

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Projects policies
create policy "Users can view projects they are members of"
  on public.projects for select
  using (
    auth.uid() = created_by or
    auth.uid() in (
      select user_id from public.project_members
      where project_id = projects.id
    )
  );

create policy "Users can create projects"
  on public.projects for insert
  with check (auth.uid() = created_by);

create policy "Project owners and admins can update projects"
  on public.projects for update
  using (
    auth.uid() = created_by or
    auth.uid() in (
      select user_id from public.project_members
      where project_id = projects.id and role in ('owner', 'admin')
    )
  );

create policy "Project owners can delete projects"
  on public.projects for delete
  using (auth.uid() = created_by);

-- Project members policies
create policy "Users can view project members for their projects"
  on public.project_members for select
  using (
    auth.uid() = user_id or
    auth.uid() in (
      select created_by from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members pm2
      where pm2.project_id = project_members.project_id
    )
  );

create policy "Project owners and admins can manage members"
  on public.project_members for all
  using (
    auth.uid() in (
      select created_by from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members
      where project_id = project_members.project_id and role in ('owner', 'admin')
    )
  );

-- Tasks policies
create policy "Users can view tasks in their projects"
  on public.tasks for select
  using (
    auth.uid() in (
      select created_by from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members
      where project_id = tasks.project_id
    )
  );

create policy "Users can create tasks in their projects"
  on public.tasks for insert
  with check (
    auth.uid() in (
      select created_by from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members
      where project_id = tasks.project_id
    )
  );

create policy "Users can update tasks in their projects"
  on public.tasks for update
  using (
    auth.uid() in (
      select created_by from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members
      where project_id = tasks.project_id
    )
  );

create policy "Users can delete tasks they created"
  on public.tasks for delete
  using (
    auth.uid() = created_by or
    auth.uid() in (
      select created_by from public.projects where id = project_id
    )
  );

-- Meetings policies (similar pattern)
create policy "Users can view meetings in their projects"
  on public.meetings for select
  using (
    auth.uid() in (
      select created_by from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members
      where project_id = meetings.project_id
    )
  );

create policy "Users can create meetings in their projects"
  on public.meetings for insert
  with check (
    auth.uid() in (
      select created_by from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members
      where project_id = meetings.project_id
    )
  );

create policy "Users can update meetings they created"
  on public.meetings for update
  using (auth.uid() = created_by);

create policy "Users can delete meetings they created"
  on public.meetings for delete
  using (auth.uid() = created_by);

-- Meeting attendees policies
create policy "Users can view attendees for meetings they can access"
  on public.meeting_attendees for select
  using (
    auth.uid() = user_id or
    auth.uid() in (
      select created_by from public.meetings where id = meeting_id
    )
  );

create policy "Meeting creators can manage attendees"
  on public.meeting_attendees for all
  using (
    auth.uid() in (
      select created_by from public.meetings where id = meeting_id
    )
  );

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at column
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_projects_updated_at
  before update on public.projects
  for each row execute procedure public.handle_updated_at();

create trigger handle_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

create trigger handle_meetings_updated_at
  before update on public.meetings
  for each row execute procedure public.handle_updated_at();
```

## ✅ After Running the Schema

Your database will have:
- **5 Tables**: profiles, projects, project_members, tasks, meetings, meeting_attendees
- **Row Level Security**: Enabled on all tables
- **Security Policies**: Users can only access their own data
- **Automatic Profile Creation**: When users sign up
- **Updated Timestamps**: Automatically managed

## 🎉 You're Ready!

Once the schema runs successfully, your OBTASK AI application will be fully functional with:
- ✅ Secure user authentication
- ✅ Project management
- ✅ Voice recording and AI task extraction
- ✅ Team collaboration
- ✅ Mobile-responsive design

## 🚀 Next: Deploy to Vercel

After setting up the database, follow the Vercel deployment instructions to get your app live!