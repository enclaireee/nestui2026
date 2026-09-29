// Single source of truth for the three competitions: names, team-size ranges,
// and the per-competition field variations (undergrad vs SMA). Used by the
// wizard, client + server validation, and the admin panel.

export type CompetitionId = "medhack" | "healthineer" | "healthynovation";
export type Category = "mahasiswa" | "sma";

export interface CompetitionConfig {
  id: CompetitionId;
  name: string;
  category: Category;
  categoryLabel: string;
  minSize: number;
  maxSize: number;
  hasMajor: boolean;
  /**
   * Label of the student-number field. Null for competitions that don't collect
   * one (highschool has no NIM equivalent) — the field is hidden and "N/A" is
   * submitted, since the DB column is NOT NULL.
   */
  studentIdLabel: string | null;
  /** ID document participants scan into their confirmation folder. */
  idCardLabel: string; // KTM (undergrad) / Kartu Identitas Siswa (SMA)
  institutionLabel: string; // University / Sekolah
  blurb: string;
  logo: string; // path in /public
  qr: string; // WhatsApp group QR, path in /public
  /**
   * Google Docs template for the letter of originality. Each competition has
   * its own wording, so the leader step links the one that matches — handing
   * out a single shared link would have teams sign the wrong document.
   */
  originalityTemplateUrl: string;
  /**
   * Public guidebook (Google Drive). Linked from the competition modal on the
   * landing page, beside Register — entrants read it before they enter, so it
   * sits next to the entry point rather than inside the wizard.
   */
  guidebookUrl: string;
  /** Competition's twibbon folder (Google Drive) — linked from the confirmation checklist. */
  twibbonUrl: string;
  /** Registration fee tiers, earliest first. See `currentFee`. */
  fees: FeeTier[];
  /**
   * The post-selection paper round, or null for competitions that don't have
   * one (Medhack runs a video submission instead). Separate from `fees`: this
   * round is free, so it must NOT be gated on a fee tier the way the initial
   * submission is.
   */
  paperSubmission: PaperSubmission | null;
}

export interface PaperSubmission {
  /** Inclusive first day, `YYYY-MM-DD` in WIB. */
  opens: string;
  /** Inclusive last day, `YYYY-MM-DD` in WIB. */
  closes: string;
  /** Healthineer collects a video link alongside the paper; Healthynovation doesn't. */
  video: boolean;
}

export interface FeeTier {
  label: string;
  /** Rupiah. */
  amount: number;
  /** Inclusive last day of this tier, `YYYY-MM-DD` in WIB. */
  until: string;
}

export const COMPETITIONS: Record<CompetitionId, CompetitionConfig> = {
  medhack: {
    id: "medhack",
    name: "Medhack",
    category: "mahasiswa",
    categoryLabel: "Undergraduate",
    minSize: 3,
    maxSize: 5,
    hasMajor: true,
    studentIdLabel: "Nomor Induk Mahasiswa (NIM)",
    idCardLabel: "Kartu Tanda Mahasiswa (KTM)",
    institutionLabel: "University",
    blurb:
      "A team hackathon that challenges participants to develop healthcare-technology-based business solutions.",
    logo: "/medhacklogo.webp",
    qr: "/qrmedhack.png",
    originalityTemplateUrl:
      "https://docs.google.com/document/d/12qEaJLfTeOMSdf9wCd50p3zsopmMw63A191xvI2QYpA/edit?usp=drivesdk",
    guidebookUrl:
      "https://drive.google.com/file/d/19ko907svALA_953JGGza_Q3RsIAi0qdV/view?usp=drive_link",
    twibbonUrl:
      "https://drive.google.com/drive/folders/1R0d83qPL9xLZpXi6i3gIqx3XcuQKEvAR?usp=drive_link",
    fees: [
      { label: "Early Bird", amount: 200_000, until: "2026-08-02" },
      { label: "Normal", amount: 220_000, until: "2026-08-25" },
    ],
    // Medhack's second round is a video submission, not a paper.
    paperSubmission: null,
  },
  healthineer: {
    id: "healthineer",
    name: "Healthineer",
    category: "mahasiswa",
    categoryLabel: "Undergraduate",
    minSize: 3,
    maxSize: 5,
    hasMajor: true,
    studentIdLabel: "Nomor Induk Mahasiswa (NIM)",
    idCardLabel: "Kartu Tanda Mahasiswa (KTM)",
    institutionLabel: "University",
    blurb:
      "A team competition to develop healthcare technology solutions in the form of a scientific paper and prototype.",
    logo: "/healthineerlogo.webp",
    qr: "/qrhealthyneer.png",
    originalityTemplateUrl:
      "https://docs.google.com/document/d/1706y-HFKhKQvfAVP0-W47DuODTvm5cFnTFtPiblDFBA/edit?usp=drivesdk",
    guidebookUrl:
      "https://drive.google.com/file/d/1rD-HNaMw-xL_GGEj8yzIfWDOXkQuyxYa/view",
    twibbonUrl:
      "https://drive.google.com/drive/folders/1ABVG-7Pz9Ce9yGEcHlP9rcuJub2mSEkp?usp=drive_link",
    fees: [
      { label: "Early Bird", amount: 175_000, until: "2026-08-02" },
      { label: "Late Registration", amount: 200_000, until: "2026-08-14" },
    ],
    paperSubmission: { opens: "2026-08-31", closes: "2026-09-13", video: true },
  },
  healthynovation: {
    id: "healthynovation",
    name: "Healthynovation",
    category: "sma",
    categoryLabel: "Highschool",
    minSize: 1,
    maxSize: 3,
    hasMajor: false,
    studentIdLabel: null,
    idCardLabel: "Kartu Identitas Siswa",
    institutionLabel: "School",
    blurb:
      "A scientific paper competition for highschool students that encourages innovative ideas in healthcare.",
    logo: "/healthynovationlogo.webp",
    qr: "/qrhealthynovation.png",
    originalityTemplateUrl:
      "https://docs.google.com/document/d/1Ei7ZYa37yngw3fgjnhtIgKXOFlvYnhKsxmruCTteX20/edit?usp=drivesdk",
    guidebookUrl:
      "https://drive.google.com/file/d/1zeHckzyYUSdZHNGRwgByTdgvjtk0GJP5/view?usp=drive_link",
    twibbonUrl:
      "https://drive.google.com/drive/folders/1T4IRIRlNDOmVTJWqzSB_6nkPoohQRXji?usp=drive_link",
    fees: [
      { label: "Early Bird", amount: 80_000, until: "2026-08-02" },
      { label: "Late Registration", amount: 100_000, until: "2026-08-14" },
    ],
    paperSubmission: { opens: "2026-08-31", closes: "2026-09-13", video: false },
  },
};

