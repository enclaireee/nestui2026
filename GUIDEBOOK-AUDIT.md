# Guidebook → repo audit (2026 guidebooks)

Extracted from the three official guidebooks linked in `lib/registrations/config.ts`
(`guidebookUrl`). Healthineer and Healthynovation are image-only PDFs, so those
figures were read from rendered pages, not a text layer.

**Nothing in the repo has been changed yet.** This is the proposal.

Source pages: MedHack p5 (Timeline) / p17 (Registrasi) / p19 (Hadiah) ·
Healthineer p5 (Hadiah) / p6 (Syarat) / p7 (Timeline) ·
Healthynovation p5 (Hadiah) / p6 (Timeline) / p14 (Mekanisme Registrasi)

---

## 1. Registration fees — `lib/registrations/config.ts`

| Competition | Repo now | Guidebook | Action |
|---|---|---|---|
| **MedHack** | Early Bird 200k → 27 Jul · Normal 220k → 22 Aug | Early Bird **200k, 20 Jul – 2 Aug** · Normal **220k, 3 – 25 Aug** | amounts ✅, **dates wrong** |
| **Healthineer** | Early Bird 175k → 19 Jul · Normal 200k → 31 Jul · Extend 210k → 7 Aug | **not stated in the guidebook** | ⚠️ needs your input |
| **Healthynovation** | Early Bird 80k → 19 Jul · Normal 100k → 31 Jul · Late 120k → 7 Aug | Early Bird **80k** · Normal **100k** (no third tier) | Early Bird ✅, **drop "Late"**, dates wrong |

Windows implied by each guidebook's timeline: Early Bird `20 Jul – 2 Aug 2026`,
Normal `3 – 14 Aug 2026` (MedHack's Normal instead runs to **25 Aug**).

> **Why this matters now:** `currentFee()` returns `null` once the last tier
> lapses, and a competition with no active tier is rendered as *closed* and is
> unselectable in the wizard. With today's data Healthineer and Healthynovation
> both shut on **8 Aug**, while their guidebooks keep registration open to
> **14 Aug**.

---

## 2. Timelines — `DETAILS` in `app/branding/mainpage/section/competition-modal.tsx`

### MedHack

| # | Guidebook | Repo now |
|---|---|---|
| 1 | 20 Jul – 25 Aug 2026 · Proposal Submission | 13 – 27 Jul · Early Bird Registration + Video & Proposal |
| 2 | 26 Aug – 4 Sep 2026 · Video Submission | 28 Jul – 22 Aug · Normal Registration + Video & Proposal |
| 3 | 21 Sep 2026 · Finalist Announcement | 17 Sep · Finalist Announcement |
| 4 | 22 Sep 2026 · Technical Meeting & Mentoring | 18 Sep · Technical Meeting |
| 5 | 23 – 29 Sep 2026 · Final Submission | 19 – 26 Sep · Final Submission |
| 6 | 3 Oct 2026 · Main Event | 3 Oct · Main Event ✅ |

### Healthineer and Healthynovation (identical timelines)

| # | Guidebook | Repo now (Healthineer) |
|---|---|---|
| 1 | 20 Jul – 2 Aug 2026 · Early Bird Registration + Abstract Submission | 13 – 19 Jul · Early Registration + Abstract |
| 2 | 3 – 14 Aug 2026 · Normal Registration + Abstract Submission | 20 – 31 Jul · Normal Registration + Abstract |
| 3 | 29 Aug 2026 · Semifinal Announcement | 1 – 7 Aug · Late Registration + Abstract |
| 4 | 30 Aug 2026 · Technical Meeting I & Mentoring I | 23 Aug · Announcement |
| 5 | 31 Aug – 13 Sep 2026 · Full Paper Submission | 24 Aug · Techmeet + Semifinal Mentoring |
| 6 | 21 Sep 2026 · Final Announcement | 25 Aug – 8 Sep · Semifinal |
| 7 | 22 Sep 2026 · Technical Meeting II & Mentoring II | 17 Sep · Announcement |
| 8 | 23 – 29 Sep 2026 · Final Submission | 18 Sep · Techmeet + Final Mentoring |
| 9 | 3 Oct 2026 · Main Event | 19 – 26 Sep · Final Presentation Submission |
| | | 3 Oct · Main Event ✅ |

Repo Healthynovation additionally lists a *Poster Submission 27 – 30 Sep* that
the guidebook does not have.

**Only "Main Event · 3 Oct 2026" survives unchanged across all three.**

---

## 3. Prizes — `DETAILS[*].prizes`

| Competition | Guidebook | Repo now |
|---|---|---|
| MedHack | 4.500.000 / 3.000.000 / 2.000.000 | same ✅ |
| Healthineer | 4.500.000 / 3.000.000 / 2.000.000 | same ✅ |
| Healthynovation | 3.000.000 / 2.000.000 / 1.000.000 | same ✅ |

Amounts all correct. Two wording/coverage gaps:

- Healthineer says **"+ Sertifikat Penghargaan"**; the repo says *e-Certificate*.
- **Special Awards are missing entirely from the site:**
  - MedHack — Best Pitching, Best Digital Product
  - Healthineer — Best Video, Best Booth
  - Healthynovation — Best Presentation, Best Poster

---

## 4. Team size — `COMPETITIONS[*].minSize/maxSize`

| Competition | Guidebook | Repo | |
|---|---|---|---|
| MedHack | 3–5 | 3–5 | ✅ |
| Healthineer | 3–5 | 3–5 | ✅ |
| Healthynovation | 1–3 | 1–3 | ✅ |

---

## 5. Rules present in the guidebooks, absent from the site

- **MedHack / Healthineer:** a team may submit **max 2 entries**, and the fee is
  charged **per entry** ("biaya pendaftaran berlaku kelipatan"). The wizard
  enforces one team per account per competition, so this path doesn't exist.
- **Healthynovation:** max **3 entries per school**, each with a different
  subtheme; one school may enter more than one team.
- **Healthineer:** team members may come from **different universities**.
- Registration is via `nestui.id` with proof-of-payment upload — matches the
  current flow.

---

## Open question before applying

**Healthineer's fee is not printed in its guidebook.** The other two publish
theirs on the registration page; Healthineer's covers documents only. So one of:

1. keep the current 175k / 200k / 210k and only correct the *dates*;
2. mirror MedHack's shape (200k / 220k);
3. use a figure you have from elsewhere.

Everything else above is unambiguous and ready to apply on your word.
