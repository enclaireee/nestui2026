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

## Step 21 — Paper round (full paper + video) — **required for the paper submission feature**

The round that follows selection: Healthineer submits a **paper + video** link, Healthynovation a **paper** link. Medhack has no paper round (it runs a video submission instead) and is excluded in the app by `paperSubmission: null` in `lib/registrations/config.ts`.

Deliberately a **separate table** rather than a `stage` column on `submissions`. That table means "an extra *paid* entry" — its `payment_proof_url` is `not null` and `admin_submissions_detail` numbers its rows as Entry 2, 3, … A paper is free, there is at most **one per team**, and it can be replaced until the deadline, so it does not fit that shape.

**Safe to deploy the code before running this** — until the table exists the dashboard and admin panel treat the paper round as "not set up yet" and everything else keeps working, the same way `submissions` degrades before Step 15.

```sql
create table if not exists public.paper_submissions (
  id              uuid primary key default gen_random_uuid(),
  -- one paper per team; re-submitting replaces it (see the RPC's upsert)
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  paper_url       text not null,
  video_url       text,                      -- Healthineer only; null for Healthynovation
  status          registration_status not null default 'pending',
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.paper_submissions enable row level security;

-- a team can read its own paper (dashboard)
drop policy if exists paper_select_own on public.paper_submissions;
create policy paper_select_own on public.paper_submissions
  for select to authenticated
  using (exists (
    select 1 from public.registrations r
    where r.id = paper_submissions.registration_id and r.user_id = auth.uid()
  ));

-- clients get SELECT only (RLS-filtered); writes go through the RPC
revoke all on public.paper_submissions from anon, authenticated;
grant  select on public.paper_submissions to authenticated;
```

`upsert_paper_submission` validates ownership, then inserts **or replaces** the team's paper. A replacement resets `status` to `pending`: a paper already verified must not stay verified after its contents change.

```sql
create or replace function public.upsert_paper_submission(
  p_user_id         uuid,
  p_registration_id uuid,
  p_paper_url       text,
  p_video_url       text
) returns uuid
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

  insert into public.paper_submissions (registration_id, paper_url, video_url)
  values (p_registration_id, p_paper_url, p_video_url)
  on conflict (registration_id) do update
    set paper_url  = excluded.paper_url,
        video_url  = excluded.video_url,
        status     = 'pending',
        updated_at = now()
  returning id into v_id;

  return v_id;
end$$;

revoke all on function public.upsert_paper_submission(uuid, uuid, text, text) from public, anon, authenticated;
grant  execute on function public.upsert_paper_submission(uuid, uuid, text, text) to service_role;
```

Per-paper status setter for the admin panel — same shape as `set_submission_status` (Step 16a).

```sql
create or replace function public.set_paper_status(
  p_id uuid, p_status registration_status
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.paper_submissions set status = p_status where id = p_id;
end$$;

revoke all on function public.set_paper_status(uuid, registration_status) from public, anon, authenticated;
grant  execute on function public.set_paper_status(uuid, registration_status) to service_role;
```

**Flattened "all papers" view** — one row per paper across every team, carrying the owning team's identifying columns so the admin Semifinal list can filter, search and paginate on its own (the same reason `admin_submissions_detail` carries them). Server-only reads, same lockdown as the other admin views.

```sql
create or replace view public.admin_papers_detail
with (security_invoker = true) as
select
  p.id            as paper_id,
  p.registration_id,
  r.code,
  r.team_name,
  r.competition,
  r.leader_email,
  p.paper_url,
  p.video_url,
  p.status,
  p.submitted_at,
  p.updated_at
from public.paper_submissions p
join public.registrations r on r.id = p.registration_id;

revoke all on public.admin_papers_detail from anon, authenticated;
```

The app degrades gracefully if the table and view are absent: the dashboard and team detail show "no paper yet", the Teams list shows every team as `none` under the Semifinal round, and the Semifinal submissions list shows an inline "run the Step 21 SQL" notice.

---

