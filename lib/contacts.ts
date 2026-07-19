import type { CompetitionId } from "./registrations/config";

// Single source of truth for who to contact. The competition modal and the
// /branding/contact page both read from here so a changed number only changes
// in one place.

export const GENERAL_CONTACT = {
  email: "nestui.ft@gmail.com",
  instagram: "https://instagram.com/nest_ui",
  instagramHandle: "@nest_ui",
  linkedin: "https://www.linkedin.com/company/nest-ui/",
} as const;

export interface ContactPerson {
  name: string;
  phone: string;
}

export const COMPETITION_CONTACTS: Record<CompetitionId, ContactPerson[]> = {
  medhack: [
    { name: "Rahel", phone: "0887 5475 115" },
    { name: "Nadzira", phone: "0812 1288 1794" },
  ],
  healthineer: [
    { name: "Josia", phone: "0812 6231 4375" },
    { name: "Enders", phone: "0877 8564 0780" },
  ],
  healthynovation: [
    { name: "Lita", phone: "0895 3604 48081" },
    { name: "Nicholas", phone: "0859 4739 5277" },
  ],
};

// wa.me wants a country-coded, digits-only number. The numbers above are written
// in Indonesian national format (leading 0) — swap that 0 for 62.
export function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}
