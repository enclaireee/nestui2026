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
  studentIdLabel: string; // NIM (undergrad) / NISN (SMA)
  institutionLabel: string; // University / Sekolah
  blurb: string;
  logo: string; // path in /public
  qr: string; // WhatsApp group QR, path in /public
  /** Registration fee tiers, earliest first. See `currentFee`. */
  fees: FeeTier[];
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
    studentIdLabel: "NIM (Student Registration Number)",
    institutionLabel: "University",
    blurb:
      "A team hackathon that challenges participants to develop healthcare-technology-based business solutions.",
    logo: "/medhacklogo.webp",
    qr: "/qrmedhack.png",
    fees: [
      { label: "Early Bird", amount: 200_000, until: "2026-07-27" },
      { label: "Normal", amount: 220_000, until: "2026-08-22" },
    ],
  },
  healthineer: {
    id: "healthineer",
    name: "Healthineer",
    category: "mahasiswa",
    categoryLabel: "Undergraduate",
    minSize: 3,
    maxSize: 5,
    hasMajor: true,
    studentIdLabel: "NIM (Student Registration Number)",
    institutionLabel: "University",
    blurb:
      "A team competition to develop healthcare technology solutions in the form of a scientific paper and prototype.",
    logo: "/healthineerlogo.webp",
    qr: "/qrhealthyneer.png",
    fees: [
      { label: "Early Bird", amount: 175_000, until: "2026-07-19" },
      { label: "Normal", amount: 200_000, until: "2026-07-31" },
      { label: "Extend", amount: 210_000, until: "2026-08-07" },
    ],
  },
  healthynovation: {
    id: "healthynovation",
    name: "Healthynovation",
    category: "sma",
    categoryLabel: "Highschool",
    minSize: 1,
    maxSize: 3,
    hasMajor: false,
    studentIdLabel: "NISN (National Student ID Number)",
    institutionLabel: "School",
    blurb:
      "A scientific paper competition for highschool students that encourages innovative ideas in healthcare.",
    logo: "/healthynovationlogo.webp",
    qr: "/qrhealthynovation.png",
    fees: [
      { label: "Early Bird", amount: 80_000, until: "2026-07-19" },
      { label: "Normal", amount: 100_000, until: "2026-07-31" },
      { label: "Late", amount: 120_000, until: "2026-08-07" },
    ],
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
