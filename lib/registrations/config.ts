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
