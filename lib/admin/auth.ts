import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "./session";

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

// For pages/layouts: redirect to the login screen when unauthenticated.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthed())) redirect("/admin/login");
}
