# BACKEND.md — Supabase setup for NEST UI 2026 Registration

Run each block **in order** in the Supabase SQL Editor (Dashboard → SQL Editor → New query). Each is independent and idempotent where practical. Do not skip.

> New-key note: this project uses Supabase’s **new API keys** (`sb_publishable_…` / `sb_secret_…`). The publishable key maps to the `anon`/`authenticated` Postgres roles; the secret key maps to `service_role` and **bypasses RLS**. All policy/grant statements below target those roles and work identically under the new keys.

---

## Step 1 — Extensions

Enables `gen_random_uuid()` for primary keys. `pgcrypto` ships with Supabase; this is a safety no-op if already present.

```sql
create extension if not exists pgcrypto;
```

---

## Step 2 — Enum types

Two enums: the fixed set of competitions (a check-constrained enum keeps bad values out at the DB level) and the review status. Wrapped in a guard so re-running is safe.

```sql
do $$
begin
  if not exists (select 1 from pg_type where typname = 'competition_type') then
    create type competition_type as enum ('medhack', 'healthineer', 'healthynovation');
  end if;
  if not exists (select 1 from pg_type where typname = 'registration_status') then
    create type registration_status as enum ('pending', 'verified', 'rejected');
  end if;
end$$;
```

---

## Step 3 — Per-competition code sequences

One atomic sequence per competition so the human-readable `code` (`NEST2026-MDH-0001`) never collides under concurrent inserts.

```sql
create sequence if not exists reg_seq_medhack;
create sequence if not exists reg_seq_healthineer;
create sequence if not exists reg_seq_healthynovation;
```

---

## Step 4 — `registrations` table (team + leader, 1:1)

The team row. Holds the leader inline (a team has exactly one leader), the two team-level Google-Drive links, status, owner, and generated code. The `team_size` CHECK encodes each competition’s allowed range; the partial unique indexes prevent duplicate leader emails per competition and cap one team per user per competition.

```sql
create table if not exists public.registrations (
  id              uuid primary key default gen_random_uuid(),
  code            text unique,
  user_id         uuid not null references auth.users(id) on delete cascade,
  competition     competition_type not null,
  team_name       text not null check (char_length(team_name) between 1 and 120),
  team_size       int  not null,
  leader_name         text not null check (char_length(leader_name) between 1 and 120),
  leader_email        text not null check (leader_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  leader_phone        text not null check (char_length(leader_phone) between 5 and 30),
  leader_student_id   text not null check (char_length(leader_student_id) between 1 and 60),
  leader_institution  text not null check (char_length(leader_institution) between 1 and 160),
  leader_major        text,
  leader_confirmation_url text not null,
  payment_proof_url   text not null,
  submission_url      text not null,
  status          registration_status not null default 'pending',
  submitted_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  constraint team_size_range check (
    (competition in ('medhack','healthineer') and team_size between 3 and 5)
    or (competition = 'healthynovation' and team_size between 1 and 3)
  )
);

-- one team per user per competition (idempotency / anti-spam)
create unique index if not exists uq_reg_user_competition
  on public.registrations (user_id, competition);

-- no duplicate leader email within a competition
create unique index if not exists uq_reg_comp_leader_email
  on public.registrations (competition, lower(leader_email));
```

---

## Step 5 — `team_members` table (N per team)

Non-leader members, ordered by `member_index` (1..N). `on delete cascade` keeps them tied to their team. `UNIQUE(registration_id, member_index)` keeps ordering clean and blocks accidental double-inserts.

```sql
create table if not exists public.team_members (
  id               uuid primary key default gen_random_uuid(),
  registration_id  uuid not null references public.registrations(id) on delete cascade,
  member_index     int  not null check (member_index >= 1),
  name             text not null check (char_length(name) between 1 and 120),
  email            text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone            text not null check (char_length(phone) between 5 and 30),
  student_id       text not null check (char_length(student_id) between 1 and 60),
  institution      text not null check (char_length(institution) between 1 and 160),
  major            text,
  confirmation_url text not null,
  created_at       timestamptz not null default now(),
  unique (registration_id, member_index)
);
```