## Step 22 — Test paper submissions — **development only, safe to delete**

Three independent scripts. Run **22a** and/or **22b** to seed a fake semifinalist, and **22c** to remove them. Each seed script is self-contained — you can run one without the other.

| Script | Team | Competition | Paper round |
|---|---|---|---|
| **22a** | `ZZ TEST — Healthineer` | healthineer | paper **+ video** |
| **22b** | `ZZ TEST — Healthynovation` | healthynovation | paper only |
| **22c** | — | — | deletes both |

Healthineer is the only competition that collects a video, so running both covers both shapes of the form.

> **These write into the same tables as real entrants.** The fake teams appear in the admin Teams list, the Semifinal list, team counts, and the CSV export. They are named `ZZ TEST — …` so they sort last, and their codes are `NEST2026-TEST-*` rather than real ones — the Step 7 trigger skips generation when `code` is supplied, so **they do not consume a real code number**. Run 22c when you're done.

Both seed scripts need the test account to exist in `auth.users` — sign up with that email first, or the block raises rather than inserting half a fixture. Both are idempotent: re-running updates the same team instead of creating another.

### 22a — Healthineer test team (paper + video)

Team of 3, so it also exercises the members list on the admin team detail page.

```sql
do $$
declare
  v_email text := 'muhfatihzamzami@gmail.com';   -- the test account
  v_user  uuid;
  v_reg   uuid;
begin
  select id into v_user from auth.users where lower(email) = lower(v_email);
  if v_user is null then
    raise exception 'No auth user for %. Sign up with that email first.', v_email;
  end if;

  insert into public.registrations (
    code, user_id, competition, team_name, team_size,
    leader_name, leader_email, leader_phone, leader_student_id,
    leader_institution, leader_major, leader_confirmation_url,
    payment_proof_url, submission_url, status
  ) values (
    'NEST2026-TEST-HTN', v_user, 'healthineer', 'ZZ TEST — Healthineer', 3,
    'Test Leader', v_email, '081200000000', '0000000000',
    'Test University', 'Test Major', 'https://example.com/confirmation',
    'https://example.com/payment', 'https://example.com/abstract', 'verified'
  )
  on conflict (user_id, competition) do update
    set team_name = excluded.team_name
  returning id into v_reg;

  -- team_size 3 means two non-leader members; without them the team detail
  -- page shows a team of three with nobody in it.
  insert into public.team_members (
    registration_id, member_index, name, email, phone,
    student_id, institution, major, confirmation_url
  )
  select v_reg, i, 'Test Member ' || i, 'test.member' || i || '@example.com',
         '081200000000', '000000000' || i, 'Test University', 'Test Major',
         'https://example.com/confirmation'
  from generate_series(1, 2) as i
  on conflict (registration_id, member_index) do nothing;

  insert into public.paper_submissions (registration_id, paper_url, video_url)
  values (v_reg, 'https://example.com/test-full-paper', 'https://example.com/test-video')
  on conflict (registration_id) do update
    set paper_url  = excluded.paper_url,
        video_url  = excluded.video_url,
        updated_at = now();

  raise notice 'Seeded Healthineer test team % for %', v_reg, v_email;
end$$;
```

### 22b — Healthynovation test team (paper only)

Team of 1, the smallest a Healthynovation team may be, so no member rows are needed. `video_url` stays null — the form does not collect one for this competition.