export const COMPETITION_IDS = Object.keys(COMPETITIONS) as CompetitionId[];

export function isCompetitionId(v: unknown): v is CompetitionId {
  return typeof v === "string" && v in COMPETITIONS;
}

export function competitionsForCategory(category?: Category): CompetitionConfig[] {
  const all = COMPETITION_IDS.map((id) => COMPETITIONS[id]);
  return category ? all.filter((c) => c.category === category) : all;
}

export function teamSizeOptions(id: CompetitionId): number[] {
  const c = COMPETITIONS[id];
  return Array.from({ length: c.maxSize - c.minSize + 1 }, (_, i) => c.minSize + i);
}

export function isValidTeamSize(id: CompetitionId, size: number): boolean {
  const c = COMPETITIONS[id];
  return Number.isInteger(size) && size >= c.minSize && size <= c.maxSize;
}

/**
 * The fee tier in effect right now — the first one whose `until` day hasn't
 * passed. Tiers end at 23:59:59 WIB on their `until` date, matching how the
 * timeline on the main page reads ("13 – 19 July" includes the 19th).
 *
 * Returns null once every tier has lapsed, and callers hide the amount rather
 * than guessing: showing a stale price would have people transfer the wrong sum.
 */
export function currentFee(id: CompetitionId, now: Date = new Date()): FeeTier | null {
  return (
    COMPETITIONS[id].fees.find((t) => now <= new Date(`${t.until}T23:59:59+07:00`)) ?? null
  );
}

/** Where `now` sits relative to a competition's paper round. */
export type PaperPhase = "none" | "before" | "open" | "closed";

/**
 * Gate for the paper round. Deliberately NOT `currentFee`: that tracks the
 * registration fee window, which has already lapsed by the time papers are due
 * — reusing it would reject every paper.
 *
 * Same WIB convention as the fee tiers: opens 00:00:00 on `opens`, shuts after
 * 23:59:59 on `closes`.
 */
export function paperPhase(id: CompetitionId, now: Date = new Date()): PaperPhase {
  const p = COMPETITIONS[id].paperSubmission;
  if (!p) return "none";
  if (now < new Date(`${p.opens}T00:00:00+07:00`)) return "before";
  if (now > new Date(`${p.closes}T23:59:59+07:00`)) return "closed";
  return "open";
}

/**
 * The 11 teams selected as finalists for NEST 2026:
 * Healthynovation (5): BioNexaS, NexThera, AERIS, GLUCOSENSE, H-3
 * Healthineer (6): Mama aku mw ke jkt, Garden House, Pilar Kehidupan, Say Wallahi, Posture Rangers, Adalah Pokoknya
 */
export const FINALIST_CODES: ReadonlySet<string> = new Set([
  "NEST2026-HNV-0010", // BioNexaS
  "NEST2026-HNV-0007", // NexThera
  "NEST2026-HNV-0022", // AERIS
  "NEST2026-HNV-0030", // GLUCOSENSE
  "NEST2026-HNV-0034", // H-3
  "NEST2026-HTN-0015", // Mama aku mw ke jkt
  "NEST2026-HTN-0003", // Garden House
  "NEST2026-HTN-0007", // Pilar Kehidupan
  "NEST2026-HTN-0005", // Say Wallahi
  "NEST2026-HTN-0006", // Posture Rangers
  "NEST2026-HTN-0013", // Adalah Pokoknya
]);

export function isFinalistTeam(code?: string | null, isFinalistCol?: boolean | null): boolean {
  if (isFinalistCol === true) return true;
  if (!code) return false;
  return FINALIST_CODES.has(code);
}

/** Inclusive window to submit or replace the presentation deck (PPT/Slides link) in WIB */
export const FINAL_PPT_OPENS = "2026-09-29T00:00:00+07:00";
export const FINAL_PPT_DEADLINE = "2026-10-02T23:59:59+07:00";

export type FinalPhase = "before" | "open" | "closed";

export function finalPhase(now: Date = new Date()): FinalPhase {
  if (now < new Date(FINAL_PPT_OPENS)) return "before";
  if (now > new Date(FINAL_PPT_DEADLINE)) return "closed";
  return "open";
}
