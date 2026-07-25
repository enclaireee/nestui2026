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

## Step 14 — Admin "delete team" support — **REMOVED**

Team deletion has been removed from the admin panel. There is no longer a Delete button, and — importantly — **no server action that deletes a registration** (leaving one in place would leave a live deletion endpoint any valid admin session could hit). Registration rows are participant data and are not destroyable from the app.

If you ever genuinely need to remove a team, do it directly in the Supabase SQL editor:

```sql
-- Deletes the team and, via ON DELETE CASCADE on team_members.registration_id
-- (Step 5), all its members in the same operation.
delete from public.registrations where code = 'THE-TEAM-CODE';
```

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

## Step 16 — Admin review of resubmissions — **required for the admin Submissions view**

The admin panel now has two modes — **Teams** (one row per team; click through for that team's submissions) and **Submissions** (every submission across all teams, newest first; click through to the team). The team detail page shows Entry 1 **and** every resubmission, each with its own verify/reject control. All of that needs the two objects below.

> **Run this whole block once in the Supabase SQL editor.** It is idempotent (`create or replace`). It requires the `submissions` table from **Step 15** to already exist. Nothing else in the app changes shape — the existing `admin_registrations_detail` view and `set_registration_status` are untouched.

**(a) Per-submission status setter** — lets an admin verify/reject a resubmission (Entry 2+). Entry 1 still goes through `set_registration_status`.

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

**(b) Flattened "all submissions" view** — one row per submission across every team: Entry 1 (the inline submission on `registrations`) unioned with every `submissions` row (Entry 2, 3, …). Each row carries the owning team's identifying columns so the Submissions list can sort/search on its own, and an `entry_no` (1 = the inline Entry 1). The admin server reads it with the secret key (bypasses RLS); `security_invoker = true` + the revoke keep the publishable-key roles out.

```sql
create or replace view public.admin_submissions_detail
with (security_invoker = true) as
-- Entry 1: the inline submission that came with the registration.
select
  r.id                as submission_id,   -- Entry 1 has no submissions-row id; use the registration id
  r.id                as registration_id,
  r.code,
  r.team_name,
  r.competition,
  r.leader_email,
  true                as is_primary,
  1                   as entry_no,
  r.payment_proof_url,
  r.submission_url,
  r.status,
  r.submitted_at
from public.registrations r
union all
-- Entry 2+: each row in the submissions table, numbered per team by time.
select
  s.id                as submission_id,
  s.registration_id,
  r.code,
  r.team_name,
  r.competition,
  r.leader_email,
  false               as is_primary,
  (1 + row_number() over (
        partition by s.registration_id
        order by s.submitted_at, s.id))::int as entry_no,
  s.payment_proof_url,
  s.submission_url,
  s.status,
  s.submitted_at
from public.submissions s
join public.registrations r on r.id = s.registration_id;

-- Same lockdown as admin_registrations_detail: server-only (secret key) reads.
revoke all on public.admin_submissions_detail from anon, authenticated;
```

The app degrades gracefully if you skip this: the Teams view keeps working (it reads `admin_registrations_detail`), the team detail page falls back to showing just the inline Entry 1, and the CSV export falls back to one submission column set. The **Submissions** mode is the only thing that hard-requires (b) — it shows an inline "run the Step 16 SQL" notice until you do.

The CSV export is unchanged in shape philosophy — still one row per team — but now flattens **every** submission into `Entry1_*`, `Entry2_*`, … columns (like it already does for `Member1_*`, `Member2_*`), instead of only Entry 1.

---

## Step 17 — Connection pooling (Supavisor / PgBouncer) — **config, no SQL**

Serverless (Vercel) spins up many short-lived instances, each opening its own Postgres connection; against the direct endpoint (port **5432**) this exhausts `max_connections` under load. Point runtime traffic at Supabase's **pooler** instead:

- **Supabase Dashboard → Project Settings → Database → Connection string / Pooling.** Use the pooler host on port **6543** (transaction mode) for the app.
- The Supabase JS client this app uses (`@supabase/supabase-js` over the REST/`NEXT_PUBLIC_SUPABASE_URL` endpoint) already goes through Supabase's connection management — you only need to switch to the pooled connection string if/when you add a **direct Postgres** connection (an ORM, a migration tool, an external worker). Use `:6543` for those; keep `:5432` only for one-off migrations that need a session (e.g. `prisma migrate`).

                              
---

## Step 18 — (Optional) Audit log for admin mutations

The admin is a **single shared login** with no per-user identity in the DB (see the env note below), and admin writes run as `service_role` where `auth.uid()` is `NULL` — so a per-admin audit trail isn't possible without redesigning admin auth. What you *can* capture cheaply is **what changed and when** on the review-status columns, append-only, via triggers. Skip this unless you need it for compliance.

```sql
create table if not exists public.audit_logs (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  record_id   uuid not null,
  action      text not null,          -- 'status_change'
  old_status  registration_status,
  new_status  registration_status,
  changed_at  timestamptz not null default now()
);
alter table public.audit_logs enable row level security;  -- deny all clients; server bypasses
revoke all on public.audit_logs from anon, authenticated;

create or replace function public.log_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_logs (table_name, record_id, action, old_status, new_status)
    values (tg_table_name, new.id, 'status_change', old.status, new.status);
  end if;
  return new;
end$$;

drop trigger if exists trg_audit_registrations on public.registrations;
create trigger trg_audit_registrations
  after update on public.registrations
  for each row execute function public.log_status_change();

-- only if you ran Step 15 (submissions table)
drop trigger if exists trg_audit_submissions on public.submissions;
create trigger trg_audit_submissions
  after update on public.submissions
  for each row execute function public.log_status_change();
```

To read the log: query `public.audit_logs` from the SQL editor or the admin server (secret key).

---

## Step 19 — Letter of originality — **required for the current registration form**

Adds the team's signed letter-of-originality link. It is **one document per team**, signed by the leader, so it is a column on `registrations` (next to the payment/submission links) — not a per-person field on `team_members`.

> **Run this whole block, top to bottom, in one go.** Unlike the earlier steps this one is *not* a pure `create or replace`: it drops and recreates two objects, and skipping either half leaves the app broken in a way that is not obvious. The reasons are inline below.

**(a) The column.** Deliberately **nullable** — teams that registered before this field existed have no letter, and a `not null` column would fail to add at all while those rows are present. New submissions are required to supply it by `validateLeader()` in `lib/registrations/validate.ts`, client-side and again server-side.

```sql
alter table public.registrations
  add column if not exists originality_letter_url text;
```

**(b) Replace the submission function.** Adding a parameter creates a *new* overload rather than replacing the old one — leaving both, PostgREST cannot pick between them and every submission fails with `Could not choose the best candidate function`. The old signature has to go first, explicitly.

```sql
-- drop the OLD 14-arg signature (9 text params) — not optional, see above
drop function if exists public.submit_registration(
  uuid, competition_type, text, int, text, text, text, text, text, text, text, text, text, jsonb
);

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
  p_originality_letter_url  text,
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
    originality_letter_url, payment_proof_url, submission_url
  ) values (
    p_user_id, p_competition, p_team_name, p_team_size,
    p_leader_name, p_leader_email, p_leader_phone, p_leader_student_id,
    p_leader_institution, nullif(p_leader_major, ''), p_leader_confirmation_url,
    nullif(p_originality_letter_url, ''), p_payment_proof_url, p_submission_url
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

-- re-apply the Step 11 lockdown to the NEW signature (grants do not carry over)
revoke all on function public.submit_registration(
  uuid, competition_type, text, int, text, text, text, text, text, text, text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.submit_registration(
  uuid, competition_type, text, int, text, text, text, text, text, text, text, text, text, text, jsonb
) to service_role;
```

**(c) Rebuild the admin view.** `admin_registrations_detail` was defined as `select r.*`, and Postgres expands that to a fixed column list **at creation time** — a new table column does not appear in the view on its own. It also cannot be patched with `create or replace view`: the new column lands *before* the trailing `members` column, and replace refuses any reordering (`cannot change name of view column`). So it must be dropped and rebuilt. Without this the admin panel and CSV export silently show an empty letter for every team.

```sql
drop view if exists public.admin_registrations_detail;

create view public.admin_registrations_detail
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

-- the revoke does not survive the drop — re-apply it
revoke all on public.admin_registrations_detail from anon, authenticated;
```

`admin_submissions_detail` (Step 16) selects its registration columns explicitly, so it is unaffected and needs no change.

**Verify:**

```sql
-- column present?
select column_name, is_nullable from information_schema.columns
where table_name = 'registrations' and column_name = 'originality_letter_url';

-- exactly ONE submit_registration, taking 15 args?
select proname, pronargs from pg_proc where proname = 'submit_registration';

-- view exposes the new column?
select column_name from information_schema.columns
where table_name = 'admin_registrations_detail' and column_name = 'originality_letter_url';
```

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

## Step 20 — Admin brute-force lockout — **required for the punishing login lock**

An escalating, per-IP hard lockout for the admin login, on top of the plain rate limit (Step 12). Backed by the DB so it's correct across serverless instances. Consumed by `lib/admin/lockout.ts` via three RPCs. **Safe to deploy the code before running this** — until the functions exist the app treats the feature as "not installed" and admin login still works with no lock (see `UNDEFINED_FUNCTION` in `lib/admin/lockout.ts`). Run this block once in the Supabase SQL editor to switch the lock on. Idempotent.

**Escalation (per IP):** fails 1–4 are free (fat-finger grace), then `5 → 5 min`, `6 → 15 min`, `7 → 1 hour`, `8 → 6 hours`, `9+ → 24 hours`. A lock **holds even if the correct password is entered while it's active** (the gate is checked before the credential compare), and only a *successful* login clears the streak. Keyed per-IP on purpose: a global hard-lock would let an attacker brick the real admin out just by failing repeatedly — distributed floods are handled by the global window in Step 12 instead.

```sql
create table if not exists public.admin_lockouts (
  key          text primary key,
  fails        int not null default 0,
  locked_until timestamptz,
  updated_at   timestamptz not null default now()
);
alter table public.admin_lockouts enable row level security;  -- deny all clients; server bypasses

-- Seconds still locked for this key (0 if free). Read-only — never increments.
create or replace function public.admin_lockout_status(p_key text)
returns int
language sql security definer set search_path = public
as $$
  select coalesce((
    select greatest(0, ceil(extract(epoch from (locked_until - now())))::int)
    from public.admin_lockouts
    where key = p_key and locked_until is not null and locked_until > now()
  ), 0);
$$;

-- Record one failed attempt and (past the grace window) escalate the lock.
-- Returns the seconds this key is now locked (0 while still in grace).
create or replace function public.admin_lockout_fail(p_key text)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_fails int;
  v_secs  int;
begin
  insert into public.admin_lockouts(key, fails, updated_at)
    values (p_key, 1, now())
  on conflict (key) do update
    set fails = public.admin_lockouts.fails + 1, updated_at = now()
  returning fails into v_fails;

  v_secs := case
    when v_fails <= 4 then 0
    when v_fails = 5  then 300     -- 5 min
    when v_fails = 6  then 900     -- 15 min
    when v_fails = 7  then 3600    -- 1 hour
    when v_fails = 8  then 21600   -- 6 hours
    else 86400                     -- 24 hours, and stays there
  end;

  if v_secs > 0 then
    update public.admin_lockouts
      set locked_until = now() + make_interval(secs => v_secs)
      where key = p_key;
  end if;

  return v_secs;
end$$;

-- Wipe a key's streak on a good login.
create or replace function public.admin_lockout_clear(p_key text)
returns void
language sql security definer set search_path = public
as $$
  delete from public.admin_lockouts where key = p_key;
$$;

revoke all on function public.admin_lockout_status(text) from public, anon, authenticated;
revoke all on function public.admin_lockout_fail(text)   from public, anon, authenticated;
revoke all on function public.admin_lockout_clear(text)  from public, anon, authenticated;
grant execute on function public.admin_lockout_status(text) to service_role;
grant execute on function public.admin_lockout_fail(text)   to service_role;
grant execute on function public.admin_lockout_clear(text)  to service_role;
```

**If you lock yourself out** (e.g. while testing the new Vercel credentials), clear it directly in the SQL editor — no need to wait out the timer:

```sql
delete from public.admin_lockouts;                       -- clears every device
-- or just yours, if you know the key: delete from public.admin_lockouts where key = 'admin_login:<your-ip>';
```

---

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