```sql
do $$
declare
  v_email text := 'muhfatihzamzami@gmail.com';   -- the test account
  v_user  uuid;
  v_reg   uuid;
begin
  select id into v_user from auth.users where lower(email) = lower(v_email);
  if v_user is null then
    raise exception 'No auth user for %. Sign up with that email first.', v_email;
  end if;

  insert into public.registrations (
    code, user_id, competition, team_name, team_size,
    leader_name, leader_email, leader_phone, leader_student_id,
    leader_institution, leader_major, leader_confirmation_url,
    payment_proof_url, submission_url, status
  ) values (
    'NEST2026-TEST-HNV', v_user, 'healthynovation', 'ZZ TEST — Healthynovation', 1,
    'Test Leader', v_email, '081200000000', 'N/A',
    'Test School', null, 'https://example.com/confirmation',
    'https://example.com/payment', 'https://example.com/abstract', 'verified'
  )
  on conflict (user_id, competition) do update
    set team_name = excluded.team_name
  returning id into v_reg;

  insert into public.paper_submissions (registration_id, paper_url, video_url)
  values (v_reg, 'https://example.com/test-full-paper', null)
  on conflict (registration_id) do update
    set paper_url  = excluded.paper_url,
        video_url  = excluded.video_url,
        updated_at = now();

  raise notice 'Seeded Healthynovation test team % for %', v_reg, v_email;
end$$;
```

### 22c — Delete the test data

The `NEST2026-TEST-` prefix can never match a real entrant, whose codes are `NEST2026-HTN-…` / `NEST2026-HNV-…` / `NEST2026-MDH-…`.

**Remove the test teams entirely** — `on delete cascade` takes their members and papers with them:

```sql
delete from public.registrations where code like 'NEST2026-TEST-%';
```

**Or clear just the test papers**, keeping the fake teams so you can submit again through the dashboard form:

```sql
delete from public.paper_submissions
where registration_id in (
  select id from public.registrations where code like 'NEST2026-TEST-%'
);
```

Either can be narrowed to one competition by using the full code — `'NEST2026-TEST-HTN'` or `'NEST2026-TEST-HNV'` — in place of the `like` pattern.


---

## Step 23 — Medhack cancelled: move its teams to Healthineer — **one-off, run once**

Medhack was cancelled after registration closed. Its teams are moved to Healthineer rather than dropped, so their submissions, members and payment records stay intact — `team_members`, `submissions` and `paper_submissions` all key off `registration_id`, not the competition, so they follow the team with no further work.

Both competitions allow a team size of 3–5, so no row can violate `team_size_range` on the way across. What *can* fail are the two uniqueness rules from Step 4: a team whose leader already has a Healthineer entry (`uq_reg_user_competition`), or whose leader email is already used by a Healthineer team (`uq_reg_comp_leader_email`). Run 23a first; it names any such row before the update touches anything.

**Two things change in the app the moment 23b commits:**
- Healthineer has a paper round (`paperSubmission` in `lib/registrations/config.ts`) and Medhack did not. Every moved team that is `verified` immediately sees the Semifinal card and, while `paperPhase()` is `open`, the paper + video form. Check the window's `closes` date before running this.
- "Submit again" stays closed for them either way — `currentFee('healthineer')` lapsed on 2026-08-14.

The `medhack` enum value is deliberately left in `competition_type`. Dropping a value from a Postgres enum means rebuilding the type, and nothing is gained: with no rows referencing it, it is inert.

### 23a — Check for conflicts first

Returns one row per Medhack team. Every `user_clash` and `email_clash` must read `false`. If one reads `true`, that team has to be resolved by hand (merge or rename the leader email) before 23b — otherwise the whole update aborts and nothing moves.

```sql
select
  r.code,
  r.team_name,
  r.leader_email,
  exists (
    select 1 from public.registrations h
     where h.competition = 'healthineer' and h.user_id = r.user_id
  ) as user_clash,
  exists (
    select 1 from public.registrations h
     where h.competition = 'healthineer' and lower(h.leader_email) = lower(r.leader_email)
  ) as email_clash
from public.registrations r
where r.competition = 'medhack'
order by r.code;
```

### 23b — The move

One statement, one transaction: either every Medhack team moves or none does. Registration for Medhack closed on 2026-08-25, so no new row can appear behind this.

```sql
update public.registrations
   set competition = 'healthineer'
 where competition = 'medhack';
```

### Verify

```sql
-- should be 0
select count(*) from public.registrations where competition = 'medhack';

-- the moved teams, now under Healthineer (codes still read MDH — see 23c)
select code, team_name, team_size, status, leader_email
from public.registrations
where competition = 'healthineer' and code like 'NEST2026-MDH-%'
order by code;
```