---

## Step 6 — Indexes for admin filter/sort

Backs the admin dashboard’s per-competition filter, date sort, status filter, and the member join. `(user_id, competition)` and the email uniqueness are already indexed by Step 4.

```sql
create index if not exists idx_reg_competition   on public.registrations (competition);
create index if not exists idx_reg_submitted_at  on public.registrations (submitted_at desc);
create index if not exists idx_reg_status        on public.registrations (status);
create index if not exists idx_members_reg       on public.team_members (registration_id);
```

---

## Step 7 — Registration code trigger

Generates `NEST2026-<MDH|HTN|HNV>-0001` from the per-competition sequence on insert. Runs BEFORE INSERT so `code` is set atomically inside the same transaction.

```sql
create or replace function public.set_registration_code()
returns trigger
language plpgsql
as $$
declare
  abbr text;
  seq  bigint;
begin
  if new.code is not null then
    return new;
  end if;
  case new.competition
    when 'medhack'         then abbr := 'MDH'; seq := nextval('reg_seq_medhack');
    when 'healthineer'     then abbr := 'HTN'; seq := nextval('reg_seq_healthineer');
    when 'healthynovation' then abbr := 'HNV'; seq := nextval('reg_seq_healthynovation');
  end case;
  new.code := 'NEST2026-' || abbr || '-' || lpad(seq::text, 4, '0');
  return new;
end$$;

drop trigger if exists trg_set_registration_code on public.registrations;
create trigger trg_set_registration_code
  before insert on public.registrations
  for each row execute function public.set_registration_code();
```

---

## Step 8 — Atomic submission function (the transaction)

`submit_registration` inserts the team + all members in **one transaction** and validates server-side inside the DB: member count must equal `team_size − 1`, the size must match the competition’s range, and no email may repeat across leader+members. Any failure raises and rolls back the whole thing — no partial teams. `SECURITY DEFINER` lets it write while RLS stays deny-all for clients; `EXECUTE` is granted to `service_role` only (Step 11), so it’s callable only from our server. Members arrive as a JSON array (parameterized — no string SQL).

```sql
create or replace function public.submit_registration(
  p_user_id            uuid,
  p_competition        competition_type,
  p_team_name          text,
  p_team_size          int,
  p_leader_name        text,
  p_leader_email       text,
  p_leader_phone       text,
  p_leader_student_id  text,
  p_leader_institution text,
  p_leader_major       text,
  p_leader_confirmation_url text,
  p_payment_proof_url  text,
  p_submission_url     text,
  p_members            jsonb   -- [{name,email,phone,student_id,institution,major,confirmation_url}, ...]
)
returns text  -- returns the generated registration code
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reg_id  uuid;
  v_code    text;
  v_count   int;
  v_emails  text[];
  m         jsonb;
  i         int := 0;
begin
  v_count := jsonb_array_length(coalesce(p_members, '[]'::jsonb));

  -- member count must match declared team size (server-side, even if client lies)
  if v_count <> p_team_size - 1 then
    raise exception 'member_count_mismatch: expected %, got %', p_team_size - 1, v_count;
  end if;

  -- team size must be in the competition's allowed range (defense in depth vs the CHECK)
  if (p_competition in ('medhack','healthineer') and p_team_size not between 3 and 5)
     or (p_competition = 'healthynovation' and p_team_size not between 1 and 3) then
    raise exception 'invalid_team_size for %: %', p_competition, p_team_size;
  end if;

  -- collect all emails (leader + members) and reject duplicates
  v_emails := array[lower(trim(p_leader_email))];
  for m in select * from jsonb_array_elements(coalesce(p_members, '[]'::jsonb)) loop
    v_emails := v_emails || lower(trim(m->>'email'));
  end loop;
  if (select count(distinct e) from unnest(v_emails) e) <> array_length(v_emails, 1) then
    raise exception 'duplicate_email_in_team';
  end if;

  insert into public.registrations (
    user_id, competition, team_name, team_size,
    leader_name, leader_email, leader_phone, leader_student_id,
    leader_institution, leader_major, leader_confirmation_url,
    payment_proof_url, submission_url
  ) values (
    p_user_id, p_competition, p_team_name, p_team_size,
    p_leader_name, p_leader_email, p_leader_phone, p_leader_student_id,
    p_leader_institution, nullif(p_leader_major, ''), p_leader_confirmation_url,
    p_payment_proof_url, p_submission_url
  )
  returning id, code into v_reg_id, v_code;

  for m in select * from jsonb_array_elements(coalesce(p_members, '[]'::jsonb)) loop
    i := i + 1;
    insert into public.team_members (
      registration_id, member_index, name, email, phone,
      student_id, institution, major, confirmation_url
    ) values (
      v_reg_id, i, m->>'name', m->>'email', m->>'phone',
      m->>'student_id', m->>'institution', nullif(m->>'major',''), m->>'confirmation_url'
    );
  end loop;

  return v_code;
end$$;
```

