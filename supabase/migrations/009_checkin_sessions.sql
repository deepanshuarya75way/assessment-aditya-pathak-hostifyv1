create table if not exists
public.checkin_sessions (
  id uuid primary key DEFAULT
  gen_random_uuid(),
  
  team_id uuid not null,

  token_hash text not null unique,

  status text not null default 'waiting'

  check (status in ('waiting','approved', 'expired')),

  approved_by uuid null,

  created_at timestamptz not null default now(),

  expires_at timestamptz not null, 

  approved_at timestamptz null

);

 create index if not exists
  
  checkin_sessions_token_hash_idx

  on 

  public.checkin_sessions(token_hash);
 
  create index if not exists 
  checkin_sessions_team_id_idx
  on public.checkin_sessions(team_id);

  create index if not exists 
  checkin_sessions_expires_at_idx
  On 
  public.checkin_sessions(expires_at);