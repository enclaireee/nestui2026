# TESTING.md — Registration + Admin verification checklist

Prereqs: run all of `BACKEND.md` in Supabase, add the env vars (incl. `SUPABASE_SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`), restart `npm run dev`.

No test framework is added (per scope — manual checklist + runnable probes below). The critical logic (`lib/registrations/validate.ts`, the `submit_registration` SQL function) is exercised by cases 1–3 and 6.

## A. Registration flow (happy path, per competition)
- [ ] **Medhack / Healthineer**: log in → `/branding/registration` → pick competition → team size **3–5** → fill leader → fill `size−1` members → enter payment + submission links → Submit → see the `NEST2026-…` code on the Thank You screen. Confirm a row in `registrations` + `size−1` rows in `team_members`.
- [ ] **Healthynovation**: `/branding/registration/sma` → size **1** → the **member step is skipped** → submit → 1 registration, 0 members. Also try size 3 → 2 members.
- [ ] **Major field**: shows for Medhack/Healthineer, hidden for Healthynovation. Student-ID label = NIM (undergrad) / NISN (SMA).

## B. Client validation (before "Next")
- [ ] Empty required field → red ring + inline message, "Next" blocked.
- [ ] Invalid email / phone / non-http link → rejected.
- [ ] Same email for leader and a member → "Each participant must use a different email."
- [ ] Back preserves everything already typed.

## C. Server-side enforcement (client bypassed) — the important ones
These prove the server never trusts the client.

1. **Mismatched member count** — in devtools console on the registration page (logged in), call the action with a bad payload:
   ```js
   // paste in browser console on /branding/registration
   // (imports the same server action the form uses)
   ```
   Easiest instead: temporarily send `team_size` 5 with only 1 member via the RPC using the secret key in Supabase SQL editor:
   ```sql
   select public.submit_registration(
     '00000000-0000-0000-0000-000000000000', 'medhack', 'X', 5,
     'L','l@x.com','12345','NIM1','Uni','CS','https://x','https://p','https://s',
     '[{"name":"m","email":"m@x.com","phone":"12345","student_id":"n","institution":"u","major":"c","confirmation_url":"https://x"}]'::jsonb
   );
   -- expect: ERROR member_count_mismatch: expected 4, got 1
   ```
- [ ] Above raises `member_count_mismatch` (no partial row inserted — verify `registrations` unchanged).

2. **Direct submit without going through the client** — the action requires a logged-in Supabase session cookie; hitting it unauthenticated returns the "must be logged in" error, and there is **no** public insert path (RLS deny-all):
   ```sql
   -- as the anon/publishable role this must fail (no insert grant, RLS on):
   insert into public.registrations (user_id, competition, team_name, team_size,
     leader_name, leader_email, leader_phone, leader_student_id, leader_institution,
     leader_confirmation_url, payment_proof_url, submission_url)
   values ('00000000-0000-0000-0000-000000000000','medhack','x',3,'l','l@x.com','12345',
     'n','u','https://x','https://p','https://s');
   -- run this in the SQL editor "as" anon via the REST API / or confirm the grant:
   ```
- [ ] `anon`/`authenticated` cannot INSERT (Step 11 revoke + RLS). Only the secret-key server path works.

3. **Duplicate team per user** — submit the same competition twice as the same user → second attempt returns "You have already registered a team for this competition." (`UNIQUE(user_id, competition)`).

## D. Admin auth
- [ ] `/admin` without logging in → redirected to `/admin/login` (proxy) — verified: returns `Location: /admin/login`.
- [ ] Wrong credentials → "Invalid username or password."
- [ ] **Rate limit**: submit wrong credentials >10 times within 10 min from one IP → "Too many attempts." (`check_rate_limit`, key `admin_login:<ip>`).
- [ ] Correct credentials → signed `admin_session` cookie set (httpOnly, Secure in prod, SameSite=Lax) → dashboard loads.
- [ ] Tampering: edit the cookie value → next request → back to `/admin/login` (HMAC verify fails).
- [ ] Logout clears the cookie.

## E. Admin panel
- [ ] Dashboard lists teams; competition tabs filter; search by team/code/leader email; pagination (20/page) works.
- [ ] Detail page shows leader + all members + links; status dropdown updates and persists.
- [ ] **CSV export blocked without session**: `curl -i http://localhost:3000/admin/export` → 307→login (proxy) / 401 (handler). Verified: returns 307 to login.
- [ ] Logged in → "Export CSV" downloads a flattened, one-row-per-team file with correct `Content-Disposition`. Per-competition export respects the active tab.

## F. Injection / XSS
6. **SQL-injection-style input stored literally** — register a team with team name `' OR '1'='1` and a member name `<script>alert(1)</script>`.
- [ ] Row saves with the literal text (no query breakage — PostgREST/RPC parameterize).
- [ ] Admin dashboard/detail renders it as inert text (React escapes; free-text was HTML-stripped on write so the `<script>` is stored as `alert(1)` / neutralized).
- [ ] CSV export: a field beginning with `=`/`+`/`-`/`@` is prefixed with `'` (open the CSV in Excel — no formula executes).
- [ ] Admin search box: typing `),(` or `"` does not error or alter results (`sanitizeSearch` strips PostgREST metacharacters).

## Automated smoke already run
- `npx tsc --noEmit` — passes.
- `npx eslint` on all new files — passes.
- Dev-server route guards: `/admin`→login, `/admin/export`→blocked, `/branding/registration`→login. ✓
