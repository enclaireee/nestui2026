"use client";

import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full flex items-center justify-center gap-8 border-t py-8 text-center text-xs">
      <p className="text-muted-foreground">© {year} App</p>
      <ThemeSwitcher />
    </footer>
  );
}
