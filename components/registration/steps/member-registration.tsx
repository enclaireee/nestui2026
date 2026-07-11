"use client";

import { LeaderRegistration } from "./leader-registration";

interface MemberRegistrationProps {
  onNext: () => void;
  onBack: () => void;
  category?: "mahasiswa" | "sma";
}

export function MemberRegistration(props: MemberRegistrationProps) {
  return <LeaderRegistration {...props} isMember={true} />;
}