---

## Step 9 — Admin flattened detail view

Joins each team with its members as an ordered JSON array — one row per team. The admin list, detail page, and CSV export all read from this so there’s a single shape to maintain.

```sql
create or replace view public.admin_registrations_detail
with (security_invoker = true) as
select
  r.*,
  coalesce(
    (select jsonb_agg(to_jsonb(tm) order by tm.member_index)
       from public.team_members tm
      where tm.registration_id = r.id),
    '[]'::jsonb
  ) as members
from public.registrations r;
```
> `security_invoker = true` makes the view respect the querying role’s RLS. The admin server reads it with the **secret key** (bypasses RLS); clients cannot read it (Step 10/11).

---

## Step 10 — Enable RLS + policies (deny-by-default)

Turning RLS on with no permissive policy = **deny all** for `anon`/`authenticated`. We then add exactly one narrow policy: a logged-in user may SELECT only their own team (to view their submission). No client INSERT/UPDATE/DELETE at all — every write goes through the server (secret key) or the `SECURITY DEFINER` function. `service_role` (secret key) bypasses RLS entirely, so it needs no policy.

```sql
alter table public.registrations  enable row level security;
alter table public.team_members   enable row level security;

-- a user can read only their own registration
drop policy if exists reg_select_own on public.registrations;
create policy reg_select_own on public.registrations
  for select to authenticated
  using (user_id = auth.uid());

-- a user can read only the members of their own registration
drop policy if exists members_select_own on public.team_members;
create policy members_select_own on public.team_members
  for select to authenticated
  using (exists (
    select 1 from public.registrations r
    where r.id = team_members.registration_id and r.user_id = auth.uid()
  ));
-- (no insert/update/delete policies => those are denied for anon & authenticated)
```

---

## Step 11 — Grants / revokes (lock down the client roles)

Explicitly strip table privileges from the publishable-key roles beyond the RLS-guarded SELECT, and make the submission function callable only by the server. Belt-and-suspenders on top of RLS.

```sql
-- registration tables: clients get SELECT only (further filtered by RLS above)
revoke all on public.registrations on public.team_members from anon, authenticated;
grant select on public.registrations to authenticated;
grant select on public.team_members  to authenticated;

-- the submission RPC: server (service_role) only, never the browser
revoke all on function public.submit_registration(
  uuid, competition_type, text, int, text, text, text, text, text, text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.submit_registration(
  uuid, competition_type, text, int, text, text, text, text, text, text, text, text, text, jsonb
) to service_role;

-- admin detail view: server only
revoke all on public.admin_registrations_detail from anon, authenticated;
```