### 23c — (Optional) Renumber the codes into the HTN sequence

Skip this unless the `MDH` prefix is actually a problem. The teams have been told their code, it appears on their dashboard, and nothing in the app parses the prefix — renumbering means telling four teams their code changed. It is listed only because the Step 7 trigger fires `before insert` and so does **not** regenerate a code on update.

Each moved team takes the next number from `reg_seq_healthineer`, in registration order, so the new codes slot in after the existing Healthineer ones instead of colliding with them.

```sql
update public.registrations r
   set code = 'NEST2026-HTN-' || lpad(nextval('reg_seq_healthineer')::text, 4, '0')
  from (
    select id from public.registrations
     where competition = 'healthineer' and code like 'NEST2026-MDH-%'
     order by submitted_at
  ) as ordered
 where r.id = ordered.id;
```

### Rollback

Only valid while the moved teams still carry their `NEST2026-MDH-` codes — i.e. if 23c has **not** been run. After 23c there is nothing left in the row that says where it came from.

```sql
update public.registrations
   set competition = 'medhack'
 where competition = 'healthineer' and code like 'NEST2026-MDH-%';
```

---

## Step 24 — Finalist presentation (PPT) submission — H-3

For the Grand Final, **11 finalist teams** (5 in Healthynovation, 6 in Healthineer) submit their presentation deck (Google Drive / Slides link).

The finalist teams are:
- **Healthynovation (5)**:
  - `NEST2026-HNV-0010`: BioNexaS
  - `NEST2026-HNV-0007`: NexThera
  - `NEST2026-HNV-0022`: AERIS
  - `NEST2026-HNV-0030`: GLUCOSENSE
  - `NEST2026-HNV-0034`: H-3
- **Healthineer (6)**:
  - `NEST2026-HTN-0015`: Mama aku mw ke jkt
  - `NEST2026-HTN-0003`: Garden House
  - `NEST2026-HTN-0007`: Pilar Kehidupan
  - `NEST2026-HTN-0005`: Say Wallahi
  - `NEST2026-HTN-0006`: Posture Rangers
  - `NEST2026-HTN-0013`: Adalah Pokoknya

> **Run this block once in the Supabase SQL editor.** It creates the `presentation_submissions` table, adds `is_finalist` to `registrations`, updates `admin_registrations_detail`, creates the RPCs and view for admin review, and sets the finalist status flags.

### 24a — Table and RLS

```sql
-- 1. Add is_finalist flag to registrations table
alter table public.registrations
  add column if not exists is_finalist boolean not null default false;

-- 2. Create presentation_submissions table
create table if not exists public.presentation_submissions (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  ppt_url         text not null,
  status          registration_status not null default 'pending',
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint chk_ppt_url_not_empty check (trim(ppt_url) <> '')
);

alter table public.presentation_submissions enable row level security;

-- A team can read its own presentation (dashboard)
drop policy if exists presentation_select_own on public.presentation_submissions;
create policy presentation_select_own on public.presentation_submissions
  for select to authenticated
  using (exists (
    select 1 from public.registrations r
    where r.id = presentation_submissions.registration_id and r.user_id = auth.uid()
  ));

-- Authenticated users get SELECT only; submissions and updates go through the RPC
revoke all on public.presentation_submissions from anon, authenticated;
grant  select on public.presentation_submissions to authenticated;
```

### 24b — Upsert RPC and Admin Status Setter

