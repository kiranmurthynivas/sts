-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type habit_status as enum ('active', 'completed', 'failed');
create type transaction_type as enum ('stake', 'penalty', 'reward');
create type user_role as enum ('user', 'admin');
create type day_of_week as enum ('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');

-- Users table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password text not null,
  wallet_address text,
  role user_role not null default 'user',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint proper_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Habits table
create table habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  days day_of_week[] not null default '{}',
  amount_staked decimal(28, 18) not null check (amount_staked >= 0),
  streak integer not null default 0,
  status habit_status not null default 'active',
  last_checked timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint valid_days check (array_length(days, 1) > 0)
);

-- Transactions table
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  type transaction_type not null,
  amount decimal(28, 18) not null check (amount > 0),
  tx_hash text,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  constraint valid_transaction check (
    (type = 'stake' and amount > 0) or
    (type in ('penalty', 'reward') and amount > 0)
  )
);

-- Indexes for better query performance
create index idx_habits_user_id on habits(user_id);
create index idx_habits_status on habits(status);
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_habit_id on transactions(habit_id);
create index idx_transactions_created_at on transactions(created_at);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
alter table users enable row level security;
alter table habits enable row level security;
alter table transactions enable row level security;

-- Users policies
create policy "Users can view their own profile"
  on users for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update using (auth.uid() = id);

-- Habits policies
create policy "Users can view their own habits"
  on habits for select using (auth.uid() = user_id);

create policy "Users can insert their own habits"
  on habits for insert with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on habits for update using (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on habits for delete using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view their own transactions"
  on transactions for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert with check (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers to update updated_at
create trigger update_users_updated_at
before update on users
for each row execute function update_updated_at_column();

create trigger update_habits_updated_at
before update on habits
for each row execute function update_updated_at_column();

-- Function to handle habit status updates
create or replace function update_habit_status()
returns trigger as $$
begin
  -- If last_checked is older than 2 days and status is active, mark as failed
  if old.status = 'active' and 
     new.last_checked is not null and 
     old.last_checked is distinct from new.last_checked and
     new.last_checked < (now() - interval '2 days')
  then
    new.status := 'failed';
  end if;
  
  return new;
end;
$$ language plpgsql;

create trigger update_habit_status_trigger
before update on habits
for each row execute function update_habit_status();