---

## Step 12 — Rate-limit table + function

A DB-backed fixed-window counter (correct across serverless instances, unlike an in-memory map). `check_rate_limit` returns `true` if the call is allowed and increments the window. Used by the submission action and the admin login. Server-only (`service_role`).

```sql
create table if not exists public.rate_limits (
  key           text primary key,
  count         int  not null default 0,
  window_start  timestamptz not null default now()
);
alter table public.rate_limits enable row level security;  -- deny all clients; server bypasses

create or replace function public.check_rate_limit(
  p_key text, p_max int, p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rate_limits%rowtype;
begin
  select * into v_row from public.rate_limits where key = p_key for update;
  if not found then
    insert into public.rate_limits(key, count, window_start) values (p_key, 1, now());
    return true;
  end if;
  if now() - v_row.window_start > make_interval(secs => p_window_seconds) then
    update public.rate_limits set count = 1, window_start = now() where key = p_key;
    return true;
  end if;
  if v_row.count >= p_max then
    return false;
  end if;
  update public.rate_limits set count = count + 1 where key = p_key;
  return true;
end$$;

revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant  execute on function public.check_rate_limit(text, int, int) to service_role;
```

---

## Step 13 — (Optional) Admin status update helper

Lets the admin panel flip `pending → verified/rejected` through one audited entry point (still server/secret-key only). Skip if you’ll update status directly with the secret key.

```sql
create or replace function public.set_registration_status(
  p_id uuid, p_status registration_status
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.registrations set status = p_status where id = p_id;
end$$;

revoke all on function public.set_registration_status(uuid, registration_status) from public, anon, authenticated;
grant  execute on function public.set_registration_status(uuid, registration_status) to service_role;
```

---

## Step 14 — Admin "delete team" support — **no migration required**

The admin panel’s "Delete" button removes a whole team and all its members. **You do not need to run any SQL for this.** The server action deletes the `registrations` row with the secret key (bypasses RLS), and `team_members.registration_id` was declared `on delete cascade` in Step 5 — so the members rows are removed automatically in the same operation.

Nothing to paste here. (If you would rather route deletes through an audited RPC to match `set_registration_status`, the optional function below does that; the app currently uses the direct delete and does **not** require it.)

```sql
-- OPTIONAL — only if you prefer an RPC entry point over the direct delete.
create or replace function public.delete_registration(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  delete from public.registrations where id = p_id;  -- cascades to team_members
end$$;

revoke all on function public.delete_registration(uuid) from public, anon, authenticated;
grant  execute on function public.delete_registration(uuid) to service_role;
```

---

## Step 15 — Additional submissions ("Submit again") — **required for the resubmit feature**

A team can now pay again and attach another submission from their dashboard. Each extra submission is its own reviewable row. The original submission stays inline on `registrations` (it is **Entry 1**); every resubmission after that is a row here (**Entry 2, 3, …**). The dashboard merges the inline Entry 1 with these rows into one list, so nothing needs to move.

```sql
create table if not exists public.submissions (
  id                uuid primary key default gen_random_uuid(),
  registration_id   uuid not null references public.registrations(id) on delete cascade,
  payment_proof_url text not null,
  submission_url    text not null,
  status            registration_status not null default 'pending',
  submitted_at      timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists idx_submissions_reg on public.submissions (registration_id);

alter table public.submissions enable row level security;

-- a user can read submissions belonging to their own registration (dashboard)
drop policy if exists submissions_select_own on public.submissions;
create policy submissions_select_own on public.submissions
  for select to authenticated
  using (exists (
    select 1 from public.registrations r
    where r.id = submissions.registration_id and r.user_id = auth.uid()
  ));

-- clients get SELECT only (RLS-filtered); no client insert (goes through the RPC)
revoke all on public.submissions from anon, authenticated;
grant select on public.submissions to authenticated;
```