```sql
-- Client RPC: submit or replace presentation deck
create or replace function public.upsert_presentation_submission(
  p_user_id         uuid,
  p_registration_id uuid,
  p_ppt_url         text
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_owner      uuid;
  v_code       text;
  v_is_final   boolean;
  v_id         uuid;
begin
  select user_id, code, is_finalist
    into v_owner, v_code, v_is_final
    from public.registrations
   where id = p_registration_id;

  if v_owner is null then
    raise exception 'registration_not_found';
  end if;
  if v_owner <> p_user_id then
    raise exception 'not_registration_owner';
  end if;

  -- Validate finalist eligibility (either DB flag or known finalist code)
  if not (v_is_final or v_code in (
    'NEST2026-HNV-0010', 'NEST2026-HNV-0007', 'NEST2026-HNV-0022',
    'NEST2026-HNV-0030', 'NEST2026-HNV-0034', 'NEST2026-HTN-0015',
    'NEST2026-HTN-0003', 'NEST2026-HTN-0007', 'NEST2026-HTN-0005',
    'NEST2026-HTN-0006', 'NEST2026-HTN-0013'
  )) then
    raise exception 'team_not_qualified_for_finals';
  end if;

  insert into public.presentation_submissions (registration_id, ppt_url)
  values (p_registration_id, p_ppt_url)
  on conflict (registration_id) do update
    set ppt_url    = excluded.ppt_url,
        status     = 'pending',
        updated_at = now()
  returning id into v_id;

  return v_id;
end$$;

revoke all on function public.upsert_presentation_submission(uuid, uuid, text) from public, anon, authenticated;
grant  execute on function public.upsert_presentation_submission(uuid, uuid, text) to service_role;

-- Admin RPC: update presentation status
create or replace function public.set_presentation_status(
  p_id uuid, p_status registration_status
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.presentation_submissions set status = p_status where id = p_id;
end$$;

revoke all on function public.set_presentation_status(uuid, registration_status) from public, anon, authenticated;
grant  execute on function public.set_presentation_status(uuid, registration_status) to service_role;
```

### 24c — Views

```sql
-- 1. Rebuild admin_registrations_detail so is_finalist column is included
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

revoke all on public.admin_registrations_detail from anon, authenticated;

-- 2. Flattened "all presentations" view for admin Final (PPT) tab
create or replace view public.admin_presentations_detail
with (security_invoker = true) as
select
  pt.id           as presentation_id,
  pt.registration_id,
  r.code,
  r.team_name,
  r.competition,
  r.leader_email,
  pt.ppt_url,
  pt.status,
  pt.submitted_at,
  pt.updated_at
from public.presentation_submissions pt
join public.registrations r on r.id = pt.registration_id;

revoke all on public.admin_presentations_detail from anon, authenticated;
```

### 24d — Mark Finalists and Resolve Semifinal Papers

Run this query once to mark the 11 finalist teams in the database, set their semifinal papers to `verified` (since they advanced to the Grand Final), and set the non-advancing semifinalists' papers to `rejected`:

```sql
-- 1. Flag the 11 finalist teams
update public.registrations
   set is_finalist = true
 where code in (
   'NEST2026-HNV-0010', -- BioNexaS
   'NEST2026-HNV-0007', -- NexThera
   'NEST2026-HNV-0022', -- AERIS
   'NEST2026-HNV-0030', -- GLUCOSENSE
   'NEST2026-HNV-0034', -- H-3
   'NEST2026-HTN-0015', -- Mama aku mw ke jkt
   'NEST2026-HTN-0003', -- Garden House
   'NEST2026-HTN-0007', -- Pilar Kehidupan
   'NEST2026-HTN-0005', -- Say Wallahi
   'NEST2026-HTN-0006', -- Posture Rangers
   'NEST2026-HTN-0013'  -- Adalah Pokoknya
 );

-- 2. Mark the 11 finalists' semifinal papers as verified
update public.paper_submissions
   set status = 'verified'
 where registration_id in (
   select id from public.registrations where is_finalist = true
 );

-- 3. Mark the non-finalist teams' semifinal papers as rejected (did not advance)
update public.paper_submissions
   set status = 'rejected'
 where registration_id not in (
   select id from public.registrations where is_finalist = true
 )
 and status = 'pending';
```

### Verify

```sql
-- Check that the 11 finalists are marked
select code, team_name, competition, is_finalist
from public.registrations
where is_finalist = true
order by competition, code;

-- Check presentations view
select count(*) from public.admin_presentations_detail;
```
