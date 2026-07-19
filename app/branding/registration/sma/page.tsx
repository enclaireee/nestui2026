import { RegistrationPage } from "@/components/registration/registration-page";

// category="sma" narrows the picker to Healthynovation and swaps the
// undergrad field labels for Kartu Identitas Siswa / Sekolah.
export default function Page() {
  return <RegistrationPage category="sma" />;
}