`add_submission` validates that the caller owns the registration, then inserts one submission. `SECURITY DEFINER`, `service_role` only — same pattern as `submit_registration`.

```sql
create or replace function public.add_submission(
  p_user_id           uuid,
  p_registration_id   uuid,
  p_payment_proof_url text,
  p_submission_url    text
) returns uuid  -- returns the new submission id
language plpgsql security definer set search_path = public
as $$
declare
  v_owner uuid;
  v_id    uuid;
begin
  select user_id into v_owner from public.registrations where id = p_registration_id;
  if v_owner is null then
    raise exception 'registration_not_found';
  end if;
  if v_owner <> p_user_id then
    raise exception 'not_registration_owner';
  end if;

  insert into public.submissions (registration_id, payment_proof_url, submission_url)
  values (p_registration_id, p_payment_proof_url, p_submission_url)
  returning id into v_id;

  return v_id;
end$$;

revoke all on function public.add_submission(uuid, uuid, text, text) from public, anon, authenticated;
grant  execute on function public.add_submission(uuid, uuid, text, text) to service_role;
```

---

## Step 16 — (Follow-up) Admin review of resubmissions

The admin panel currently reviews only the inline Entry 1 (`registrations.status` via `set_registration_status`). To let admins verify/reject **resubmissions** too, add a per-submission status setter and surface the `submissions` rows in the admin detail page.

```sql
create or replace function public.set_submission_status(
  p_id uuid, p_status registration_status
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.submissions set status = p_status where id = p_id;
end$$;

revoke all on function public.set_submission_status(uuid, registration_status) from public, anon, authenticated;
grant  execute on function public.set_submission_status(uuid, registration_status) to service_role;
```

Optional, for a fully uniform model: aggregate submissions into `admin_registrations_detail` (mirroring how `members` is aggregated in Step 9) and, if you want Entry 1 to live in the table too, backfill one `submissions` row per existing registration from its inline columns — but that also requires updating the admin list/detail, the CSV export, and this view to read from the aggregate. Not needed for the resubmit feature itself.

---

## Environment Variables Checklist

Add these in Vercel (Project → Settings → Environment Variables) and to local `.env.local`. **Never** prefix a secret with `NEXT_PUBLIC_`.

| Var | Scope | Where used | Notes |
|-----|-------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | all Supabase clients | already set |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client | `lib/supabase/client.ts`, `server.ts`, `proxy.ts` | already set; RLS-bound |
| `SUPABASE_SECRET_KEY` | **server only** | `lib/supabase/admin.ts` (submission RPC, admin reads) | `sb_secret_…` from Supabase → Settings → API keys. Bypasses RLS. |
| `ADMIN_USERNAME` | server only | `app/admin/login/actions.ts` | e.g. `nest2026` |
| `ADMIN_PASSWORD` | server only | `app/admin/login/actions.ts` | e.g. `ADMIN123` |
| `ADMIN_SESSION_SECRET` | server only | `lib/admin/session.ts` | long random string; signs the admin cookie. Generate: `openssl rand -base64 48` |

> The admin credential is a **single shared login with no per-user audit trail** — an accepted tradeoff per the requirement, not a recommendation for multi-admin use.

### Local `.env.local` additions
```
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_USERNAME=nest2026
ADMIN_PASSWORD=ADMIN123
ADMIN_SESSION_SECRET=paste-openssl-rand-base64-48-output-here
```

## Verify (optional, after running all steps)
```sql
-- tables + RLS on?
select relname, relrowsecurity from pg_class
where relname in ('registrations','team_members','rate_limits');
-- policies present?
select tablename, policyname, cmd from pg_policies where schemaname='public';
-- function grants (service_role only)?
select p.proname, r.rolname
from pg_proc p
join information_schema.role_routine_grants g on g.routine_name = p.proname
join pg_roles r on r.rolname = g.grantee
where p.proname in ('submit_registration','check_rate_limit');
```
