-- SolanaSignal — Supabase Schema
-- Run this in your Supabase SQL editor

-- Decisions table
create table if not exists decisions (
  id text primary key,
  token text not null,
  signal text not null check (signal in ('BUY', 'HOLD', 'SELL')),
  confidence integer not null,
  reasoning text,
  action_taken text,
  entry_price numeric,
  current_price numeric,
  pnl numeric default 0,
  pnl_pct text,
  tx_hash text,
  payment_tx_hash text,
  merkle_root text,
  merkle_proof jsonb,
  executed boolean default false,
  news_count integer default 0,
  created_at timestamptz default now()
);

-- x402 payments table
create table if not exists x402_payments (
  id uuid primary key default gen_random_uuid(),
  tx_hash text not null,
  amount numeric not null default 0.001,
  currency text not null default 'USDC',
  recipient text,
  memo text,
  query_type text,
  token text,
  status text default 'confirmed',
  created_at timestamptz default now()
);

-- Memo v2 logs table
create table if not exists memo_logs (
  id uuid primary key default gen_random_uuid(),
  tx_hash text not null,
  memo_text text not null,
  program text,
  slot bigint,
  decision_id text references decisions(id),
  merkle_root text,
  created_at timestamptz default now()
);

-- Agent state (singleton row)
create table if not exists agent_state (
  id text primary key default 'singleton',
  merkle_root text,
  decision_count integer default 0,
  last_updated timestamptz default now(),
  pda_address text,
  personality jsonb
);

-- Enable RLS and allow anon reads (for frontend)
alter table decisions enable row level security;
alter table x402_payments enable row level security;
alter table memo_logs enable row level security;
alter table agent_state enable row level security;

create policy "public read decisions" on decisions for select using (true);
create policy "public read payments" on x402_payments for select using (true);
create policy "public read memos" on memo_logs for select using (true);
create policy "public read agent_state" on agent_state for select using (true);

-- Service role can write everything (backend uses service key)
create policy "service write decisions" on decisions for all using (true) with check (true);
create policy "service write payments" on x402_payments for all using (true) with check (true);
create policy "service write memos" on memo_logs for all using (true) with check (true);
create policy "service write agent_state" on agent_state for all using (true) with check (true);

-- Indexes for performance
create index if not exists decisions_created_at_idx on decisions(created_at desc);
create index if not exists decisions_token_idx on decisions(token);
create index if not exists payments_created_at_idx on x402_payments(created_at desc);
create index if not exists memos_created_at_idx on memo_logs(created_at desc);
